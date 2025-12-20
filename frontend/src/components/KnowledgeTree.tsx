import React, { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  NodeTypes,
  Connection,
} from 'react-flow-renderer';
import { KnowledgeNode } from '../types';
import 'react-flow-renderer/dist/style.css';

interface KnowledgeTreeProps {
  data: KnowledgeNode;
}

// 自定义节点类型
const CustomNode = ({ data }: { data: any }) => {
  return (
    <div className="custom-node">
      <div className="node-title">{data.title}</div>
      {data.summary && (
        <div className="node-summary">{data.summary}</div>
      )}
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const KnowledgeTree: React.FC<KnowledgeTreeProps> = ({ data }) => {
  // 将树形结构转换为节点和边
  const convertToNodesAndEdges = (node: KnowledgeNode, parentId?: string, x = 0, y = 0): { nodes: Node[]; edges: Edge[] } => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeId = node.title.replace(/\s+/g, '-').toLowerCase();
    
    // 创建当前节点
    nodes.push({
      id: nodeId,
      type: 'custom',
      position: { x, y },
      data: { title: node.title, summary: node.summary },
    });
    
    // 创建边
    if (parentId) {
      edges.push({
        id: `${parentId}-${nodeId}`,
        source: parentId,
        target: nodeId,
        animated: true,
      });
    }
    
    // 递归处理子节点
    if (node.children && node.children.length > 0) {
      const childY = y + 150;
      const spacing = 200;
      const startX = x - ((node.children.length - 1) * spacing) / 2;
      
      node.children.forEach((child, index) => {
        const childX = startX + index * spacing;
        const { nodes: childNodes, edges: childEdges } = convertToNodesAndEdges(child, nodeId, childX, childY);
        nodes.push(...childNodes);
        edges.push(...childEdges);
      });
    }
    
    return { nodes, edges };
  };
  
  const { nodes: initialNodes, edges: initialEdges } = convertToNodesAndEdges(data);
  
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );
  
  return (
    <div className="knowledge-graph-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background gap={12} size={1} />
        <Controls />
        <MiniMap
          nodeColor={() => {
            return '#3498db';
          }}
          maskColor="rgba(255, 255, 255, 0.6)"
        />
      </ReactFlow>
    </div>
  );
};

export default KnowledgeTree;