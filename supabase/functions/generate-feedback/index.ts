// Supabase Edge Function: generate-feedback
// Deploy with: supabase functions deploy generate-feedback --no-verify-jwt (or configure JWT as needed)

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

  const { essay, rubric } = (body as { essay?: string; rubric?: Record<string, unknown> }) ?? {};

  // Placeholder response (Phase 1). We'll integrate OpenAI in Phase 2.
  const result = {
    grammar_issues: [] as string[],
    strengths: ["Placeholder strength"],
    improvements: ["Placeholder improvement"],
    suggested_feedback: "This is a test feedback message.",
    overall_score: 80,
    echo: {
      essay_preview: (typeof essay === 'string' ? essay.slice(0, 100) : null),
      rubric_present: !!rubric,
    }
  };

  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
    status: 200,
  });
});
