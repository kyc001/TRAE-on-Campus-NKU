import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCORS, taskStatus } from './lib/utils.js';
import deepseekService from './services/ai.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (handleCORS(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, topic, expectedTime } = req.body;

    const safeText = typeof text === 'string' ? text : '';
    const safeTopic = typeof topic === 'string' ? topic : '';
    const safeExpectedTime = typeof expectedTime === 'string' ? expectedTime : undefined;

    if (!safeText && !safeTopic) {
      return res.status(400).json({ error: 'text or topic is required' });
    }

    // 限制文本长度避免 AI 处理超时（保留前 8000 字符）
    const maxTextLength = 8000;
    const truncatedText = safeText.length > maxTextLength
      ? safeText.substring(0, maxTextLength) + '\n\n（文本已截断，仅处理前 8000 字）'
      : safeText;

    const taskId = Date.now().toString();
    taskStatus[taskId] = { status: 'processing', progress: 0 };

    const result = await deepseekService.generateKnowledgeNetwork(truncatedText, safeTopic, safeExpectedTime);
    taskStatus[taskId] = { status: 'completed', progress: 100, result };

    res.status(200).json({ taskId, result });
  } catch (error: any) {
    console.error('Error:', error);
    const taskId = Date.now().toString();
    taskStatus[taskId] = {
      status: 'failed',
      progress: 0,
      error: error?.message || 'Internal server error',
    };
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export const config = {
  maxDuration: 300, // Pro 计划可用 300 秒；免费计划会自动限制为 10 秒
};
