import React from 'react';
import { KnowledgeNode } from '../../types';

interface DetailsSidebarProps {
    selectedNode: KnowledgeNode;
    currentNode: KnowledgeNode;
    expandingNode: boolean;
    loadingExplanation: boolean;
    cacheSize: number;
    maxCacheSize: number;
    currentDepth: number;
    preloadDepthThreshold: number;
    preloadingNodesCount: number;
    onClose: () => void;
    onEnterChild: (node: KnowledgeNode) => void;
    onExpandNode: (node: KnowledgeNode) => void;
    onAskAI: (node: KnowledgeNode) => void;
}

const DetailsSidebar: React.FC<DetailsSidebarProps> = ({
    selectedNode,
    currentNode,
    expandingNode,
    loadingExplanation,
    cacheSize,
    maxCacheSize,
    currentDepth,
    preloadDepthThreshold,
    preloadingNodesCount,
    onClose,
    onEnterChild,
    onExpandNode,
    onAskAI,
}) => {
    return (
        <div style={{
            position: 'absolute',
            top: '80px',
            right: '20px',
            width: '300px',
            maxHeight: 'calc(100% - 100px)',
            background: 'var(--card-bg)',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 20,
            border: '1px solid var(--border-color)',
            overflowY: 'auto',
            backdropFilter: 'blur(10px)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1.2rem' }}>{selectedNode.title}</h3>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                    ×
                </button>
            </div>

            <div style={{ color: 'var(--text-primary)', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '20px' }}>
                {selectedNode.summary || '暂无详细描述'}
            </div>

            {/* 子节点信息 */}
            {selectedNode.children && selectedNode.children.length > 0 && (
                <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        已有 {selectedNode.children.length} 个子知识点
                    </div>
                </div>
            )}

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                {/* 进入下一级按钮 - 所有节点都显示 */}
                {selectedNode !== currentNode && (
                    <button
                        onClick={() => onEnterChild(selectedNode)}
                        disabled={expandingNode}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: expandingNode ? 'var(--text-secondary)' : 'var(--primary-color)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: expandingNode ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            transition: 'background 0.2s'
                        }}
                    >
                        {expandingNode ? '正在生成...' :
                            (selectedNode.children && selectedNode.children.length > 0
                                ? `进入下一级 (${selectedNode.children.length})`
                                : '进入下一级 (自动生成)')}
                    </button>
                )}

                {/* 扩展更多子节点按钮 - 仅当已有子节点时显示 */}
                {selectedNode.children && selectedNode.children.length > 0 && selectedNode.children.length < 8 && (
                    <button
                        onClick={() => onExpandNode(selectedNode)}
                        disabled={expandingNode}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: expandingNode ? 'var(--text-secondary)' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: expandingNode ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            transition: 'background 0.2s',
                            fontSize: '0.9rem'
                        }}
                    >
                        {expandingNode ? '正在扩展...' : '扩展更多子节点'}
                    </button>
                )}

                {/* 问AI按钮 */}
                <button
                    onClick={() => onAskAI(selectedNode)}
                    disabled={loadingExplanation}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: loadingExplanation ? 'var(--text-secondary)' : '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loadingExplanation ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        transition: 'background 0.2s',
                        fontSize: '0.9rem'
                    }}
                >
                    {loadingExplanation ? '🤔 AI思考中...' : '🤖 问AI解释'}
                </button>
            </div>

            {/* 缓存信息 */}
            <div style={{ marginTop: '15px', padding: '8px', background: 'rgba(100, 100, 100, 0.1)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div>缓存: {cacheSize}/{maxCacheSize}</div>
                <div>当前深度: {currentDepth} / {preloadDepthThreshold}</div>
                {preloadingNodesCount > 0 && (
                    <div style={{ color: '#10b981' }}>🔄 预加载中: {preloadingNodesCount} 节点</div>
                )}
            </div>
        </div>
    );
};

export default React.memo(DetailsSidebar);
