import { Request, Response } from 'express';
import documentService from '../services/document.js';

// 任务状态存储（简单实现，生产环境建议使用数据库）
const taskStatus: Record<string, any> = {};

const processController = {
  // 上传文件
  uploadFile: (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = req.file;
      res.json({
        fileId: file.filename,
        fileName: file.originalname,
        fileSize: file.size
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  },

  // 处理文档
  processDocument: async (req: Request, res: Response) => {
    try {
      const { fileId, text, model = 'deepseek' } = req.body;
      
      if (!fileId && !text) {
        return res.status(400).json({ error: 'Either fileId or text is required' });
      }

      // 生成任务ID
      const taskId = Date.now().toString();
      taskStatus[taskId] = { status: 'processing', progress: 0 };

      // 异步处理文档
      documentService.processDocument(fileId, text, model)
        .then((result: any) => {
          taskStatus[taskId] = {
            status: 'completed',
            progress: 100,
            result: result
          };
        })
        .catch((error: Error) => {
          taskStatus[taskId] = {
            status: 'failed',
            progress: 0,
            error: error.message
          };
        });

      // 返回任务ID，让前端轮询状态
      res.json({
        taskId: taskId
      });
    } catch (error) {
      console.error('Error processing document:', error);
      res.status(500).json({ error: 'Failed to start document processing' });
    }
  },

  // 获取处理状态
  getStatus: (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (!taskStatus[id]) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // 直接返回任务状态（与前端 TaskStatus 类型匹配）
      res.json(taskStatus[id]);
    } catch (error) {
      console.error('Error getting task status:', error);
      res.status(500).json({ error: 'Failed to get task status' });
    }
  }
};

// 导出控制器
export default processController;
