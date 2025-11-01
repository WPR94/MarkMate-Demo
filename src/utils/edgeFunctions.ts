import { supabase } from '../lib/supabaseClient';

type CriteriaMatch = { criterion: string; examples: string[] };

export type AiFeedback = {
  grammar_issues: string[];
  strengths: string[];
  improvements: string[];
  criteria_matches: CriteriaMatch[];
  suggested_feedback: string;
  overall_score: number;
};

/**
 * Invokes the generate-feedback Edge Function with authentication.
 * Requires a logged-in user session.
 */
export async function generateAiFeedback(
  essay: string,
  rubric: { criteria: unknown[] }
): Promise<AiFeedback> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('You must be logged in to generate AI feedback');
  }

  const response = await supabase.functions.invoke('generate-feedback', {
    body: { essay, rubric },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (response.error) {
    throw new Error(response.error.message || 'Failed to generate feedback');
  }

  return response.data as AiFeedback;
}
