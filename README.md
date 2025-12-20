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

### 基础使用

1. 打开网页后，可以选择：
   - **上传 PDF/TXT 文件**：点击上传区域，选择课件文档
   - **上传 JSON 文件**：直接加载之前导出的知识网络，无需重新生成
   - **粘贴文本**：直接在文本框中粘贴课件内容

2. 点击「生成知识网络」按钮

3. 等待处理完成，即可看到结构化的知识树

### 交互式探索

4. **点击任意节点**：查看详细信息，并可以：
   - **进入下一级**：深入学习该知识点（自动生成子节点）
   - **扩展更多子节点**：在当前层级获取更多相关知识点
   - **🤖 问AI解释**：直接让AI详细解释当前知识点，无需继续细分
     - AI会根据学习路径上下文提供针对性的解释
     - 包含核心概念、详细说明、实例和关键要点
     - 适合想要深入理解某个概念而不继续展开的场景
   
5. **导航功能**：
   - 使用左上角的「返回上一级」按钮
   - 点击面包屑导航快速跳转

6. **保存和分享**：
   - 点击「导出JSON」保存整个知识网络
   - 下次可直接导入JSON文件，避免重复生成
   - 所有扩展的内容都会被保存

### 智能缓存

- 系统自动缓存最近访问的 50 个节点
- 重复访问的节点会直接从缓存加载，提升体验

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


> 建议使用环境变量管理 API Key

## 📝 License

MIT" 


Set-Location "d:\Study\TRAE on Campus\backend"
npm run dev
Set-Location "d:\Study\TRAE on Campus\frontend"
npm run dev
人工智能基础课程

第一章：机器学习概述
机器学习是人工智能的核心，包括监督学习、无监督学习和强化学习。

第二章：神经网络
神经网络由输入层、隐藏层和输出层组成，通过反向传播算法进行训练。

第三章：深度学习
深度学习使用多层神经网络，能够自动学习特征表示。