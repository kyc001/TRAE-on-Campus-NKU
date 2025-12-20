import React, { useState } from 'react';
import { KnowledgeNode } from './types';
import { generateKnowledgeNetwork, uploadFile } from './services/api';
import KnowledgeTree from './components/KnowledgeTree';

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>('');
  const [knowledgeTopic, setKnowledgeTopic] = useState<string>('');
  const [expectedTime, setExpectedTime] = useState<string>('');
  const [model, setModel] = useState<string>('deepseek');
  const [knowledgeNetwork, setKnowledgeNetwork] = useState<KnowledgeNode | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);

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

  // 返回主页
  const handleBackToHome = () => {
    setShowResult(false);
    setKnowledgeNetwork(null);
  };

  // 处理生成知识网络按钮点击
  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setKnowledgeNetwork(null);

    try {
      let result: KnowledgeNode;

      // 构建请求参数
      const requestParams = {
        topic: knowledgeTopic.trim(),
        expectedTime: expectedTime.trim(),
        model
      };

      if (file) {
        // 处理文件上传情况
        const uploadResult = await uploadFile(file);
        result = await generateKnowledgeNetwork(uploadResult.fileId, text.trim(), model, requestParams);
      } else {
        // 处理文本输入情况
        result = await generateKnowledgeNetwork(undefined, text.trim(), model, requestParams);
      }

      setKnowledgeNetwork(result);
      setShowResult(true); // 切换到结果视图
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      {/* 加载遮罩 */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>AI 正在分析并生成知识网络...</p>
        </div>
      )}

      {/* 主页视图 */}
      {!showResult && !loading && (
        <div className="home-view">
          <div className="header">
            <h1>📚 智能知识网络生成工具</h1>
            <p className="subtitle">让 AI 帮你梳理知识脉络，构建学习路径</p>
          </div>
          
          <div className="input-container">
            {/* 学习目标设置 */}
            <div className="card">
              <h2>🎯 学习目标设置</h2>
              
              <div className="form-group">
                <label htmlFor="knowledgeTopic">想要学习的知识主题：</label>
                <input
                  type="text"
                  id="knowledgeTopic"
                  className="input-field"
                  placeholder="例如：数据结构与算法、机器学习基础"
                  value={knowledgeTopic}
                  onChange={(e) => setKnowledgeTopic(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="expectedTime">期望花费时间（小时）：</label>
                <input
                  type="number"
                  id="expectedTime"
                  className="input-field"
                  placeholder="例如：20"
                  min="1"
                  step="1"
                  value={expectedTime}
                  onChange={(e) => setExpectedTime(e.target.value)}
                />
              </div>
            </div>

            {/* 学习资料上传 */}
            <div className="card">
              <h2>📁 上传学习资料</h2>
              
              <div className="file-upload">
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="file-upload-label">
                  <div className="upload-icon">📄</div>
                  {file ? (
                    <div>
                      <p className="file-name">{file.name}</p>
                      <p className="file-hint">点击更换文件</p>
                    </div>
                  ) : (
                    <div>
                      <p className="upload-text">点击上传 PDF 或 TXT 文件</p>
                      <p className="upload-hint">支持课件、笔记等学习资料</p>
                    </div>
                  )}
                </label>
              </div>

              <div className="divider">
                <span>或</span>
              </div>

              <div className="form-group">
                <label htmlFor="text">直接粘贴文本内容：</label>
                <textarea
                  id="text"
                  className="text-input"
                  placeholder="在此粘贴课件内容、笔记或其他学习资料..."
                  value={text}
                  onChange={handleTextChange}
                  rows={8}
                ></textarea>
              </div>
            </div>

            {/* AI 模型选择 */}
            <div className="card">
              <h2>🤖 选择 AI 模型</h2>
              <div className="model-selector">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="model"
                    value="deepseek"
                    checked={model === 'deepseek'}
                    onChange={(e) => setModel(e.target.value)}
                  />
                  <span className="radio-label">
                    <strong>DeepSeek</strong>
                    <small>强大的推理能力</small>
                  </span>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="model"
                    value="doubao"
                    checked={model === 'doubao'}
                    onChange={(e) => setModel(e.target.value)}
                  />
                  <span className="radio-label">
                    <strong>豆包 (Doubao)</strong>
                    <small>中文理解优秀</small>
                  </span>
                </label>
              </div>
            </div>

            {/* 生成按钮 */}
            <button 
              className="generate-btn"
              onClick={handleGenerate}
              disabled={loading || (!file && !text.trim() && !knowledgeTopic.trim())}
            >
              ✨ 生成知识网络
            </button>
            
            {error && <div className="error-message">{error}</div>}
          </div>
        </div>
      )}

      {/* 结果视图 */}
      {showResult && knowledgeNetwork && !loading && (
        <div className="result-view">
          <div className="result-header">
            <button className="back-btn" onClick={handleBackToHome}>
              ← 返回
            </button>
            <h1>🌐 知识网络图谱</h1>
            <div className="header-actions">
              <button className="action-btn">💾 保存</button>
              <button className="action-btn">🖨️ 导出</button>
            </div>
          </div>
          
          <div className="result-content">
            <KnowledgeTree data={knowledgeNetwork} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;