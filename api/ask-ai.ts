import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCORS, taskStatus } from './lib/utils';

async function getAIService(model: string = 'deepseek') {
  if (model === 'doubao') {
    const { default: doubaoService } = await import('../backend/src/services/doubao.js');
    return doubaoService;
  } else {
    const { default: deepseekService } = await import('../backend/src/services/ai.js');
    return deepseekService;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (handleCORS(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { nodeTitle, nodeSummary, context, model = 'deepseek' } = req.body;

    if (!nodeTitle) {
      return res.status(400).json({ error: 'nodeTitle is required' });
    }

    const taskId = Date.now().toString();
    taskStatus[taskId] = { status: 'processing', progress: 0 };

    (async () => {
      try {
        const aiService = await getAIService(model);
        const result = await aiService.explainNode(nodeTitle, nodeSummary, context);
        
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
    console.error('Error asking AI:', error);
    res.status(500).json({ error: 'Failed to get AI explanation: ' + error.message });
  }
}
