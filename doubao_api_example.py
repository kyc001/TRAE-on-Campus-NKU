#!/usr/bin/env python3
"""
豆包API调用示例

本示例展示了如何使用Python调用豆包API进行文本生成和对话。

使用前需要：
1. 访问 https://console.byteintl.com/ 注册并获取API Key
2. 安装依赖：pip install requests
"""

import requests
import json
import time
from typing import Dict, Any

class DoubaoAPI:
    def __init__(self, api_key: str):
        """
        初始化豆包API客户端
        
        Args:
            api_key: 从字节跳动开放平台获取的API密钥
        """
        self.api_key = api_key
        self.base_url = "https://api.doubao.com/v1/chat/completions"
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
    
    def chat_completion(self, messages: list, model: str = "doubao-pro-32k", temperature: float = 0.7) -> Dict[str, Any]:
        """
        调用豆包API进行对话补全
        
        Args:
            messages: 对话历史，格式为 [{"role": "user", "content": "消息内容"}]
            model: 使用的模型，默认 doubao-pro-32k
            temperature: 生成内容的随机性，0-1之间
            
        Returns:
            API响应结果，包含生成的文本
        """
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": 2048
        }
        
        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                data=json.dumps(payload),
                timeout=30
            )
            
            response.raise_for_status()  # 检查HTTP状态码
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"API调用失败: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"错误响应: {e.response.text}")
            raise
    
    def generate_text(self, prompt: str, model: str = "doubao-pro-32k", temperature: float = 0.7) -> str:
        """
        简化的文本生成接口
        
        Args:
            prompt: 生成提示词
            model: 使用的模型
            temperature: 生成内容的随机性
            
        Returns:
            生成的文本内容
        """
        messages = [{"role": "user", "content": prompt}]
        response = self.chat_completion(messages, model, temperature)
        
        # 解析响应
        if "choices" in response and response["choices"]:
            return response["choices"][0]["message"]["content"]
        else:
            raise ValueError(f"无效的API响应: {response}")
    
    def generate_knowledge_network(self, content: str) -> Dict[str, Any]:
        """
        生成知识网络结构
        
        Args:
            content: 课程内容文本
            
        Returns:
            知识网络的JSON结构
        """
        prompt = f"请将以下课件内容分析并生成一个知识网络结构。\n"
        prompt += "要求：\n"
        prompt += "1. 识别核心知识点（2-5个）\n"
        prompt += "2. 为每个核心知识点找出子知识点（1-3个）\n"
        prompt += "3. 为每个知识点提供简短摘要（20-50字）\n"
        prompt += "4. 按照JSON格式返回，格式如下：\n"
        prompt += "{\n"
        prompt += "  \"title\": \"整体标题\",\n"
        prompt += "  \"summary\": \"整体摘要\",\n"
        prompt += "  \"children\": [\n"
        prompt += "    {\n"
        prompt += "      \"title\": \"核心知识点1\",\n"
        prompt += "      \"summary\": \"摘要说明\",\n"
        prompt += "      \"children\": [\n"
        prompt += "        {\n"
        prompt += "          \"title\": \"子知识点1.1\",\n"
        prompt += "          \"summary\": \"摘要说明\",\n"
        prompt += "          \"children\": []\n"
        prompt += "        }\n"
        prompt += "      ]\n"
        prompt += "    }\n"
        prompt += "  ]\n"
        prompt += "}\n\n"
        prompt += f"课件内容：\n{content}\n"
        prompt += "\n请直接返回JSON格式的知识网络结构，不要包含其他说明文字。"
        
        # 生成文本
        response_text = self.generate_text(prompt, temperature=0.3)
        
        # 解析JSON
        try:
            # 移除可能的代码块标记
            json_text = response_text.replace('```json\n', '').replace('```', '').strip()
            return json.loads(json_text)
        except json.JSONDecodeError as e:
            print(f"JSON解析失败: {e}")
            print(f"原始响应: {response_text}")
            raise


def main():
    """示例程序入口"""
    # 替换为你的实际API Key
    API_KEY = "your-doubao-api-key"
    
    try:
        # 初始化API客户端
        doubao = DoubaoAPI(API_KEY)
        
        print("=== 豆包API调用示例 ===")
        
        # 示例1: 简单文本生成
        print("\n1. 简单文本生成:")
        simple_prompt = "解释一下什么是人工智能"
        result = doubao.generate_text(simple_prompt)
        print(result)
        
        # 示例2: 生成知识网络
        print("\n2. 生成知识网络:")
        course_content = """
计算机网络是计算机科学的一个分支，主要研究计算机之间如何相互连接和通信。
主要内容包括：
1. 网络基础：OSI七层模型、TCP/IP四层模型、网络协议
2. 网络设备：路由器、交换机、防火墙、网关
3. 网络安全：加密技术、防火墙、入侵检测系统、VPN
4. 网络应用：HTTP、FTP、SMTP、DNS等协议
        """
        
        knowledge_network = doubao.generate_knowledge_network(course_content)
        print(json.dumps(knowledge_network, indent=2, ensure_ascii=False))
        
        print("\n=== 示例结束 ===")
        
    except Exception as e:
        print(f"程序执行失败: {e}")


if __name__ == "__main__":
    main()
