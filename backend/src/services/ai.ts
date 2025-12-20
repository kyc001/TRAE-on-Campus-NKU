import OpenAI from "openai";

// 初始化 DeepSeek AI 客户端
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || 'sk-5f959f1e69ae4c43910d28cd706e5d89',
});

// DeepSeek API 服务
const deepseekService = {
  // 从文本内容生成知识网络
  generateKnowledgeNetwork: async (content: string): Promise<any> => {
    try {
      // 限制内容长度，避免请求过大（约3000字符，大约2000个token）
      const maxLength = 3000;
      const trimmedContent = content.length > maxLength 
        ? content.substring(0, maxLength) + '...(内容已截断)'
        : content;

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
${trimmedContent}

请直接返回JSON格式的知识网络结构，不要包含其他说明文字。`;

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
  }
};

export default deepseekService;