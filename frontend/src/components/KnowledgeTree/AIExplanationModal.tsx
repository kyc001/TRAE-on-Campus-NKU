import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface AIExplanationModalProps {
    show: boolean;
    loading: boolean;
    explanation: string;
    onClose: () => void;
}

const AIExplanationModal: React.FC<AIExplanationModalProps> = ({
    show,
    loading,
    explanation,
    onClose,
}) => {
    if (!show) return null;

    return (
        <>
            {/* 遮罩层 */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 25
                }}
            />

            {/* 弹窗内容 */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '600px',
                maxWidth: '90%',
                maxHeight: '80%',
                background: 'var(--card-bg)',
                borderRadius: '12px',
                padding: '25px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                zIndex: 30,
                border: '1px solid var(--border-color)',
                overflowY: 'auto',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: 'var(--accent-color)', fontSize: '1.3rem' }}>🤖 AI 详细解释</h3>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.5rem' }}
                    >
                        ×
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🤔</div>
                        <div>AI 正在思考中...</div>
                    </div>
                ) : (
                    <div
                        style={{
                            color: 'var(--text-primary)',
                            lineHeight: '1.8',
                            fontSize: '0.95rem'
                        }}
                        className="markdown-content"
                    >
                        <ReactMarkdown
                            remarkPlugins={[remarkMath, remarkGfm]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                                h1: ({ node, ...props }) => <h1 style={{ color: 'var(--accent-color)', marginTop: '20px', marginBottom: '10px' }} {...props} />,
                                h2: ({ node, ...props }) => <h2 style={{ color: 'var(--primary-color)', marginTop: '18px', marginBottom: '10px' }} {...props} />,
                                h3: ({ node, ...props }) => <h3 style={{ color: 'var(--primary-color)', marginTop: '15px', marginBottom: '8px' }} {...props} />,
                                h4: ({ node, ...props }) => <h4 style={{ color: 'var(--primary-color)', marginTop: '12px', marginBottom: '8px' }} {...props} />,
                                p: ({ node, ...props }) => <p style={{ marginBottom: '12px' }} {...props} />,
                                code: ({ node, inline, ...props }: any) =>
                                    inline
                                        ? <code style={{ background: 'rgba(100, 100, 100, 0.2)', padding: '2px 6px', borderRadius: '3px' }} {...props} />
                                        : <code style={{ display: 'block', background: 'rgba(100, 100, 100, 0.2)', padding: '10px', borderRadius: '5px', overflowX: 'auto' }} {...props} />,
                                ul: ({ node, ...props }) => <ul style={{ marginLeft: '20px', marginBottom: '12px' }} {...props} />,
                                ol: ({ node, ...props }) => <ol style={{ marginLeft: '20px', marginBottom: '12px' }} {...props} />,
                                li: ({ node, ...props }) => <li style={{ marginBottom: '6px' }} {...props} />,
                            }}
                        >
                            {explanation}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </>
    );
};

export default React.memo(AIExplanationModal);
