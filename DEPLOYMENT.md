# 🚀 Vercel 部署指南

本项目采用**前后端分离部署**方案，前端部署到Vercel，后端部署到Railway/Render。

## 📋 快速部署步骤

### 一、后端部署到Railway（推荐）

#### 1. 准备Railway账号
- 访问 [railway.app](https://railway.app/)
- 使用GitHub账号登录

#### 2. 通过GitHub部署（最简单）
1. 将代码推送到GitHub
2. 在Railway点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的仓库
5. 设置Root Directory为 `backend`
6. 添加环境变量：
   - `DEEPSEEK_API_KEY`: 你的DeepSeek API密钥
   - `PORT`: 3000
7. 点击Deploy
8. 在Settings中点击 "Generate Domain" 获取后端URL

### 二、前端部署到Vercel

#### 通过Vercel Dashboard部署（推荐）

1. **连接GitHub仓库**
   - 访问 [vercel.com](https://vercel.com/)
   - 点击 "New Project"
   - 导入你的GitHub仓库

2. **配置构建设置**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **添加环境变量**
   在Vercel项目的 Settings -> Environment Variables 中添加：
   ```
   VITE_API_URL = https://your-backend.up.railway.app/api
   ```
   （将URL替换为Railway生成的域名）

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成（约2-3分钟）

## 🔧 必要的代码修改

### 1. 后端CORS配置

编辑 `backend/src/server.ts`，更新CORS配置：

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://*.vercel.app',  // 允许所有Vercel域名
    'https://your-custom-domain.com'  // 如果有自定义域名
  ],
  credentials: true
}));
```

### 2. 后端Railway配置

在 `backend/` 目录创建 `railway.toml`：

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm run build && npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### 3. 确保后端有构建脚本

检查 `backend/package.json`：

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

## 📝 部署清单

- [ ] 代码推送到GitHub
- [ ] Railway创建项目并部署后端
- [ ] 获取Railway后端URL
- [ ] 更新后端CORS配置
- [ ] Vercel导入项目
- [ ] 在Vercel配置环境变量 `VITE_API_URL`
- [ ] Vercel部署前端
- [ ] 测试文件上传功能

## ✅ 部署验证

### 1. 测试后端
```bash
curl https://your-backend.up.railway.app/health
```
应返回: `{"status":"ok"}`

### 2. 测试前端
- 访问Vercel提供的URL
- 上传PDF文件测试
- 检查浏览器控制台无错误

## 🐛 常见问题解决

### CORS错误
**症状**: 浏览器控制台显示 "CORS policy: No 'Access-Control-Allow-Origin'"

**解决**:
1. 检查后端CORS配置是否包含Vercel域名
2. 重新部署后端
3. 清除浏览器缓存

### 文件上传失败
**症状**: PDF上传后显示错误

**原因**: Railway/Render的文件系统是临时的

**解决方案**:
- 短期：重启后文件会丢失，适合测试
- 长期：集成云存储服务（S3、Cloudinary等）

### API请求超时
**症状**: 请求时间过长或超时

**解决**:
1. Railway免费计划会休眠，首次请求较慢
2. 考虑升级到Hobby计划（$5/月）
3. 或使用Render的付费计划

### 构建失败
**检查项**:
- Node版本是否匹配（推荐18+）
- 依赖是否正确安装
- 查看构建日志定位问题

## 🚀 进阶配置

### 自定义域名

**Vercel前端**:
1. 在项目Settings -> Domains
2. 添加你的域名
3. 按提示配置DNS

**Railway后端**:
1. 在项目Settings -> Custom Domain
2. 添加域名并配置DNS

### 环境变量管理

使用不同环境变量：
- Development: `.env`
- Production (Railway): Dashboard添加
- Production (Vercel): Dashboard添加

### 性能优化

1. **启用CDN**: Vercel自动启用
2. **压缩资源**: Vite构建已优化
3. **后端缓存**: 考虑添加Redis缓存

## 💰 成本预估

| 服务 | 免费额度 | 付费计划 |
|------|---------|---------|
| Vercel | 100GB带宽/月 | $20/月起 |
| Railway | $5试用额度 | $5/月起 |
| Render | 750小时/月 | $7/月起 |

**推荐配置**: 
- 个人/学习项目：全部使用免费计划
- 小型生产项目：Railway Hobby ($5) + Vercel Pro ($20)

## 🔄 持续部署

两个平台都支持自动部署：

**Vercel**: 
- 推送到GitHub主分支 → 自动部署
- 推送到其他分支 → 创建预览部署

**Railway**:
- 推送到GitHub → 自动重新部署
- 可在Dashboard暂停自动部署

## 📊 监控日志

**Vercel日志**:
- Dashboard -> 你的项目 -> Deployments -> 点击部署 -> Logs

**Railway日志**:
- Dashboard -> 你的项目 -> Deployments -> View Logs

## 🆘 获取帮助

- Vercel文档: https://vercel.com/docs
- Railway文档: https://docs.railway.app
- GitHub Issues: 提交问题到项目仓库

---

**部署完成后，你的应用将全球可访问！🎉**
