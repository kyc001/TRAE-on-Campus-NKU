import OpenAI from "openai";
import { getMockData } from './mockData.js';

// 初始化豆包 AI 客户端
const openai = new OpenAI({
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
  apiKey: process.env.DOUBAO_API_KEY || '',
});

// 是否使用模拟数据
const USE_MOCK = process.env.USE_MOCK_DATA === 'true';

// 豆包 API 服务
const doubaoService = {
  // 从文本内容生成知识网络
  generateKnowledgeNetwork: async (content: string, topic?: string, expectedTime?: string): Promise<any> => {
    try {
      // 如果启用模拟模式，直接返回模拟数据
      if (USE_MOCK) {
        console.log('🎭 使用模拟数据模式 (豆包)');
        await new Promise(resolve => setTimeout(resolve, 800)); // 模拟API延迟
        return getMockData(content);
      }
      // 限制内容长度
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
        model: "doubao-seed-1-6-251015",
        temperature: 0.7,
      });

      const text = completion.choices[0]?.message?.content || '';
      
      // 尝试解析JSON
      try {
        const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const knowledgeNetwork = JSON.parse(jsonText);
        return knowledgeNetwork;
      } catch (parseError) {
        console.error('JSON解析失败:', parseError);
        console.log('原始响应:', text);
        
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
      console.error('豆包 API调用失败:', error);
      throw new Error('知识网络生成失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  },

  // 测试API连接
  testConnection: async (): Promise<string> => {
    try {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: "你好" }],
        model: "doubao-seed-1-6-251015",
      });
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('豆包 API测试失败:', error);
      throw error;
    }
  },

  // 扩展节点的子节点
  expandNode: async (nodeTitle: string, nodeSummary?: string): Promise<any> => {
    try {
      // 如果启用模拟模式，返回模拟数据
      if (USE_MOCK) {
        console.log('🎭 使用模拟数据模式 - 扩展节点 (豆包)');
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
        model: "doubao-seed-1-6-251015",
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
      console.error('豆包 API调用失败:', error);
      throw new Error('节点扩展失败: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
};

export default doubaoService;
