# 🔧 Vercel 构建失败快速修复

## 问题：Vercel在根目录构建而不是frontend目录

### ✅ 解决方案

#### 方法1：在现有项目中修改（推荐）

1. **进入项目Settings**
   - 登录 Vercel Dashboard
   - 进入你的项目
   - 点击顶部导航的 **Settings**

2. **修改Root Directory**
   - 在左侧菜单选择 **General**
   - 向下滚动找到 **Root Directory**
   - 点击 **Edit** 按钮
   - 输入：`frontend`
   - 点击 **Save**

3. **重新部署**
   - 点击顶部导航的 **Deployments**
   - 找到最新的部署
   - 点击右侧三个点 **...** 菜单
   - 选择 **Redeploy**
   - 等待新构建完成

#### 方法2：删除项目重新创建

如果方法1不行：

1. **删除当前项目**
   - Settings -> General -> Delete Project
   - 输入项目名确认删除

2. **重新导入项目**
   - 回到Dashboard，点击 **New Project**
   - 选择你的GitHub仓库
   - ⚠️ **在Configure Project页面**，找到 **Root Directory**
   - 点击 **Edit**，输入 `frontend`
   - Framework选择 `Vite`
   - 添加环境变量 `VITE_API_URL`
   - 点击 **Deploy**

## 📋 检查清单

部署前确认：
- [ ] Root Directory = `frontend` ✅
- [ ] Framework Preset = `Vite` ✅
- [ ] 环境变量 `VITE_API_URL` 已设置 ✅
- [ ] 后端Railway已部署并获取URL ✅

## 🎯 正确的构建日志应该显示

```
运行"vercel build"
> frontend@0.0.0 build
> tsc && vite build
```

而不是在根目录找package.json失败。

## 💡 提示

Vercel的Root Directory设置非常隐蔽，很容易被忽略！
记住：**必须点击Edit按钮才能设置**，不是直接在输入框输入。
