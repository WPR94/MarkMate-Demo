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
 * Generate AI feedback for an essay
 * @param essayText - The essay content to analyze
 * @param rubricCriteria - The grading rubric criteria
 * @returns Promise with AI-generated feedback
 */
export async function generateEssayFeedback(
  essayText: string,
  rubricCriteria: string
): Promise<string> {
  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert educator providing constructive feedback on student essays. 
          Be specific, encouraging, and actionable. Format your feedback clearly with sections for:
          - Strengths (what the student did well)
          - Areas for Improvement (constructive suggestions)
          - Action Steps (concrete next steps)`,
        },
        {
          role: 'user',
          content: `Please grade and provide feedback on this essay using the following rubric:
          
          RUBRIC:
          ${rubricCriteria}
          
          ESSAY:
          ${essayText}
          
          Provide detailed, helpful feedback that follows the rubric.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
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
 * Generate an overall score for an essay (0-100)
 * @param essayText - The essay content
 * @param rubricCriteria - The grading rubric
 * @returns Promise with numeric score
 */
export async function generateEssayScore(
  essayText: string,
  rubricCriteria: string
): Promise<number> {
  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert educator. Return ONLY a number between 0-100 representing the essay score based on the rubric.
          Do not include any other text, just the number.`,
        },
        {
          role: 'user',
          content: `Score this essay on a scale of 0-100 using this rubric:
          
          RUBRIC:
          ${rubricCriteria}
          
          ESSAY:
          ${essayText}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 10,
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

export default openaiClient;
