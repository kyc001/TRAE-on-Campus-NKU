# 🚀 项目部署指南

## 📋 目录

1. [服务器准备](#服务器准备)
2. [环境配置](#环境配置)
3. [后端部署](#后端部署)
4. [前端部署](#前端部署)
5. [Nginx配置](#nginx配置)
6. [环境变量配置](#环境变量配置)
7. [启动服务](#启动服务)
8. [常见问题](#常见问题)

## 🖥️ 服务器准备

### 选择服务器

你可以选择以下任意一种云服务器：
- 阿里云 ECS
- 腾讯云 CVM
- AWS EC2
- GCP Compute Engine
- 华为云 ECS

### 服务器配置建议

| 配置项 | 最低要求 | 推荐配置 |
|--------|----------|----------|
| CPU | 1核 | 2核 |
| 内存 | 2GB | 4GB |
| 存储 | 40GB | 80GB SSD |
| 带宽 | 1Mbps | 5Mbps |
| 操作系统 | Ubuntu 20.04+ | Ubuntu 22.04 LTS |

### 安全组配置

确保服务器安全组开放以下端口：
- 80（HTTP）
- 443（HTTPS，可选但推荐）
- 22（SSH）
- 3000（后端服务，可关闭，通过Nginx反向代理）

## ⚙️ 环境配置

### 1. 连接服务器

使用SSH连接到你的服务器：

```bash
ssh root@your-server-ip
```

### 2. 更新系统

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. 安装Node.js 18+

使用NodeSource安装Node.js 18：

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

验证安装：

```bash
node -v  # 应该显示 v18.x.x
npm -v   # 应该显示 9.x.x 或更高
```

### 4. 安装Git

```bash
sudo apt install -y git
```

### 5. 安装PM2（进程管理器）

```bash
npm install -g pm2
```

### 6. 安装Nginx

```bash
sudo apt install -y nginx
```

## 🔧 后端部署

### 1. 克隆代码

在服务器上创建项目目录并克隆代码：

```bash
mkdir -p /opt/trae-project
cd /opt/trae-project
git clone https://your-repo-url.git .
```

### 2. 安装依赖

```bash
cd backend
npm install
```

### 3. 配置环境变量

创建`.env`文件：

```bash
cp .env.example .env  # 如果没有.env.example，直接创建
nano .env
```

添加以下配置（根据实际情况修改）：

```env
# 端口配置
PORT=3000

# AI服务配置
# DeepSeek API
DEEPSEEK_API_KEY=your-deepseek-api-key

# 豆包API
DOUBAO_API_KEY=your-doubao-api-key

# Google Gemini API (可选)
GOOGLE_API_KEY=your-google-api-key
```

### 4. 构建项目

```bash
npm run build
```

### 5. 使用PM2启动后端服务

```bash
# 先构建
npm run build

# 使用npm start启动（不推荐用于生产环境）
npm run start

# 或者使用PM2直接启动（推荐）
pm run build
pm run start
```

验证服务是否启动：

```bash
curl http://localhost:3000/health
# 应该返回 {"status":"ok"}
```

## 🎨 前端部署

### 1. 安装依赖

```bash
cd /opt/trae-project/frontend
npm install
```

### 2. 构建项目

```bash
npm run build
```

构建完成后，静态文件会生成在`dist`目录中。

### 3. 配置Vite代理

前端的API请求会通过Vite代理到后端，确保`vite.config.ts`中的代理配置正确：

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

## 📝 Nginx配置

### 1. 创建Nginx配置文件

```bash
sudo nano /etc/nginx/sites-available/trae-project
```

### 2. 配置Nginx

添加以下配置（根据实际情况修改）：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或IP地址

    # 前端静态资源
    location / {
        root /opt/trae-project/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端API反向代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:3000/health;
    }

    # 错误页面
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

### 3. 启用配置文件

```bash
sudo ln -s /etc/nginx/sites-available/trae-project /etc/nginx/sites-enabled/
```

### 4. 测试Nginx配置

```bash
sudo nginx -t
```

### 5. 重启Nginx

```bash
sudo systemctl restart nginx
```

## 🔒 环境变量配置

### 后端环境变量

在`backend`目录下创建`.env`文件：

```bash
# 端口配置
PORT=3000

# AI服务配置
DEEPSEEK_API_KEY=your-deepseek-api-key
DOUBAO_API_KEY=your-doubao-api-key
GOOGLE_API_KEY=your-google-api-key

# 其他配置（根据需要添加）
# MAX_FILE_SIZE=10485760  # 10MB
# UPLOAD_DIR=uploads
```

### 前端环境变量

在`frontend`目录下创建`.env`文件（可选，用于配置API地址等）：

```bash
VITE_API_BASE_URL=/api
```

## 🚀 启动服务

### 1. 启动后端服务

```bash
cd /opt/trae-project/backend
npm run build
npm run start
```

或者使用PM2管理（推荐）：

```bash
cd /opt/trae-project/backend
npm run build
pm run start
```

### 2. 启动Nginx

```bash
sudo systemctl start nginx
```

### 3. 设置开机自启

```bash
# 设置PM2开机自启
pm install -g pm2
sudo pm2 startup

# 保存当前PM2进程列表
pm run build
npm run start

# 设置Nginx开机自启
sudo systemctl enable nginx
```

## 🔍 验证部署

打开浏览器访问：
- 前端应用：`http://your-domain.com` 或 `http://your-server-ip`
- 后端健康检查：`http://your-domain.com/health`

## 📊 PM2管理

### 常用PM2命令

```bash
# 查看进程状态
pm run build
npm run start

# 重启服务
npm run build
npm run start

# 停止服务
npm run build
npm run start

# 查看日志
npm run build
npm run start

# 实时查看日志
npm run build
npm run start
```

## ❓ 常见问题

### 1. 前端无法访问后端API

**问题**：前端页面无法加载数据，控制台显示API请求失败

**解决方案**：
- 检查后端服务是否正常运行：`curl http://localhost:3000/health`
- 检查Nginx配置中的代理设置是否正确
- 检查防火墙是否开放了3000端口
- 检查前端API配置中的baseURL是否正确

### 2. 后端服务启动失败

**问题**：`npm run start` 后服务立即停止

**解决方案**：
- 查看日志：`npm run build` 或 `npm run start`
- 检查环境变量是否配置正确
- 检查端口是否被占用：`lsof -i :3000`
- 确保uploads目录存在：`mkdir -p uploads`

### 3. 前端页面显示404

**问题**：访问域名时显示Nginx 404页面

**解决方案**：
- 检查前端dist目录是否存在
- 检查Nginx配置中的root路径是否正确
- 确保Nginx配置已启用：`ls -la /etc/nginx/sites-enabled/`
- 重启Nginx：`sudo systemctl restart nginx`

### 4. 上传PDF文件失败

**问题**：上传PDF文件时失败，显示超时或错误

**解决方案**：
- 检查后端服务是否正常运行
- 检查上传文件大小限制：在Nginx配置中添加 `client_max_body_size 20M;`
- 检查uploads目录权限：`chmod 755 uploads`

## 📞 技术支持

如果遇到其他问题，可以通过以下方式获取帮助：

- 查看项目README.md文件
- 检查项目日志文件
- 联系项目开发团队

## 🎉 部署成功

恭喜！你的项目已经成功部署到服务器上。现在你可以通过浏览器访问你的应用，开始使用智能知识网络生成工具了！

---

**作者**：智能知识网络生成工具团队  
**版本**：v1.0.0  
**日期**：2024-01-01