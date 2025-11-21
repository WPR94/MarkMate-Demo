import OpenAI from 'openai';

// Initialize OpenAI client with environment variable
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.warn('⚠️ OpenAI API Key not configured. Set VITE_OPENAI_API_KEY in .env.local');
}

const openaiClient = new OpenAI({
  apiKey: apiKey || 'sk-invalid',
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

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
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an experienced GCSE English teacher and examiner${examBoard ? ` for ${examBoard}` : ''}. Provide warm, authentic feedback as if speaking face-to-face with your student.

📋 YOUR TASK:
1. Assess against GCSE Assessment Objectives (AO1-AO4 where applicable)
2. Assign band levels (1=emerging, 2-3=developing, 4-5=secure, 6=exceptional)
3. Quote specific evidence from their writing
4. Write conversationally - vary sentence starters, sound human

✨ TONE:
- Encouraging yet honest - celebrate wins, be constructive about gaps
- Specific over generic ("Your metaphor 'time is a thief' creates..." not "Good imagery")
- Natural speech patterns ("I really liked..." "Have you considered..." "One thing to work on...")
- Avoid: "overall", "in conclusion", "the student demonstrates", robotic lists

🎯 ASSESSMENT OBJECTIVES (adapt to rubric):
- AO1: Ideas, themes, purpose
- AO2: Language, structure, form techniques
- AO3: Context (if relevant)
- AO4: SPaG (spelling, punctuation, grammar)

📊 BAND DESCRIPTORS:
Band 6 (90-100%): Perceptive, sophisticated, compelling
Band 5 (75-89%): Clear, effective, well-developed
Band 4 (60-74%): Explained, some development, generally clear
Band 3 (45-59%): Attempts made, simple ideas, basic clarity
Band 2 (30-44%): Limited, unclear, minimal development
Band 1 (0-29%): Very limited, unclear purpose`,
        },
        {
          role: 'user',
          content: `Assess this essay using GCSE standards. Provide detailed analysis.

📋 RUBRIC:
${rubricCriteria}

📝 ESSAY:
${essayText}

💬 Provide:
1. 2-3 specific strengths with quotes
2. 2-3 development areas with examples
3. Grammar/SPaG issues if significant
4. Natural summary (300-400 words max)

Be specific. Quote their work. Sound like a real teacher, not a robot.`,
        },
      ],
      temperature: 0.85, // More natural variation
      max_tokens: 800, // Room for detailed analysis
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No feedback generated');
    }
    return content;
  } catch (error: any) {
    console.error('❌ OpenAI Feedback Generation Error:', error);
    const message = error?.message || 'Unknown error';
    if (message.includes('401')) {
      throw new Error('API key is invalid or has been revoked. Check .env.local');
    }
    if (message.includes('429')) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    if (message.includes('401') || message.includes('invalid')) {
      throw new Error('OpenAI API authentication failed. Verify your API key is valid.');
    }
    throw new Error(`Failed to generate feedback: ${message}`);
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
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a GCSE examiner. Assess the essay against GCSE bands (1-6) and convert to percentage.

BAND CONVERSION:
- Band 6: 90-100% (Perceptive, sophisticated)
- Band 5: 75-89% (Clear, effective)
- Band 4: 60-74% (Explained, developed)
- Band 3: 45-59% (Attempted, simple)
- Band 2: 30-44% (Limited, unclear)
- Band 1: 0-29% (Very limited)

Return ONLY the numeric percentage (0-100). No text.`,
        },
        {
          role: 'user',
          content: `Score this essay 0-100 based on GCSE bands.

RUBRIC:
${rubricCriteria}

ESSAY:
${essayText}`,
        },
      ],
      temperature: 0.2, // Very consistent scoring
      max_tokens: 5,
    });

    const scoreText = response.choices[0]?.message?.content?.trim();
    const score = parseInt(scoreText || '0', 10);
    
    if (isNaN(score) || score < 0 || score > 100) {
      throw new Error('Invalid score returned');
    }
    return score;
  } catch (error: any) {
    console.error('❌ OpenAI Score Generation Error:', error);
    const message = error?.message || 'Unknown error';
    if (message.includes('401')) {
      throw new Error('API key is invalid or has been revoked. Check .env.local');
    }
    if (message.includes('429')) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    throw new Error(`Failed to generate score: ${message}`);
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
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a senior GCSE examiner${examBoard ? ` for ${examBoard}` : ''}. Provide detailed band analysis.

Return ONLY valid JSON with this structure:
{
  "overall_band": number (1-6),
  "overall_score": number (0-100),
  "ao_bands": [
    {"ao": "AO1", "band": number (1-6), "comment": "brief comment"},
    {"ao": "AO2", "band": number (1-6), "comment": "brief comment"}
  ],
  "justification": "2-3 sentence explanation of overall band"
}

BAND CONVERSION: Band 1=0-29%, Band 2=30-44%, Band 3=45-59%, Band 4=60-74%, Band 5=75-89%, Band 6=90-100%`,
        },
        {
          role: 'user',
          content: `Analyze this essay's GCSE band level.

RUBRIC:
${rubricCriteria}

ESSAY:
${essayText}

Return JSON only.`,
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No band analysis generated');
    }
    
    return JSON.parse(content);
  } catch (error: any) {
    console.error('❌ Band Analysis Error:', error);
    throw new Error(`Failed to generate band analysis: ${error?.message || 'Unknown error'}`);
  }
}

export default openaiClient;
