// Supabase Edge Function: generate-feedback
// Set your secret with: supabase secrets set OPENAI_API_KEY=... 
// Deploy with: supabase functions deploy generate-feedback

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type CriteriaMatch = { criterion: string; examples: string[] };
type AiFeedback = {
  grammar_issues: string[];
  strengths: string[];
  improvements: string[];
  criteria_matches: CriteriaMatch[];
  suggested_feedback: string;
  overall_score: number;
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { ...corsHeaders } });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const { essay, rubric } = (body as { essay?: string; rubric?: { criteria?: unknown[] } }) ?? {};
  const criteria = Array.isArray(rubric?.criteria) ? rubric?.criteria : null;

  if (typeof essay !== "string" || !criteria || criteria.length === 0) {
    return new Response(
      JSON.stringify({ error: "Missing 'essay' or 'rubric.criteria'" }),
      { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Server misconfiguration: missing OPENAI_API_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  const systemPrompt =
    "You are an experienced English examiner. Grade the essay based on the provided rubric. Return JSON feedback including grammar issues, strengths, improvements, sentences that meet criteria, and an overall score out of 100.";

  const userPayload = {
    essay,
    rubric: { criteria },
    required_response_shape: {
      grammar_issues: ["string"],
      strengths: ["string"],
      improvements: ["string"],
      criteria_matches: [
        { criterion: "string", examples: ["string", "string"] }
      ],
      suggested_feedback: "string",
      overall_score: 0
    }
  };

  // Helper to call OpenAI chat completions
  async function callOpenAI(model: string): Promise<AiFeedback> {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content:
              "Analyze the following input and ONLY return a strict JSON object matching 'required_response_shape'.\n\n" +
              JSON.stringify(userPayload),
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`OpenAI API error (${resp.status}): ${text}`);
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content from OpenAI");
    const parsed = JSON.parse(content) as AiFeedback;
    return parsed;
  }

  try {
    let feedback: AiFeedback | null = null;
    try {
      feedback = await callOpenAI("gpt-4-turbo");
    } catch (_err) {
      // Fallback to 3.5 if model unavailable
      feedback = await callOpenAI("gpt-3.5-turbo");
    }

    return new Response(JSON.stringify(feedback), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
      status: 200,
    });
  } catch (err) {
    console.error("generate-feedback error", err);
    return new Response(
      JSON.stringify({ error: "Failed to generate feedback" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
