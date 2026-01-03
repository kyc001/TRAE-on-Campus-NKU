import type { VercelResponse } from '@vercel/node';

// 任务状态存储（使用内存，Vercel Functions之间共享）
export const taskStatus: Record<string, any> = {};

// CORS中间件
export function setCORS(res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
}

export function handleCORS(req: any, res: any) {
  setCORS(res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  return false;
}

// ========== 错误处理工具 ==========

/**
 * 自定义 API 错误类
 * 用于在业务逻辑中抛出带有状态码的错误
 */
export class APIError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    
    // 保持正确的原型链
    Object.setPrototypeOf(this, APIError.prototype);
  }

  /**
   * 常用错误快捷方法
   */
  static badRequest(message: string, code?: string) {
    return new APIError(400, message, code || 'BAD_REQUEST');
  }

  static unauthorized(message: string = '未授权访问') {
    return new APIError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message: string = '禁止访问') {
    return new APIError(403, message, 'FORBIDDEN');
  }

  static notFound(message: string = '资源不存在') {
    return new APIError(404, message, 'NOT_FOUND');
  }

  static internal(message: string = '服务器内部错误') {
    return new APIError(500, message, 'INTERNAL_ERROR');
  }
}

/**
 * 统一错误处理函数
 * 将错误转换为标准化的 JSON 响应
 */
export function handleError(error: unknown, res: VercelResponse): void {
  console.error('API Error:', error);

  // 处理自定义 APIError
  if (error instanceof APIError) {
    res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
    });
    return;
  }

  // 处理原生 Error
  if (error instanceof Error) {
    // 特殊处理 JSON 解析错误
    if (error.message.includes('JSON')) {
      res.status(400).json({
        error: 'Invalid JSON format',
        code: 'INVALID_JSON',
      });
      return;
    }

    // 其他错误作为内部错误处理
    res.status(500).json({
      error: error.message || 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
    return;
  }

  // 未知错误类型
  res.status(500).json({
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  });
}

/**
 * 请求参数验证辅助函数
 */
export function validateRequired(
  params: Record<string, any>,
  requiredFields: string[]
): void {
  const missing = requiredFields.filter(
    (field) => params[field] === undefined || params[field] === null || params[field] === ''
  );

  if (missing.length > 0) {
    throw APIError.badRequest(
      `Missing required fields: ${missing.join(', ')}`,
      'MISSING_REQUIRED_FIELDS'
    );
  }
}
