import React from 'react';
import { KnowledgeNode } from '../../types';

interface NavigationBarProps {
    history: KnowledgeNode[];
    currentNode: KnowledgeNode;
    onBack: () => void;
    onBreadcrumbClick: (index: number) => void;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
    history,
    currentNode,
    onBack,
    onBreadcrumbClick,
}) => {
    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 10,
            background: 'var(--card-bg)',
            padding: '10px 20px',
            borderRadius: '8px',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '90%',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
            <button
                onClick={onBack}
                disabled={history.length === 0}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: history.length === 0 ? 'var(--text-secondary)' : 'var(--primary-color)',
                    cursor: history.length === 0 ? 'not-allowed' : 'pointer',
                    fontSize: '1.2rem',
                    padding: '5px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                }}
                title="返回上一级"
            >
                ←
            </button>

            <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', whiteSpace: 'nowrap', alignItems: 'center' }}>
                {/* 根节点面包屑 */}
                <span
                    onClick={() => onBreadcrumbClick(-1)}
                    style={{
                        cursor: 'pointer',
                        color: history.length === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: history.length === 0 ? 'bold' : 'normal',
                        fontSize: '0.9rem'
                    }}
                >
                    {history.length > 0 ? history[0].title : currentNode.title}
                </span>

                {/* 历史记录面包屑 */}
                {history.slice(1).map((node, index) => (
                    <React.Fragment key={index}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>&gt;</span>
                        <span
                            onClick={() => onBreadcrumbClick(index + 1)}
                            style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem' }}
                        >
                            {node.title}
                        </span>
                    </React.Fragment>
                ))}

                {/* 当前节点面包屑 (如果有历史记录) */}
                {history.length > 0 && (
                    <>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>&gt;</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            {currentNode.title}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
};

export default React.memo(NavigationBar);
