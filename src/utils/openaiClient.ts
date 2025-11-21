// Serverless function API endpoints (secure - API key stays on server)
const API_BASE = import.meta.env.DEV 
  ? 'http://localhost:5173/api' // Vite will proxy in dev
  : '/api'; // Production uses Vercel serverless functions

/**
 * Enhanced feedback structure returned by AI
 */
export interface EnhancedFeedback {
  overall_band: number; // 1-6 GCSE band
  overall_score: number; // 0-100 percentage
  ao_analysis: Array<{
    ao: string; // e.g., "AO1", "AO2"
    band: number; // 1-6
    evidence: string; // Quote from essay
    comment: string; // Teacher comment
  }>;
  strengths: string[];
  improvements: string[];
  grammar_issues: string[];
  suggested_feedback: string; // Natural teacher voice summary
}

/**
 * Generate AI feedback for an essay with GCSE band analysis
 * @param essayText - The essay content to analyze
 * @param rubricCriteria - The grading rubric criteria
 * @param examBoard - Optional exam board (AQA, Edexcel, OCR, WJEC)
 * @returns Promise with structured feedback object
 */
export async function generateEssayFeedback(
  essayText: string,
  rubricCriteria: string,
  examBoard?: string
): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/generate-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ essayText, rubricCriteria, examBoard }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate feedback');
    }

    const data = await response.json();
    return data.feedback;
  } catch (error: any) {
    console.error('❌ OpenAI Feedback Generation Error:', error);
    throw new Error(error?.message || 'Connection error. Please try again.');
  }
}

/**
 * Generate GCSE band-level score with justification
 * @param essayText - The essay content
 * @param rubricCriteria - The grading rubric
 * @returns Promise with numeric score (0-100)
 */
export async function generateEssayScore(
  essayText: string,
  rubricCriteria: string
): Promise<number> {
  try {
    const response = await fetch(`${API_BASE}/generate-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ essayText, rubricCriteria }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate score');
    }

    const data = await response.json();
    return data.score;
  } catch (error: any) {
    console.error('❌ Score Generation Error:', error);
    throw new Error(error?.message || 'Connection error. Please try again.');
  }
}

/**
 * Generate detailed band analysis with Assessment Objective breakdown
 * @param essayText - The essay content
 * @param rubricCriteria - The grading rubric
 * @param examBoard - Optional exam board
 * @returns Promise with detailed band analysis
 */
export async function generateBandAnalysis(
  essayText: string,
  rubricCriteria: string,
  examBoard?: string
): Promise<{
  overall_band: number;
  overall_score: number;
  ao_bands: Array<{ ao: string; band: number; comment: string }>;
  justification: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/generate-band-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ essayText, rubricCriteria, examBoard }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate band analysis');
    }

    return await response.json();
  } catch (error: any) {
    console.error('❌ Band Analysis Error:', error);
    throw new Error(error?.message || 'Connection error. Please try again.');
  }
}
