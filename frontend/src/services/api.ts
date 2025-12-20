import axios from 'axios';
import { KnowledgeNode, UploadResponse, TaskStatus } from '../types';

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
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
export const processDocument = async (fileId?: string, text?: string, model?: string): Promise<string> => {
  const response = await api.post<{ taskId: string }>('/process', {
    fileId,
    text,
    model
  });
  
  return response.data.taskId;
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
export const generateKnowledgeNetwork = async (fileId?: string, text?: string, model?: string): Promise<KnowledgeNode> => {
  // 调用后端API处理文档
  const taskId = await processDocument(fileId, text, model);
  
  // 轮询任务状态，直到完成或失败
  const result = await pollTaskStatus(taskId);
  
  return result;
};
