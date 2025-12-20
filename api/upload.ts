import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs/promises';
import path from 'path';
import formidable, { type File as FormidableFile } from 'formidable';
import pdfParse from 'pdf-parse';
import { handleCORS } from './lib/utils.js';

function pickFirstFile(files: formidable.Files): FormidableFile | null {
  const candidates = Object.values(files).flatMap((value) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  });
  return (candidates[0] as FormidableFile) || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCORS(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      multiples: false,
      maxFileSize: 4 * 1024 * 1024, // 4MB（Vercel 免费计划限制 ~4.5MB）
      keepExtensions: true,
    });

    const { files } = await new Promise<{ files: formidable.Files }>((resolve, reject) => {
      form.parse(req as any, (err: unknown, _fields: formidable.Fields, parsedFiles: formidable.Files) => {
        if (err) return reject(err);
        resolve({ files: parsedFiles });
      });
    });

    const file = pickFirstFile(files);
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const originalName = file.originalFilename || 'upload';
    const ext = path.extname(originalName).toLowerCase();
    const filepath = (file as any).filepath as string | undefined;

    if (!filepath) {
      return res.status(400).json({ error: 'Invalid upload (missing filepath)' });
    }

    let text = '';

    if (ext === '.pdf') {
      const buffer = await fs.readFile(filepath);
      const pdf = await pdfParse(buffer);
      text = pdf.text || '';
    } else if (ext === '.txt') {
      text = await fs.readFile(filepath, 'utf-8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Only .pdf and .txt are supported.' });
    }

    // 兼容前端的 UploadResponse（仍返回 fileId 等字段），并额外返回解析后的文本
    const fileId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const fileSize = typeof file.size === 'number' ? file.size : 0;

    res.status(200).json({
      fileId,
      fileName: originalName,
      fileSize,
      text,
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    const statusCode = error?.httpCode === 413 ? 413 : 500;
    const message = error?.httpCode === 413 
      ? 'File too large. Maximum size is 4MB on Vercel free plan.'
      : (error?.message || 'Failed to upload file');
    res.status(statusCode).json({ error: message });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 60,
};
