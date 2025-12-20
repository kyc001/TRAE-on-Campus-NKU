import express from 'express';
import multer from 'multer';
import path from 'path';
import processController from '../controllers/process.js';

const router = express.Router();

// 设置存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// 路由
router.post('/upload', upload.single('file'), processController.uploadFile);
router.post('/process', processController.processDocument);
router.get('/status/:id', processController.getStatus);

// 导出路由
export default router;
