import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import processRouter from './routes/process.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件 - CORS配置允许Vercel域名
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://*.vercel.app',
    /https:\/\/.*\.vercel\.app$/
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 确保uploads目录存在
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 路由
app.use('/api', processRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
