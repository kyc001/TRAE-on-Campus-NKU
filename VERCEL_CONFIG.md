# Vercel 部署配置说明

## ⚙️ Vercel Dashboard 配置

当你在Vercel导入项目时，请按以下方式配置：

### 构建和输出设置

```
Framework Preset:  Vite
Root Directory:    frontend          ⚠️ 必须设置！
Build Command:     npm run build
Output Directory:  dist
Install Command:   npm install
```

### 环境变量

在 Settings -> Environment Variables 添加：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| VITE_API_URL | https://你的后端域名.up.railway.app/api | Production |

⚠️ **注意**：
1. 必须设置Root Directory为 `frontend`
2. API URL必须包含 `/api` 后缀
3. 先部署后端获取URL，再配置前端环境变量

## 🚫 不需要 vercel.json

本项目不使用 vercel.json 配置文件，所有配置都在Dashboard中完成。

## 📸 配置截图参考

### Root Directory 设置
![Root Directory](https://docs.vercel.com/docs/concepts/projects/overview/root-directory.png)

点击 Root Directory 旁边的 "Edit" 按钮，输入 `frontend`

### 环境变量设置
```
Settings -> Environment Variables -> Add New
Name: VITE_API_URL
Value: https://your-backend.up.railway.app/api
Environment: Production (选中)
```

## ✅ 验证部署

部署成功后访问：
- 前端: https://your-app.vercel.app
- 后端健康检查: https://your-backend.up.railway.app/health

如果出现CORS错误，检查：
1. 后端CORS配置是否包含Vercel域名
2. VITE_API_URL是否正确
3. 后端是否正常运行
