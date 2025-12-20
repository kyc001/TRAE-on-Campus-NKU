import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCORS, taskStatus } from './lib/utils';

// 动态导入backend的服务 - 使用相对路径不带.js
async function getAIService(model: string = 'deepseek') {
  if (model === 'doubao') {
    const doubaoModule = await import('../backend/src/services/doubao');
    return doubaoModule.default;
  } else {
    const deepseekModule = await import('../backend/src/services/ai');
    return deepseekModule.default;
  }
}

async function getPDFParse() {
  // 使用require方式导入pdf-parse
  const { createRequire } = await import('module');
  const require = createRequire(import.meta.url);
  return require('pdf-parse');
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
    const { text, model = 'deepseek', topic, expectedTime } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    // 生成任务ID
    const taskId = Date.now().toString();
    taskStatus[taskId] = { status: 'processing', progress: 0 };

    // 异步处理
    (async () => {
      try {
        const aiService = await getAIService(model);
        const result = await aiService.generateKnowledgeNetwork(text, topic, expectedTime);
        
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
    console.error('Error processing document:', error);
    res.status(500).json({ error: 'Failed to process document: ' + error.message });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
