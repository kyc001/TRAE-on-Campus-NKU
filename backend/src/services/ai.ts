import OpenAI from "openai";
import { getMockData } from './mockData.js';

// 初始化 DeepSeek AI 客户端
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-5f959f1e69ae4c43910d28cd706e5d89',
});

// 是否使用模拟数据
const USE_MOCK = process.env.USE_MOCK_DATA === 'true';

// DeepSeek API 服务
const deepseekService = {
  // 从文本内容生成知识网络
  generateKnowledgeNetwork: async (content: string, topic?: string, expectedTime?: string): Promise<any> => {
    try {
      // 如果启用模拟模式，直接返回模拟数据
      if (USE_MOCK) {
        console.log('🎭 使用模拟数据模式 (DeepSeek)');
        await new Promise(resolve => setTimeout(resolve, 800)); // 模拟API延迟
        return getMockData(content);
      }
      // 限制内容长度，避免请求过大（约3000字符，大约2000个token）
      const maxLength = 3000;
      const trimmedContent = content.length > maxLength 
        ? content.substring(0, maxLength) + '...(内容已截断)'
        : content;

      // 构建基础提示
      let contextInfo = '';
      if (topic) {
        contextInfo += `学习主题：${topic}\n`;
      }
      if (expectedTime) {
        contextInfo += `预计学习时间：${expectedTime}小时\n`;
      }

      const prompt = `请将以下课件内容分析并生成一个知识网络结构。
${contextInfo ? contextInfo + '\n' : ''}
要求：
1. 识别核心知识点（2-5个），提取最重要的概念
2. 为每个核心知识点找出2-4个子知识点
3. 为每个知识点提供简洁的摘要（15-40字）
4. 知识点标题要简洁明确，摘要要突出核心内容
5. 严格按照JSON格式返回

JSON格式示例：
{
  "title": "课程主题",
  "summary": "课程核心内容概述",
  "children": [
    {
      "title": "核心知识点1",
      "summary": "该知识点的核心内容和重要性",
      "children": [
        {
          "title": "子知识点1.1",
          "summary": "具体内容说明",
          "children": []
        }
      ]
    }
  ]
}

课件内容：
${trimmedContent}

请直接返回JSON格式的知识网络结构，不要包含任何其他说明文字或代码块标记。`;

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "你是一个专业的教育内容分析助手，擅长将课件内容结构化为知识网络。" },
          { role: "user", content: prompt }
        ],
        model: "deepseek-chat",
        temperature: 0.7,
      });

      const text = completion.choices[0]?.message?.content || '';
      
      // 尝试解析JSON
      try {
        // 移除可能的代码块标记
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const knowledgeNetwork = JSON.parse(jsonText);
        return knowledgeNetwork;
      } catch (parseError) {
        console.error('JSON解析失败:', parseError);
        console.log('原始响应:', text);
        
        // 如果解析失败，返回一个包含原始文本的默认结构
        return {
          title: '知识网络',
          summary: text.substring(0, 200) || '内容分析结果',
          children: [
            {
              title: '分析结果',
              summary: text.substring(0, 500) || '请查看完整内容',
              children: []
            }
          ]
        };
      }
    } catch (error) {
      console.error('DeepSeek API调用失败:', error);
      throw new Error('知识网络生成失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  },

  // 测试API连接
  testConnection: async (): Promise<string> => {
    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: "Explain how AI works in a few words" }],
        model: "deepseek-chat",
      });
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('DeepSeek API测试失败:', error);
      throw error;
    }
  },

  // 扩展节点的子节点
  expandNode: async (nodeTitle: string, nodeSummary?: string): Promise<any> => {
    try {
      // 如果启用模拟模式，返回模拟数据
      if (USE_MOCK) {
        console.log('🎭 使用模拟数据模式 - 扩展节点 (DeepSeek)');
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          title: nodeTitle,
          summary: nodeSummary || '节点摘要',
          children: [
            { title: `${nodeTitle} - 子题 1`, summary: '详细内容描述 1', children: [] },
            { title: `${nodeTitle} - 子题 2`, summary: '详细内容描述 2', children: [] },
            { title: `${nodeTitle} - 子题 3`, summary: '详细内容描述 3', children: [] }
          ]
        };
      }

      const prompt = `请为以下知识点生成 3-5 个子知识点。

知识点标题：${nodeTitle}
${nodeSummary ? `知识点摘要：${nodeSummary}` : ''}

要求：
1. 生成 3-5 个相关的子知识点
2. 每个子知识点要有清晰的标题和摘要
3. 摘要长度为 15-40 字
4. 严格按照JSON格式返回

JSON格式示例：
{
  "title": "${nodeTitle}",
  "summary": "${nodeSummary || '节点摘要'}",
  "children": [
    {
      "title": "子知识点1",
      "summary": "具体内容说明",
      "children": []
    }
  ]
}

请直接返回JSON格式的结果，不要包含任何其他说明文字或代码块标记。`;

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "你是一个专业的教育内容分析助手，擅长将知识点展开为更详细的子知识点。" },
          { role: "user", content: prompt }
        ],
        model: "deepseek-chat",
        temperature: 0.7,
      });

      const text = completion.choices[0]?.message?.content || '';
      
      try {
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const result = JSON.parse(jsonText);
        return result;
      } catch (parseError) {
        console.error('JSON解析失败:', parseError);
        return {
          title: nodeTitle,
          summary: nodeSummary || '节点摘要',
          children: [
            { title: '分析结果', summary: text.substring(0, 100), children: [] }
          ]
        };
      }
    } catch (error) {
      console.error('DeepSeek API调用失败:', error);
      throw new Error('节点扩展失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  },

  // 解释知识点
  explainNode: async (nodeTitle: string, nodeSummary?: string, context?: string): Promise<any> => {
    try {
      // 如果启用模拟模式，返回模拟数据
      if (USE_MOCK) {
        console.log('🎭 使用模拟数据模式 - 解释节点 (DeepSeek)');
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
          explanation: `**${nodeTitle}**

这是对“${nodeTitle}”的详细解释。

### 核心概念
${nodeSummary || '该知识点的核心内容和重要性...'}

### 详细说明
这个概念在实际应用中非常重要，它涉及到多个方面的知识。

### 实例
举例来说，在实际场景中...

### 关键要点
1. 第一个重要方面
2. 第二个关键概念
3. 需要注意的事项`
        };
      }

      const contextInfo = context ? `\n\n学习路径上下文：${context}` : '';

      const prompt = `请详细解释以下知识点，帮助学生深入理解。

知识点标题：${nodeTitle}
${nodeSummary ? `简要摘要：${nodeSummary}` : ''}${contextInfo}

请按照以下结构给出详细解释：

1. **核心概念**：用简洁的语言解释这个知识点的核心内容
2. **详细说明**：提供更深入的解释，包括相关原理、方法等
3. **实例或应用**：给出具体的例子或应用场景
4. **关键要点**：列出需要重点掌握的内容

**格式要求**：
- 使用Markdown格式
- 数学公式使用LaTeX格式，行内公式用 $...$ 包裹，独立公式用 $$...$$ 包裹
- 内容详尽且易于理解（300-600字）
- 适当使用列表、加粗等格式增强可读性

**示例格式**：
### 核心概念
损失函数 $L(x)$ 用于衡量...

### 公式示例
$$
L = -\frac{1}{n}\sum_{i=1}^{n}\log(p_i)
$$

请直接开始解释，不要包含"好的"、"让我来解释"等开场白。`;

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "你是一位专业的教育辅导老师，擅长用清晰、易懂的方式解释复杂的知识点。你精通使用Markdown和LaTeX数学公式，能够用专业的数学符号准确表达概念。你的目标是帮助学生真正理解和掌握知识。" },
          { role: "user", content: prompt }
        ],
        model: "deepseek-chat",
        temperature: 0.7,
      });

      const explanation = completion.choices[0]?.message?.content || '';
      
      return {
        explanation: explanation
      };
    } catch (error) {
      console.error('DeepSeek API调用失败:', error);
      throw new Error('获取解释失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
};

export default deepseekService;