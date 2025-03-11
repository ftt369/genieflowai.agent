import { NextApiRequest, NextApiResponse } from 'next';
import { web_search } from '@utils/web_search';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await web_search(query);
    return res.status(200).json(results);
  } catch (error) {
    console.error('Web search API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 