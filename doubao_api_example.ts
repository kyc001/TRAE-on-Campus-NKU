#!/usr/bin/env node
"""
豆包API调用示例（TypeScript版本）

本示例展示了如何使用TypeScript调用豆包API进行文本生成和对话。

使用前需要：
1. 访问 https://console.byteintl.com/ 注册并获取API Key
2. 安装依赖：npm install axios
"""

import axios from 'axios';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: Message[];
  temperature: number;
  max_tokens?: number;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: Message;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  id: string;
  created: number;
  model: string;
}

interface KnowledgeNode {
  title: string;
  summary: string;
  children: KnowledgeNode[];
}

class DoubaoAPI {
  private apiKey: string;
  private baseURL: string;
  private headers: Record<string, string>;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.doubao.com/v1/chat/completions';
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
  }

  /**
   * 调用豆包API进行对话补全
   */
  async chatCompletion(
    messages: Message[],
    model: string = 'doubao-pro-32k',
    temperature: number = 0.7
  ): Promise<ChatCompletionResponse> {
    const payload: ChatCompletionRequest = {
      model,
      messages,
      temperature,
      max_tokens: 2048
    };

    try {
      const response = await axios.post<ChatCompletionResponse>(
        this.baseURL,
        payload,
        {
          headers: this.headers,
          timeout: 30000
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API调用失败:', error.message);
        if (error.response) {
          console.error('错误响应:', error.response.data);
          console.error('状态码:', error.response.status);
        }
      } else {
        console.error('未知错误:', error);
      }
      throw error;
    }
  }

  /**
   * 简化的文本生成接口
   */
  async generateText(
    prompt: string,
    model: string = 'doubao-pro-32k',
    temperature: number = 0.7
  ): Promise<string> {
    const messages: Message[] = [{ role: 'user', content: prompt }];
    const response = await this.chatCompletion(messages, model, temperature);

    if (response.choices && response.choices.length > 0) {
      return response.choices[0].message.content;
    }

    throw new Error('无效的API响应：未找到生成内容');
  }

  /**
   * 生成知识网络结构
   */
  async generateKnowledgeNetwork(content: string): Promise<KnowledgeNode> {
    const prompt = `请将以下课件内容分析并生成一个知识网络结构。
要求：
1. 识别核心知识点（2-5个）
2. 为每个核心知识点找出子知识点（1-3个）
3. 为每个知识点提供简短摘要（20-50字）
4. 按照JSON格式返回，格式如下：
{
  "title": "整体标题",
  "summary": "整体摘要",
  "children": [
    {
      "title": "核心知识点1",
      "summary": "摘要说明",
      "children": [
        {
          "title": "子知识点1.1",
          "summary": "摘要说明",
          "children": []
        }
      ]
    }
  ]
}

课件内容：
${content}

请直接返回JSON格式的知识网络结构，不要包含其他说明文字。`;

    const responseText = await this.generateText(prompt, 'doubao-pro-32k', 0.3);

    // 解析JSON
    try {
      // 移除可能的代码块标记
      const jsonText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON解析失败:', parseError);
      console.log('原始响应:', responseText);
      throw parseError;
    }
  }
}

/**
 * 主函数示例
 */
async function main() {
  console.log('=== 豆包API调用示例 ===\n');

  // 替换为你的实际API Key
  const API_KEY = 'your-doubao-api-key';

  try {
    const doubao = new DoubaoAPI(API_KEY);

    // 示例1: 简单文本生成
    console.log('1. 简单文本生成:');
    const simplePrompt = '解释一下什么是人工智能';
    const simpleResult = await doubao.generateText(simplePrompt);
    console.log(simpleResult);

    // 示例2: 生成知识网络
    console.log('\n2. 生成知识网络:');
    const courseContent = `
计算机网络是计算机科学的一个分支，主要研究计算机之间如何相互连接和通信。
主要内容包括：
1. 网络基础：OSI七层模型、TCP/IP四层模型、网络协议
2. 网络设备：路由器、交换机、防火墙、网关
3. 网络安全：加密技术、防火墙、入侵检测系统、VPN
4. 网络应用：HTTP、FTP、SMTP、DNS等协议
    `.trim();

    const knowledgeNetwork = await doubao.generateKnowledgeNetwork(courseContent);
    console.log(JSON.stringify(knowledgeNetwork, null, 2));

    console.log('\n=== 示例结束 ===');
  } catch (error) {
    console.error('程序执行失败:', error);
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  main();
}
