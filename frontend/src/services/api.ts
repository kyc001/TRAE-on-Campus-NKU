import axios from 'axios';
import { KnowledgeNode, UploadResponse, TaskStatus } from '../types';

// API基础URL
// - 本地开发：默认使用相对路径 /api（由 Vite proxy 转发到 http://localhost:3000）
// - 生产部署：通过 VITE_API_URL 指向后端（例如 https://xxx.up.railway.app/api）
const envApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const baseURL = envApiUrl.length > 0 ? envApiUrl.replace(/\/+$/, '') : '/api';

// 创建axios实例
const api = axios.create({
  baseURL,
  timeout: 60000, // 60秒超时
  headers: {
    'Content-Type': 'application/json'
  }
});

// 上传文件
export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post<UploadResponse>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// 处理文档，生成知识网络
export const processDocument = async (fileId?: string, text?: string, model?: string, params?: { topic?: string; expectedTime?: string }): Promise<string> => {
  const response = await api.post<any>('/process', {
    // Vercel Functions 方案中不依赖 fileId 持久化；保留字段仅用于兼容
    fileId,
    text,
    model,
    ...params,
  });

  if (response.data && typeof response.data.taskId === 'string') {
    return response.data.taskId;
  }

  // 兼容：若后端直接返回 result，这里返回一个伪 taskId，调用方会优先使用 result
  return 'direct';
};

// 获取任务状态
export const getTaskStatus = async (taskId: string): Promise<TaskStatus> => {
  const response = await api.get<TaskStatus>(`/status/${taskId}`);
  return response.data;
};

// 轮询任务状态，直到完成或失败
export const pollTaskStatus = async (taskId: string): Promise<KnowledgeNode> => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const status = await getTaskStatus(taskId);
        
        if (status.status === 'completed' && status.result) {
          clearInterval(interval);
          resolve(status.result);
        } else if (status.status === 'failed') {
          clearInterval(interval);
          reject(new Error(status.error || '任务执行失败'));
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, 1000); // 每秒轮询一次
  });
};

// 生成知识网络（综合方法）
export const generateKnowledgeNetwork = async (fileId?: string, text?: string, model?: string, params?: { topic?: string; expectedTime?: string }): Promise<KnowledgeNode> => {
  // 优先走同步返回：/process -> { result }
  const response = await api.post<any>('/process', {
    fileId,
    text,
    model,
    ...params,
  });

  if (response.data && response.data.result) {
    return response.data.result as KnowledgeNode;
  }

  // 兼容旧实现：拿 taskId 再轮询
  const taskId = response.data?.taskId as string | undefined;
  if (!taskId) {
    throw new Error('后端响应缺少 result/taskId');
  }
  return await pollTaskStatus(taskId);
};

// 扩展节点的子节点
export const expandNode = async (nodeTitle: string, nodeSummary?: string, model?: string): Promise<KnowledgeNode> => {
  const response = await api.post<any>('/expand-node', {
    nodeTitle,
    nodeSummary,
    model
  });

  if (response.data && response.data.result) {
    return response.data.result as KnowledgeNode;
  }

  const taskId = response.data?.taskId as string | undefined;
  if (!taskId) {
    throw new Error('后端响应缺少 result/taskId');
  }
  return await pollTaskStatus(taskId);
};

// 导出知识网络为JSON
export const exportKnowledgeNetwork = (data: KnowledgeNode): void => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `knowledge-network-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 解析JSON文件
export const parseJsonFile = async (file: File): Promise<KnowledgeNode> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(new Error('JSON格式错误'));
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsText(file);
  });
};

// 问AI解释知识点
export const askAI = async (nodeTitle: string, nodeSummary?: string, context?: string, model?: string): Promise<string> => {
  const response = await api.post<any>('/ask-ai', {
    nodeTitle,
    nodeSummary,
    context,
    model
  });

  const directResult = response.data?.result;
  if (directResult) {
    if (typeof directResult === 'object' && 'explanation' in directResult) {
      return (directResult as any).explanation || '未能获取解释';
    }
    return typeof directResult === 'string' ? directResult : '未能获取解释';
  }

  const taskId = response.data?.taskId as string | undefined;
  if (!taskId) {
    throw new Error('后端响应缺少 result/taskId');
  }

  const polled = await pollTaskStatus(taskId);
  if (polled && typeof polled === 'object' && 'explanation' in polled) {
    return (polled as any).explanation || '未能获取解释';
  }
  return typeof polled === 'string' ? polled : '未能获取解释';
};
