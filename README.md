"# 📚 期末复习知识网络生成工具

> TRAE-on-Campus-NKU - 基于大模型的课件知识结构化工具

帮助学生将 PPT/PDF 课件快速压缩成可展开的复习框架地图。

## 🚀 快速启动

### 环境要求

- Node.js 18+
- npm 或 yarn

### 1. 启动后端服务

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

后端服务将在 **http://localhost:3000** 启动

### 2. 启动前端服务

打开**新的终端窗口**：

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端服务将在 **http://localhost:5173** 启动

### 3. 打开页面

在浏览器中访问：**http://localhost:5173**

## 📖 使用方法

1. 打开网页后，可以选择：
   - **上传文件**：点击上传区域，选择 PDF/PPT 文件
   - **粘贴文本**：直接在文本框中粘贴课件内容

2. 点击「生成知识网络」按钮

3. 等待处理完成，即可看到结构化的知识树

4. 点击节点可以展开/折叠子节点

## 🛠️ 技术栈

| 模块 | 技术 |
|------|------|
| 前端 | React + TypeScript + Vite |
| 后端 | Node.js + Express + TypeScript |
| AI | DeepSeek API (可配置) |

## 📁 项目结构

```
├── frontend/          # 前端代码
│   ├── src/
│   │   ├── components/   # React 组件
│   │   ├── services/     # API 服务
│   │   ├── types/        # TypeScript 类型
│   │   └── App.tsx       # 主应用
│   └── package.json
├── backend/           # 后端代码
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── routes/       # 路由
│   │   ├── services/     # 业务逻辑
│   │   └── server.ts     # 服务入口
│   └── package.json
└── docs/              # 项目文档
```

## ⚙️ 配置 API

如需使用真实的 DeepSeek API，请修改 `backend/src/services/document.ts` 中的配置：

```typescript
const config = {
  deepseekApiKey: 'your-api-key-here', // 替换为你的 API Key
};
```

> 建议使用环境变量管理 API Key

## 📝 License

MIT" 
