import OpenAI from "openai";

function getDeepSeekClient(): OpenAI {
  const apiKey = (process.env.DEEPSEEK_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY 未配置：请在 Vercel Project Settings -> Environment Variables 添加该变量，并重新部署');
  }

  return new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey,
  });
}

// DeepSeek API 服务
const deepseekService = {
  // 从文本内容生成知识网络
  generateKnowledgeNetwork: async (content: string, topic?: string, expectedTime?: string): Promise<any> => {
    try {
      const openai = getDeepSeekClient();

      const effectiveContent = (content || '').trim().length > 0
        ? content
        : (topic ? `主题：${topic}` : '');

      const maxLength = 3000;
      const trimmedContent = effectiveContent.length > maxLength
        ? effectiveContent.substring(0, maxLength) + '...(内容已截断)'
        : effectiveContent;

      let contextInfo = '';
      if (topic) contextInfo += `学习主题：${topic}\n`;
      if (expectedTime) contextInfo += `预计学习时间：${expectedTime}小时\n`;

      const prompt = `请将以下课件内容分析并生成一个3级知识网络结构。
${contextInfo ? contextInfo + '\n' : ''}
要求：
1. 第1级：识别核心知识点（2-5个）
2. 第2级：为每个核心知识点找出2-4个子知识点
3. 第3级：为每个子知识点细分2-3个更具体的知识点
4. 为每个知识点提供简洁的摘要（15-40字）
5. 严格按照JSON格式返回

JSON格式示例：
{
  "title": "课程主题",
  "summary": "课程核心内容概述",
  "children": [
    {
      "title": "核心知识点1",
      "summary": "该知识点的核心内容",
      "children": [
        {
          "title": "子知识点1.1",
          "summary": "具体内容说明",
          "children": [
            {
              "title": "细分知识点1.1.1",
              "summary": "更详细描述",
              "children": []
            }
          ]
        }
      ]
    }
  ]
}

课件内容：
${trimmedContent}

请直接返回JSON格式，不要包含代码块标记。`;

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "你是一个专业的教育内容分析助手。" },
          { role: "user", content: prompt }
        ],
        model: "deepseek-chat",
        temperature: 0.7,
      });

      const text = completion.choices[0]?.message?.content || '';
      const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(jsonText);
    } catch (error: any) {
      console.error('生成知识网络失败:', error);
      throw error;
    }
  },

  // 扩展节点
  expandNode: async (nodeTitle: string, nodeSummary?: string): Promise<any> => {
    try {
      const openai = getDeepSeekClient();

      const prompt = `请为以下知识点生成3-5个子知识点。
知识点：${nodeTitle}
${nodeSummary ? `摘要：${nodeSummary}` : ''}

JSON格式：
{
  "title": "${nodeTitle}",
  "summary": "${nodeSummary || ''}",
  "children": [
    {"title": "子知识点1", "summary": "说明", "children": []}
  ]
}`;

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "你是教育内容分析助手。" },
          { role: "user", content: prompt }
        ],
        model: "deepseek-chat",
        temperature: 0.7,
      });

      const text = completion.choices[0]?.message?.content || '';
      const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(jsonText);
    } catch (error: any) {
      console.error('扩展节点失败:', error);
      throw error;
    }
  },

  // 解释知识点
  explainNode: async (nodeTitle: string, nodeSummary?: string, context?: string): Promise<any> => {
    try {
      const openai = getDeepSeekClient();

      const contextInfo = context ? `\n学习路径：${context}` : '';
      const prompt = `请详细解释以下知识点：
${nodeTitle}
${nodeSummary ? `摘要：${nodeSummary}` : ''}${contextInfo}

使用Markdown格式，数学公式用LaTeX（$...$和$$...$$）。
包含：核心概念、详细说明、实例、关键要点。`;

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "你是专业教育辅导老师，精通Markdown和LaTeX。" },
          { role: "user", content: prompt }
        ],
        model: "deepseek-chat",
        temperature: 0.7,
      });

      const explanation = completion.choices[0]?.message?.content || '';
      return { explanation };
    } catch (error: any) {
      console.error('解释失败:', error);
      throw error;
    }
  }
};

export default deepseekService;
