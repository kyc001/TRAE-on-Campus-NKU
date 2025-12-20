// 知识节点类型
export interface KnowledgeNode {
  title: string;
  summary: string;
  children: KnowledgeNode[];
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// 文件上传响应类型
export interface UploadResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
}

// 任务状态类型
export interface TaskStatus {
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  result?: KnowledgeNode;
  error?: string;
}
