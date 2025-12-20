# 📚 智能知识网络生成工具

基于AI的交互式学习知识图谱生成系统，支持PDF文档解析、智能知识点提取、无限层级探索和公式渲染。

## ✨ 核心功能

### 🎯 文档处理
- **PDF上传解析**：自动提取PDF内容并生成初始知识网络
- **JSON导入导出**：保存学习进度，快速恢复之前的知识图谱

### 🌐 知识图谱
- **可视化展示**：使用React Flow渲染交互式知识网络
- **节点点击展开**：查看任意节点的详细内容
- **面包屑导航**：清晰显示当前位置，一键返回上级

### 🚀 智能扩展
- **无限层级探索**：点击任意节点可进入下一级，未生成的自动调用AI生成
- **节点扩展**：为已有节点增加更多子节点（扩展按钮）
- **智能缓存**：最多缓存50个节点数据，提升响应速度

### 🤖 AI助手
- **问AI功能**：直接向AI提问当前知识点，获取详细解释
- **上下文感知**：AI回答会考虑节点的完整路径上下文
- **公式渲染**：支持LaTeX数学公式（行内 `$...$` 和块级 `$$...$$`）
- **Markdown支持**：完整的Markdown格式（标题、列表、代码、粗体等）

### 💾 数据持久化
- **完整导出**：导出包含所有新生成内容的JSON文件
- **状态同步**：前端组件之间实时数据同步

## 🛠️ 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React + TypeScript | 18.2.0 / 5.2.2 |
| 构建工具 | Vite | 5.0.8 |
| 图谱可视化 | React Flow Renderer | 10.3.17 |
| Markdown渲染 | react-markdown | 9.0.1 |
| 公式渲染 | KaTeX + rehype-katex | 0.16.9 / 7.0.0 |
| HTTP客户端 | Axios | 1.6.2 |
| 后端框架 | Express + TypeScript | - |
| PDF解析 | pdf-parse | - |
| 文件上传 | multer | - |
| AI服务 | DeepSeek API / 豆包API | - |

## 📦 项目结构

```
.
├── backend/                # 后端服务
│   ├── src/
│   │   ├── server.ts      # 服务入口
│   │   ├── controllers/   # 控制器
│   │   │   └── process.ts
│   │   ├── routes/        # 路由
│   │   │   └── process.ts
│   │   └── services/      # 服务层
│   │       ├── ai.ts      # DeepSeek AI服务
│   │       ├── doubao.ts  # 豆包AI服务
│   │       ├── document.ts # 文档处理
│   │       └── mockData.ts # 模拟数据
│   ├── uploads/           # 上传文件目录
│   ├── package.json
│   └── tsconfig.json
├── frontend/              # 前端应用
│   ├── src/
│   │   ├── App.tsx        # 根组件
│   │   ├── main.tsx       # 入口文件
│   │   ├── components/
│   │   │   └── KnowledgeTree.tsx  # 知识图谱核心组件
│   │   ├── services/
│   │   │   └── api.ts     # API封装
│   │   └── types/
│   │       └── index.ts   # 类型定义
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
└── README.md              # 本文件
```

## 🚀 快速开始

### 1. 环境要求
- Node.js 18+
- npm 或 yarn
- DeepSeek API密钥 或 豆包API密钥

### 2. 安装依赖

**后端：**
```bash
cd backend
npm install
```

**前端：**
```bash
cd frontend
npm install
```

### 3. 配置API密钥

在 `backend/src/services/ai.ts` 中配置DeepSeek API密钥：

```typescript
const DEEPSEEK_API_KEY = 'your-api-key-here';
```

或在 `backend/src/services/doubao.ts` 中配置豆包API：

```typescript
const DOUBAO_API_KEY = 'your-api-key-here';
```

### 4. 启动服务

**后端（开发模式）：**
```bash
cd backend
npm run dev
```
服务运行在 `http://localhost:3000`

**前端（开发模式）：**
```bash
cd frontend
npm run dev
```
访问 `http://localhost:5173`

### 5. 生产构建

**前端：**
```bash
cd frontend
npm run build
```

**后端：**
```bash
cd backend
npm run build
npm start
```

## 📖 使用指南

### 基础流程

1. **上传PDF文档**
   - 点击"选择文件"按钮
   - 选择要学习的PDF文档
   - 等待AI生成初始知识网络

2. **浏览知识图谱**
   - 点击任意节点查看详细内容
   - 使用面包屑或返回按钮导航

3. **深入探索**
   - **进入下一级**：点击"进入下一级"按钮探索子知识点（自动生成）
   - **扩展节点**：点击"扩展"按钮为当前节点增加更多子节点
   - **问AI**：点击"问AI"按钮获取AI的详细解释

4. **保存与恢复**
   - 点击"导出知识网络"保存为JSON文件
   - 拖拽JSON文件到页面快速恢复进度

### 高级特性

#### 📝 公式渲染
AI回答中的数学公式会自动渲染：
- 行内公式：`$E = mc^2$` → $E = mc^2$
- 块级公式：
  ```
  $$
  \int_a^b f(x)dx = F(b) - F(a)
  $$
  ```

#### 🎯 智能缓存
- 系统自动缓存最近访问的50个节点
- 重复访问时直接从缓存读取，提升响应速度

#### 🔄 数据同步
- 所有新生成的内容自动同步到主数据结构
- 导出时包含所有扩展和新生成的节点

## 🎨 界面说明

### 主界面
- **左侧：** 文件上传区、导出按钮
- **中央：** 知识图谱可视化区域
- **右侧：** 节点详情面板（点击节点后显示）

### 节点详情面板
- **面包屑：** 显示当前节点路径
- **标题和描述：** 节点的详细内容
- **操作按钮：**
  - 🔙 返回：返回上一级
  - ⬇️ 进入下一级：探索子知识点
  - ➕ 扩展：增加更多子节点
  - 🤖 问AI：获取AI解释

### AI解释模态框
- 显示AI的详细解释
- 支持Markdown和LaTeX公式渲染
- 点击关闭或背景关闭

## 🔧 API接口

### 文档处理
- `POST /process` - 上传并处理PDF文档
- `GET /task/:taskId` - 查询处理任务状态

### 知识网络
- `POST /expand-node` - 扩展节点（生成子节点）
- `POST /ask-ai` - 向AI提问节点内容

## 🤝 开发说明

### 前端开发
- 使用Vite的HMR功能，修改代码即时预览
- 组件位于 `frontend/src/components/`
- API调用封装在 `frontend/src/services/api.ts`

### 后端开发
- 使用TypeScript编写，类型安全
- 服务层分离AI服务（DeepSeek/豆包）和文档处理
- 支持Mock模式用于开发测试

### 添加新AI服务
在 `backend/src/services/` 下创建新的服务文件，实现以下方法：
```typescript
class NewAIService {
  async generateKnowledgeNetwork(content: string): Promise<KnowledgeNode>
  async expandNode(node: KnowledgeNode, context: string): Promise<KnowledgeNode[]>
  async explainNode(path: string[], content: string): Promise<string>
}
```

## 📄 许可证

本项目仅供学习使用。

## 🙏 致谢

- React Flow - 优秀的图谱可视化库
- KaTeX - 快速的数学公式渲染引擎
- DeepSeek - 强大的AI能力支持

---

**Happy Learning! 📚✨**
