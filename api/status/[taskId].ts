import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCORS, taskStatus } from '../lib/utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCORS(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { taskId } = req.query;

  if (!taskId || typeof taskId !== 'string') {
    return res.status(400).json({ error: 'taskId is required' });
  }

  const status = taskStatus[taskId];

  if (!status) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.status(200).json(status);
}
