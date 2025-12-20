import fs from 'fs';
import path from 'path';
import axios from 'axios';

// 配置文件（实际项目中应使用环境变量或配置文件）
const config = {
  // DeepSeek API配置
  deepseekApiUrl: 'https://api.deepseek.com/v1/chat/completions',
  deepseekApiKey: 'sk-3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', // 实际项目中应从环境变量获取
};

const documentService = {
  // 处理文档
  processDocument: async (fileId?: string, text?: string): Promise<any> => {
    try {
      let documentContent: string;
      
      if (fileId) {
        // 1. 调用文档理解API解析文件
        documentContent = await documentService.parseDocument(fileId);
      } else if (text) {
        // 直接使用提供的文本
        documentContent = text;
      } else {
        throw new Error('Either fileId or text is required');
      }

      // 2. 调用大模型生成结构化JSON
      const structuredResult = await documentService.generateStructuredResult(documentContent);
      
      return structuredResult;
    } catch (error) {
      console.error('Error processing document:', error);
      throw error;
    }
  },

  // 解析文档（调用文档理解API）
  parseDocument: async (fileId: string): Promise<string> => {
    try {
      // 实际项目中，这里应该调用文档理解API
      // 由于是Hackathon项目，我们先返回mock数据
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 返回mock文档内容
      return `课程名称：计算机网络
模块A：网络基础
核心概念A1：OSI七层模型
子概念A1.1：物理层
子概念A1.2：数据链路层
子概念A1.3：网络层
子概念A1.4：传输层
子概念A1.5：会话层
子概念A1.6：表示层
子概念A1.7：应用层
核心概念A2：TCP/IP协议族
子概念A2.1：网络接口层
子概念A2.2：网际层
子概念A2.3：传输层
子概念A2.4：应用层
模块B：网络协议
核心概念B1：TCP协议
子概念B1.1：三次握手
子概念B1.2：四次挥手
子概念B1.3：流量控制
子概念B1.4：拥塞控制
核心概念B2：UDP协议
子概念B2.1：无连接服务
子概念B2.2：不可靠传输
子概念B2.3：应用场景`;
    } catch (error) {
      console.error('Error parsing document:', error);
      throw error;
    }
  },

  // 生成结构化结果（调用DeepSeek大模型API）
  generateStructuredResult: async (content: string): Promise<any> => {
    try {
      // 构建prompt
      const messages = [
        {
          "role": "system",
          "content": "你是一名大学课程助教，正在帮助学生准备期末复习。请将课程内容提炼为结构化的知识网络，使用JSON格式输出。"
        },
        {
          "role": "user",
          "content": `下面是一门课程的 PPT / 讲义内容，请你完成：
1. 不要逐页复述内容
2. 提炼“复习所需的知识结构”
3. 用「课程 → 模块 → 核心概念 → 子概念」组织
4. 层级最多 3 层
5. 每个节点只用一句话概括
6. 忽略细枝末节和例子

请输出为 JSON 树结构，字段包括：
- title
- summary
- children

课程内容：
${content}`
        }
      ];

      // 调用DeepSeek API
      const response = await axios.post(config.deepseekApiUrl, {
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.3,
        max_tokens: 2000,
        response_format: {
          type: "json_object"
        }
      }, {
        headers: {
          "Authorization": `Bearer ${config.deepseekApiKey}`,
          "Content-Type": "application/json"
        }
      });

      // 解析API响应
      const result = response.data.choices[0].message.content;
      const structuredResult = JSON.parse(result);
      
      return structuredResult;
    } catch (error) {
      console.error('Error generating structured result:', error);
      // 如果API调用失败，返回mock数据作为降级方案
      return {
        "title": "计算机网络",
        "summary": "计算机网络课程主要介绍网络基础、协议和应用",
        "children": [
          {
            "title": "网络基础",
            "summary": "计算机网络的基本概念和模型",
            "children": [
              {
                "title": "OSI七层模型",
                "summary": "开放式系统互联参考模型，将网络通信分为七层",
                "children": []
              },
              {
                "title": "TCP/IP协议族",
                "summary": "互联网使用的协议套件，分为四层",
                "children": []
              }
            ]
          },
          {
            "title": "网络协议",
            "summary": "网络通信中使用的各种协议",
            "children": [
              {
                "title": "TCP协议",
                "summary": "传输控制协议，提供可靠的面向连接的通信",
                "children": []
              },
              {
                "title": "UDP协议",
                "summary": "用户数据报协议，提供不可靠的无连接通信",
                "children": []
              }
            ]
          }
        ]
      };
    }
  }
};

// 使用export default语法以便在controllers中导入
const service = documentService;
export default service;
