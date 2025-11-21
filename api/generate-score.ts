import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { essayText, rubricCriteria } = req.body;

    if (!essayText || !rubricCriteria) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const response = await openai.chat.completions.create({
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
      temperature: 0.2,
      max_tokens: 5,
    });

    const scoreText = response.choices[0]?.message?.content?.trim();
    const score = parseInt(scoreText || '0', 10);
    
    if (isNaN(score) || score < 0 || score > 100) {
      throw new Error('Invalid score returned');
    }

    return res.status(200).json({ score });
  } catch (error: any) {
    console.error('Score Generation Error:', error);
    
    if (error?.status === 401) {
      return res.status(401).json({ error: 'OpenAI API authentication failed' });
    }
    if (error?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    return res.status(500).json({ 
      error: error?.message || 'Failed to generate score' 
    });
  }
}
