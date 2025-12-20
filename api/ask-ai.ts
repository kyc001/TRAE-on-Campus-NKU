import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCORS, taskStatus } from './lib/utils';
import deepseekService from './services/ai';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (handleCORS(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nodeTitle, nodeSummary, context } = req.body;

    if (!nodeTitle) {
      return res.status(400).json({ error: 'nodeTitle is required' });
    }

    const taskId = Date.now().toString();
    taskStatus[taskId] = { status: 'processing', progress: 0 };

    deepseekService.explainNode(nodeTitle, nodeSummary, context)
      .then(result => {
        taskStatus[taskId] = {
          status: 'completed',
          progress: 100,
          result: result
        };
      })
      .catch((error: any) => {
        taskStatus[taskId] = {
          status: 'failed',
          progress: 0,
          error: error.message || 'Unknown error'
        };
      });

    res.status(200).json({ taskId });
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export const config = {
  maxDuration: 60,
};

