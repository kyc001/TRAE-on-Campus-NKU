import React, { useState } from 'react';
import { KnowledgeNode } from '../types';

interface KnowledgeTreeProps {
  data: KnowledgeNode;
}

const KnowledgeTree: React.FC<KnowledgeTreeProps> = ({ data }) => {
  const [expanded, setExpanded] = useState<boolean>(true);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="knowledge-tree">
      <TreeNode node={data} />
    </div>
  );
};

// 单个树节点组件
interface TreeNodeProps {
  node: KnowledgeNode;
  level?: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, level = 0 }) => {
  const [expanded, setExpanded] = useState<boolean>(true);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="tree-node">
      <div className="tree-node-header" onClick={toggleExpand}>
        <span style={{ marginRight: '8px' }}>
          {node.children.length > 0 ? (expanded ? '▼' : '▶') : '●'}
        </span>
        <div>
          <strong>{node.title}</strong>
          <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
            {node.summary}
          </p>
        </div>
      </div>
      
      {expanded && node.children.length > 0 && (
        <div className="tree-node-content">
          {node.children.map((child, index) => (
            <TreeNode key={index} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default KnowledgeTree;