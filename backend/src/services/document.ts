import fs from 'fs';
import path from 'path';
import deepseekService from './ai.js';
import doubaoService from './doubao.js';

// 文档处理服务
const documentService = {
  // 处理文档，生成知识网络
  processDocument: async (fileId?: string, text?: string, model: string = 'deepseek', topic?: string, expectedTime?: string): Promise<any> => {
    try {
      let content = '';
      
      if (fileId) {
        // 从上传的文件中读取内容
        const filePath = path.join(process.cwd(), 'uploads', fileId);
        
        if (!fs.existsSync(filePath)) {
          throw new Error('File not found');
        }

        const fileExtension = path.extname(filePath).toLowerCase();
        
        if (fileExtension === '.pdf') {
          // 动态导入 pdf-parse
          const pdfParseModule = await import('pdf-parse');
          const pdfParse = pdfParseModule.default || pdfParseModule;
          const dataBuffer = fs.readFileSync(filePath);
          const pdfData = await pdfParse(dataBuffer);
          content = pdfData.text;
        } else if (fileExtension === '.txt') {
          // 读取文本文件
          content = fs.readFileSync(filePath, 'utf-8');
        } else {
          throw new Error('Unsupported file type. Only .pdf and .txt files are supported.');
        }
      } else if (text) {
        content = text;
      } else {
        content = '';
      }

      // 根据选择的模型调用不同的 API
      let result;
      if (model === 'doubao') {
        result = await doubaoService.generateKnowledgeNetwork(content, topic, expectedTime);
      } else {
        result = await deepseekService.generateKnowledgeNetwork(content, topic, expectedTime);
      }
      
      return result;
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  },

  // 扩展节点的子节点
  expandNode: async (nodeTitle: string, nodeSummary?: string, model: string = 'deepseek'): Promise<any> => {
    try {
      // 根据选择的模型调用不同的 API
      let result;
      if (model === 'doubao') {
        result = await doubaoService.expandNode(nodeTitle, nodeSummary);
      } else {
        result = await deepseekService.expandNode(nodeTitle, nodeSummary);
      }
      
      return result;
    } catch (error) {
      console.error('Error expanding node:', error);
      throw error;
    }
  },

  // 问AI解释知识点
  askAI: async (nodeTitle: string, nodeSummary?: string, context?: string, model: string = 'deepseek'): Promise<any> => {
    try {
      // 根据选择的模型调用不同的 API
      let result;
      if (model === 'doubao') {
        result = await doubaoService.explainNode(nodeTitle, nodeSummary, context);
      } else {
        result = await deepseekService.explainNode(nodeTitle, nodeSummary, context);
      }
      
      return result;
    } catch (error) {
      console.error('Error asking AI:', error);
      throw error;
    }
  }
};

export default documentService;
