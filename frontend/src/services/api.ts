import axios from 'axios';
import { KnowledgeNode, UploadResponse, TaskStatus } from '../types';

// API基础URL - Vercel部署时使用相对路径
const baseURL = '/api';

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
  const response = await api.post<{ taskId: string }>('/process', {
    fileId,
    text,
    model,
    ...params
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
export const generateKnowledgeNetwork = async (fileId?: string, text?: string, model?: string, params?: { topic?: string; expectedTime?: string }): Promise<KnowledgeNode> => {
  // 调用后端API处理文档
  const taskId = await processDocument(fileId, text, model, params);
  
  // 轮询任务状态，直到完成或失败
  const result = await pollTaskStatus(taskId);
  
  return result;
};

// 扩展节点的子节点
export const expandNode = async (nodeTitle: string, nodeSummary?: string, model?: string): Promise<KnowledgeNode> => {
  const response = await api.post<{ taskId: string }>('/expand-node', {
    nodeTitle,
    nodeSummary,
    model
  });
  
  const taskId = response.data.taskId;
  const result = await pollTaskStatus(taskId);
  
  // 返回扩展后的完整节点对象
  return result;
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
  const response = await api.post<{ taskId: string }>('/ask-ai', {
    nodeTitle,
    nodeSummary,
    context,
    model
  });
  
  const taskId = response.data.taskId;
  const result = await pollTaskStatus(taskId);
  
  // 返回AI的解释文本（result是包含explanation字段的对象）
  if (result && typeof result === 'object' && 'explanation' in result) {
    return (result as any).explanation || '未能获取解释';
  }
  return typeof result === 'string' ? result : '未能获取解释';
};
