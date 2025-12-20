# 豆包API调用指南

## 一、API申请流程

1. **注册开发者账号**
   - 访问字节跳动开放平台：https://console.byteintl.com/
   - 注册并登录开发者账号

2. **创建应用**
   - 进入控制台，点击「创建应用」
   - 填写应用名称和描述
   - 选择应用类型为「AI服务」

3. **获取API Key**
   - 应用创建成功后，在「API管理」页面获取API Key
   - 保存好API Key，后续调用API时需要使用

4. **开通API服务**
   - 在「服务管理」页面，开通「豆包大模型API」服务
   - 根据需要选择合适的计费方案

## 二、API调用基础

### 1. 接口地址
```
https://api.doubao.com/v1/chat/completions
```

### 2. 请求方法
- `POST`

### 3. 请求头
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {your-api-key}"
}
```

### 4. 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `model` | string | 是 | 模型名称，如 `doubao-pro-32k` |
| `messages` | array | 是 | 对话历史，格式为 `[{"role": "user", "content": "消息内容"}]` |
| `temperature` | number | 否 | 生成内容的随机性，0-1之间，默认0.7 |
| `max_tokens` | number | 否 | 最大生成 tokens 数，默认2048 |

### 5. 响应格式
```json
{
  "id": "chatcmpl-xxx",
  "created": 1681234567,
  "model": "doubao-pro-32k",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "生成的回复内容"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

## 三、示例代码使用说明

### 1. Python示例

#### 文件：`doubao_api_example.py`

#### 功能特性
- 完整的API客户端封装
- 支持对话补全
- 支持文本生成
- 支持知识网络生成

#### 使用步骤

1. **安装依赖**
```bash
pip install requests
```

2. **配置API Key**
```python
# 在main函数中替换为你的实际API Key
API_KEY = "your-doubao-api-key"
```

3. **运行示例**
```bash
python doubao_api_example.py
```

### 2. TypeScript示例

#### 文件：`doubao_api_example.ts`

#### 功能特性
- 完整的API客户端封装
- 类型安全
- 支持对话补全
- 支持文本生成
- 支持知识网络生成

#### 使用步骤

1. **安装依赖**
```bash
npm install axios
```

2. **配置API Key**
```typescript
// 在main函数中替换为你的实际API Key
const API_KEY = 'your-doubao-api-key';
```

3. **运行示例**
```bash
npx ts-node doubao_api_example.ts
```

## 四、与项目集成

当前项目后端使用TypeScript，可以将豆包API集成到现有的AI服务中，替代或补充DeepSeek API。

### 集成步骤

1. **复制豆包API客户端代码到项目**
   - 将`doubao_api_example.ts`中的`DoubaoAPI`类复制到`backend/src/services/doubao.ts`

2. **修改document.ts服务**
   - 在`document.ts`中导入豆包API服务
   - 添加使用豆包API的选项

3. **配置环境变量**
   - 在`.env`文件中添加豆包API Key配置

4. **更新路由**
   - 根据需要更新API路由，支持选择使用豆包API

## 五、注意事项

1. **API Key安全**
   - 不要将API Key直接硬编码到代码中
   - 使用环境变量或配置文件管理API Key
   - 不要将包含API Key的代码提交到版本控制系统

2. **请求频率限制**
   - 豆包API有请求频率限制，超过限制会被限流
   - 建议实现请求重试机制
   - 合理设置请求间隔

3. **错误处理**
   - 实现完善的错误处理机制
   - 捕获并处理网络错误、API错误等
   - 给用户友好的错误提示

4. **内容安全**
   - 确保生成的内容符合相关法律法规
   - 实现内容审核机制

5. **性能优化**
   - 合理设置`max_tokens`参数，避免生成过长内容
   - 根据需要调整`temperature`参数，平衡生成质量和速度

## 六、示例代码说明

### 1. 知识网络生成示例

示例代码中包含了与当前项目业务逻辑相关的知识网络生成功能，该功能：
- 接收课程内容文本作为输入
- 调用豆包API生成结构化的知识网络
- 返回符合项目格式要求的JSON数据

### 2. 代码结构

```
├── doubao_api_example.py    # Python版示例
├── doubao_api_example.ts    # TypeScript版示例
└── 豆包API调用指南.md       # 本指南文档
```

## 七、常见问题

1. **API调用失败怎么办？**
   - 检查API Key是否正确
   - 检查网络连接是否正常
   - 查看错误响应信息，根据错误码排查问题

2. **生成的内容不符合预期？**
   - 调整`temperature`参数
   - 优化提示词，使其更明确
   - 尝试使用不同的模型

3. **如何处理长文本？**
   - 豆包API支持长文本处理，可以使用`doubao-pro-32k`等大模型
   - 对于特别长的文本，可以分段处理

4. **支持哪些模型？**
   - 豆包API提供多种模型选择，包括：
     - `doubao-pro`：基础版大模型
     - `doubao-pro-32k`：支持长文本的大模型
     - `doubao-lite`：轻量版模型，速度更快

## 八、参考链接

- 豆包API官方文档：https://developer.doubao.com/
- 字节跳动开放平台：https://console.byteintl.com/
- 豆包大模型介绍：https://www.doubao.com/
