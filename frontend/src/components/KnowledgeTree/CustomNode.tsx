import React from 'react';

interface CustomNodeProps {
  data: {
    title: string;
    summary?: string;
    isRoot: boolean;
  };
}

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  const isRoot = data.isRoot;
  return (
    <div 
      className={`custom-node ${isRoot ? 'root-node' : 'child-node'}`}
      style={{ 
        cursor: 'pointer',
        borderColor: isRoot ? 'var(--accent-color)' : 'var(--primary-color)',
        minWidth: isRoot ? '250px' : '200px',
        textAlign: 'center',
        background: isRoot ? 'rgba(15, 23, 42, 0.9)' : 'rgba(30, 41, 59, 0.8)',
        transform: isRoot ? 'scale(1.1)' : 'scale(1)',
        transition: 'all 0.3s ease'
      }}
    >
      <div 
        className="node-title" 
        style={{ 
          fontSize: isRoot ? '1.2rem' : '1rem', 
          color: isRoot ? 'var(--accent-color)' : 'var(--primary-color)' 
        }}
      >
        {data.title}
      </div>
      {data.summary && (
        <div 
          className="node-summary" 
          style={{ 
            display: isRoot ? 'block' : '-webkit-box', 
            WebkitLineClamp: 3, 
            WebkitBoxOrient: 'vertical', 
            overflow: 'hidden' 
          }}
        >
          {data.summary}
        </div>
      )}
      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.8 }}>
        {isRoot ? '点击查看详情' : '点击查看详情 & 深入学习'}
      </div>
    </div>
  );
};

export default React.memo(CustomNode);
