import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const key = process.env.OPENAI_API_KEY || '';
  const truncated = key ? key.slice(0, 8) + '...' : null;
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({
    ok: true,
    env: 'serverless',
    openaiKeyPresent: !!key,
    openaiKeyStartsWith: truncated,
    timestamp: new Date().toISOString()
  }));
}
