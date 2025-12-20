import React, { useCallback, useState, useEffect } from 'react';
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
  NodeMouseHandler,
} from 'react-flow-renderer';
import { KnowledgeNode } from '../types';
import 'react-flow-renderer/dist/style.css';

interface KnowledgeTreeProps {
  data: KnowledgeNode;
}

// 自定义节点类型
const CustomNode = ({ data }: { data: any }) => {
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
      <div className="node-title" style={{ fontSize: isRoot ? '1.2rem' : '1rem', color: isRoot ? 'var(--accent-color)' : 'var(--primary-color)' }}>
        {data.title}
      </div>
      {data.summary && (
        <div className="node-summary" style={{ display: isRoot ? 'block' : '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {data.summary}
        </div>
      )}
      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', opacity: 0.8 }}>
        {isRoot ? '点击查看详情' : '点击查看详情 & 深入学习'}
      </div>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// 缓存管理
interface NodeCache {
  [key: string]: KnowledgeNode;
}

const MAX_CACHE_SIZE = 50; // 最大缓存数量
const nodeCache: NodeCache = {};
let cacheKeys: string[] = [];

// 生成节点缓存键
const getNodeCacheKey = (node: KnowledgeNode): string => {
  return `${node.title}_${node.summary?.substring(0, 20)}`;
};

// 添加到缓存
const addToCache = (node: KnowledgeNode) => {
  const key = getNodeCacheKey(node);
  
  // 如果缓存已满，删除最旧的
  if (cacheKeys.length >= MAX_CACHE_SIZE && !nodeCache[key]) {
    const oldestKey = cacheKeys.shift();
    if (oldestKey) {
      delete nodeCache[oldestKey];
    }
  }
  
  // 添加到缓存
  if (!nodeCache[key]) {
    nodeCache[key] = node;
    cacheKeys.push(key);
  } else {
    // 更新现有节点
    nodeCache[key] = node;
  }
};

// 从缓存获取
const getFromCache = (node: KnowledgeNode): KnowledgeNode | null => {
  const key = getNodeCacheKey(node);
  return nodeCache[key] || null;
};

const KnowledgeTree: React.FC<KnowledgeTreeProps> = ({ data }) => {
  const [history, setHistory] = useState<KnowledgeNode[]>([]);
  const [currentNode, setCurrentNode] = useState<KnowledgeNode>(data);
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [expandingNode, setExpandingNode] = useState<boolean>(false);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 初始化时添加根节点到缓存
  useEffect(() => {
    addToCache(data);
  }, [data]);

  // 当 currentNode 改变时更新视图
  useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // 1. 添加中心节点 (当前节点)
    newNodes.push({
      id: 'root',
      type: 'custom',
      position: { x: 0, y: 0 },
      data: { ...currentNode, isRoot: true },
    });
    
    // 2. 添加子节点 (环形布局)
    if (currentNode.children && currentNode.children.length > 0) {
      const count = currentNode.children.length;
      const radius = 350; // 半径
      
      currentNode.children.forEach((child, index) => {
        // 计算角度 (从上方开始)
        const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        newNodes.push({
          id: `child-${index}`,
          type: 'custom',
          position: { x, y },
          data: { ...child, isRoot: false },
        });
        
        newEdges.push({
          id: `edge-${index}`,
          source: 'root',
          target: `child-${index}`,
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 },
        });
      });
    }
    
    setNodes(newNodes);
    setEdges(newEdges);
  }, [currentNode, setNodes, setEdges]);
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // 处理节点点击
  const onNodeClick: NodeMouseHandler = (event, node) => {
    if (node.id === 'root') {
      setSelectedNode(currentNode);
    } else if (node.id.startsWith('child-')) {
      const index = parseInt(node.id.split('-')[1]);
      const child = currentNode.children[index];
      setSelectedNode(child);
    }
  };

  // 进入下一级（自动生成子节点）
  const handleEnterChild = async (child: KnowledgeNode) => {
    // 如果已有子节点，直接进入
    if (child.children && child.children.length > 0) {
      addToCache(child);
      setHistory([...history, currentNode]);
      setCurrentNode(child);
      setSelectedNode(null);
      return;
    }

    // 如果没有子节点，先生成
    setExpandingNode(true);
    try {
      // 先检查缓存
      const cachedNode = getFromCache(child);
      if (cachedNode && cachedNode.children && cachedNode.children.length > 0) {
        addToCache(cachedNode);
        setHistory([...history, currentNode]);
        setCurrentNode(cachedNode);
        setSelectedNode(null);
        setExpandingNode(false);
        return;
      }

      // 调用API生成子节点
      const { expandNode } = await import('../services/api');
      const expandedNode = await expandNode(child.title, child.summary, 'deepseek');
      
      const updatedNode = { ...child, children: expandedNode.children };
      addToCache(updatedNode);
      
      // 进入下一级
      setHistory([...history, currentNode]);
      setCurrentNode(updatedNode);
      setSelectedNode(null);
      
    } catch (error) {
      console.error('生成子节点失败:', error);
      alert('生成子节点失败，请稍后重试');
    } finally {
      setExpandingNode(false);
    }
  };

  // 扩展节点的子节点
  const handleExpandNode = async (node: KnowledgeNode) => {
    setExpandingNode(true);
    try {
      // 先检查缓存
      const cachedNode = getFromCache(node);
      if (cachedNode && cachedNode.children && cachedNode.children.length > 0) {
        // 使用缓存的数据
        if (selectedNode) {
          setSelectedNode(cachedNode);
        }
        // 更新当前节点（如果是当前显示的节点）
        if (currentNode.title === node.title) {
          setCurrentNode(cachedNode);
        }
        setExpandingNode(false);
        return;
      }

      // 调用API扩展节点
      const { expandNode } = await import('../services/api');
      const expandedNode = await expandNode(node.title, node.summary, 'deepseek');
      
      // 更新节点数据
      const updatedNode = { ...node, children: expandedNode.children };
      
      // 添加到缓存
      addToCache(updatedNode);
      
      // 更新选中节点
      if (selectedNode && selectedNode.title === node.title) {
        setSelectedNode(updatedNode);
      }
      
      // 更新当前节点（如果正在查看这个节点）
      if (currentNode.title === node.title) {
        setCurrentNode(updatedNode);
      }
      
      // 更新历史记录中的节点
      setHistory(history.map(h => 
        h.title === node.title ? updatedNode : h
      ));
      
    } catch (error) {
      console.error('扩展节点失败:', error);
      alert('扩展节点失败，请稍后重试');
    } finally {
      setExpandingNode(false);
    }
  };

  // 返回上一级
  const handleBack = () => {
    if (history.length > 0) {
      const previousNode = history[history.length - 1];
      setHistory(history.slice(0, -1));
      setCurrentNode(previousNode);
      setSelectedNode(null);
    }
  };

  // 面包屑导航点击
  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // 回到根节点 (如果 history 为空则不操作)
      if (history.length > 0) {
        setCurrentNode(history[0]);
        setHistory([]);
      }
    } else {
      // 回到历史记录中的某一级
      const targetNode = history[index];
      const newHistory = history.slice(0, index);
      setCurrentNode(targetNode);
      setHistory(newHistory);
    }
  };

  return (
    <div className="knowledge-graph-container" style={{ position: 'relative' }}>
      {/* 详情侧边栏 */}
      {selectedNode && (
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
              onClick={() => setSelectedNode(null)}
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
                onClick={() => handleEnterChild(selectedNode)}
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
                onClick={() => handleExpandNode(selectedNode)}
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
          </div>
          
          {/* 缓存信息 */}
          <div style={{ marginTop: '15px', padding: '8px', background: 'rgba(100, 100, 100, 0.1)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            缓存: {cacheKeys.length}/{MAX_CACHE_SIZE}
          </div>
        </div>
      )}
      {/* 导航栏 */}
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
          onClick={handleBack}
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
          
        </button>
        
        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', whiteSpace: 'nowrap', alignItems: 'center' }}>
          {/* 根节点面包屑 */}
          <span 
            onClick={() => handleBreadcrumbClick(-1)}
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
                onClick={() => handleBreadcrumbClick(index + 1)}
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

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background gap={12} size={1} />
        <Controls />
        <MiniMap 
          nodeColor={() => '#3b82f6'}
          maskColor="rgba(15, 23, 42, 0.6)"
          style={{ background: 'rgba(30, 41, 59, 0.5)' }}
        />
      </ReactFlow>
    </div>
  );
};

export default KnowledgeTree;