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
    const { text, model = 'deepseek', topic, expectedTime } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const taskId = Date.now().toString();
    taskStatus[taskId] = { status: 'processing', progress: 0 };

    // 异步处理
    (async () => {
      try {
        const result = await deepseekService.generateKnowledgeNetwork(text, topic, expectedTime);
        taskStatus[taskId] = {
          status: 'completed',
          progress: 100,
          result: result
        };
      } catch (error: any) {
        taskStatus[taskId] = {
          status: 'failed',
          progress: 0,
          error: error.message
        };
      }
    })();

    res.status(200).json({ taskId });
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed: ' + error.message });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
