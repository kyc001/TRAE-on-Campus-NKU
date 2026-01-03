import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCORS, taskStatus, APIError, handleError } from './lib/utils.js';
import deepseekService from './services/ai.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (handleCORS(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const { text, topic, expectedTime } = req.body;

    const safeText = typeof text === 'string' ? text : '';
    const safeTopic = typeof topic === 'string' ? topic : '';
    const safeExpectedTime = typeof expectedTime === 'string' ? expectedTime : undefined;

    // 使用 APIError 进行参数验证
    if (!safeText && !safeTopic) {
      throw APIError.badRequest('text 或 topic 至少需要提供一个', 'MISSING_CONTENT');
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
  } catch (error: unknown) {
    // 使用统一错误处理
    handleError(error, res);
  }
}

export const config = {
  maxDuration: 300, // Pro 计划可用 300 秒；免费计划会自动限制为 10 秒
};
