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
    const { essayText, rubricCriteria, examBoard } = req.body;

    if (!essayText || !rubricCriteria) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const response = await openai.chat.completions.create({
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
    
    const analysis = JSON.parse(content);
    return res.status(200).json(analysis);
  } catch (error: any) {
    console.error('Band Analysis Error:', error);
    
    if (error?.status === 401) {
      return res.status(401).json({ error: 'OpenAI API authentication failed' });
    }
    if (error?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }
    
    return res.status(500).json({ 
      error: error?.message || 'Failed to generate band analysis' 
    });
  }
}
