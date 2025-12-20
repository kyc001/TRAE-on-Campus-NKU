import React, { useState } from 'react';
import { KnowledgeNode } from './types';
import { generateKnowledgeNetwork, uploadFile } from './services/api';
import KnowledgeTree from './components/KnowledgeTree';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [model, setModel] = useState<string>('deepseek');
  const [knowledgeNetwork, setKnowledgeNetwork] = useState<KnowledgeNode | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 处理文件上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  // 处理文本输入变化
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setError('');
  };

  // 处理生成知识网络按钮点击
  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setKnowledgeNetwork(null);

    try {
      let result: KnowledgeNode;

      if (file) {
        // 处理文件上传情况
        const uploadResult = await uploadFile(file);
        result = await generateKnowledgeNetwork(uploadResult.fileId, undefined, model);
      } else if (text.trim()) {
        // 处理文本输入情况
        result = await generateKnowledgeNetwork(undefined, text.trim(), model);
      } else {
        throw new Error('请上传文件或输入文本内容');
      }

      setKnowledgeNetwork(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>📚 期末复习知识网络生成工具</h1>
      
      <div className="main-content">
        {/* 左侧上传区域 */}
        <div className="upload-section">
          <h2>📁 上传课件</h2>
          
          {/* 文件上传 */}
          <div className="file-upload">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
              {file ? (
                <p>已选择文件：{file.name}</p>
              ) : (
                <p>点击上传 PDF 或 TXT 文件</p>
              )}
            </label>
          </div>
          
          {/* 模型选择 */}
          <div className="model-selector">
            <label htmlFor="model">选择 AI 模型：</label>
            <select 
              id="model" 
              value={model} 
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="deepseek">DeepSeek</option>
              <option value="doubao">豆包 (Doubao)</option>
            </select>
          </div>
          
          {/* 文本输入 */}
          <h3>或直接粘贴文本内容</h3>
          <textarea
            className="text-input"
            placeholder="请输入课件内容..."
            value={text}
            onChange={handleTextChange}
          ></textarea>
          
          {/* 生成按钮 */}
          <button 
            className="primary"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? '生成中...' : '生成知识网络'}
          </button>
          
          {/* 错误信息 */}
          {error && <div className="error">{error}</div>}
        </div>
        
        {/* 右侧结果显示区域 */}
        <div className="result-section">
          <h2>🌐 知识网络</h2>
          
          {loading ? (
            <div className="loading"></div>
          ) : knowledgeNetwork ? (
            <KnowledgeTree data={knowledgeNetwork} />
          ) : (
            <p>请上传文件或输入文本内容，然后点击"生成知识网络"按钮</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;