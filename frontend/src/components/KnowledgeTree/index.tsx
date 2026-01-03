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
import 'react-flow-renderer/dist/style.css';
import 'katex/dist/katex.min.css';

import { KnowledgeNode } from '../../types';
import { expandNode as apiExpandNode } from '../../services/api';
import { useNodeCache, useNodeNavigation, useAIExplanation } from '../../hooks';
import CustomNode from './CustomNode';
import AIExplanationModal from './AIExplanationModal';
import DetailsSidebar from './DetailsSidebar';
import NavigationBar from './NavigationBar';

interface KnowledgeTreeProps {
    data: KnowledgeNode;
    onDataChange?: (data: KnowledgeNode) => void;
}

// 节点类型配置
const nodeTypes: NodeTypes = {
    custom: CustomNode,
};

// 预加载深度阈值
const PRELOAD_DEPTH_THRESHOLD = 10;

// 深度更新节点树（递归查找并更新节点）
const updateNodeInTree = (
    root: KnowledgeNode,
    parentNode: KnowledgeNode,
    oldNode: KnowledgeNode,
    newNode: KnowledgeNode
): KnowledgeNode => {
    if (root.title === parentNode.title && root.summary === parentNode.summary) {
        return {
            ...root,
            children: root.children.map(child =>
                child.title === oldNode.title && child.summary === oldNode.summary
                    ? newNode
                    : child
            )
        };
    }

    if (root.children && root.children.length > 0) {
        return {
            ...root,
            children: root.children.map(child =>
                updateNodeInTree(child, parentNode, oldNode, newNode)
            )
        };
    }

    return root;
};

const KnowledgeTree: React.FC<KnowledgeTreeProps> = ({ data, onDataChange }) => {
    // 使用自定义 Hooks
    const { addToCache, getFromCache, cacheSize, maxSize } = useNodeCache({ maxSize: 50 });
    const {
        history,
        currentNode,
        getCurrentDepth,
        navigateToChild,
        navigateBack,
        navigateToBreadcrumb,
        updateCurrentNode,
        updateHistoryNode,
        getBreadcrumbPath,
    } = useNodeNavigation(data);
    const {
        explanation: aiExplanation,
        showExplanation,
        loading: loadingExplanation,
        requestExplanation,
        closeExplanation,
    } = useAIExplanation();

    // 局部状态
    const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
    const [expandingNode, setExpandingNode] = useState<boolean>(false);
    const [preloadingNodes, setPreloadingNodes] = useState<Set<string>>(new Set());

    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    // 初始化时添加根节点到缓存
    useEffect(() => {
        addToCache(data);
    }, [data, addToCache]);

    // 当 currentNode 改变时更新视图
    useEffect(() => {
        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        newNodes.push({
            id: 'root',
            type: 'custom',
            position: { x: 0, y: 0 },
            data: { ...currentNode, isRoot: true },
        });

        if (currentNode.children && currentNode.children.length > 0) {
            const count = currentNode.children.length;
            const radius = 350;

            currentNode.children.forEach((child, index) => {
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
    const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
        if (node.id === 'root') {
            setSelectedNode(currentNode);
        } else if (node.id.startsWith('child-')) {
            const index = parseInt(node.id.split('-')[1]);
            const child = currentNode.children[index];
            setSelectedNode(child);
        }
    }, [currentNode]);

    // 生成节点缓存键
    const getNodeCacheKey = useCallback((node: KnowledgeNode): string => {
        return `${node.title}_${node.summary?.substring(0, 20) || ''}`;
    }, []);

    // 预加载节点的子节点和孙节点
    const preloadNodeDescendants = useCallback(async (node: KnowledgeNode, depth: number) => {
        if (depth >= PRELOAD_DEPTH_THRESHOLD) {
            console.log(`深度 ${depth} 已达阈值 ${PRELOAD_DEPTH_THRESHOLD}，停止预加载`);
            return;
        }

        const nodeKey = getNodeCacheKey(node);

        if (preloadingNodes.has(nodeKey)) return;

        try {
            setPreloadingNodes(prev => new Set(prev).add(nodeKey));

            if (!node.children || node.children.length === 0) {
                const expandedNode = await apiExpandNode(node.title, node.summary, 'deepseek');
                node.children = expandedNode.children || [];
                addToCache(node);
                console.log(`预加载：为 "${node.title}" 生成了 ${node.children.length} 个子节点`);
            }

            if (depth + 1 < PRELOAD_DEPTH_THRESHOLD && node.children && node.children.length > 0) {
                const preloadPromises = node.children.map(async (child) => {
                    if (!child.children || child.children.length === 0) {
                        try {
                            const expandedChild = await apiExpandNode(child.title, child.summary, 'deepseek');
                            child.children = expandedChild.children || [];
                            addToCache(child);
                            console.log(`预加载：为 "${child.title}" 生成了 ${child.children.length} 个孙节点`);
                        } catch (error) {
                            console.warn(`预加载 "${child.title}" 的子节点失败:`, error);
                        }
                    }
                });

                Promise.all(preloadPromises).catch(err => {
                    console.warn('部分预加载失败:', err);
                });
            }
        } catch (error) {
            console.error(`预加载 "${node.title}" 失败:`, error);
        } finally {
            setPreloadingNodes(prev => {
                const newSet = new Set(prev);
                newSet.delete(nodeKey);
                return newSet;
            });
        }
    }, [preloadingNodes, addToCache, getNodeCacheKey]);

    // 进入下一级
    const handleEnterChild = useCallback(async (child: KnowledgeNode) => {
        const depth = getCurrentDepth();

        if (child.children && child.children.length > 0) {
            addToCache(child);
            navigateToChild(child);
            setSelectedNode(null);

            if (depth + 1 < PRELOAD_DEPTH_THRESHOLD) {
                preloadNodeDescendants(child, depth + 1);
            }
            return;
        }

        setExpandingNode(true);
        try {
            const cachedNode = getFromCache(child);
            if (cachedNode && cachedNode.children && cachedNode.children.length > 0) {
                addToCache(cachedNode);
                navigateToChild(cachedNode);
                setSelectedNode(null);

                if (depth + 1 < PRELOAD_DEPTH_THRESHOLD) {
                    preloadNodeDescendants(cachedNode, depth + 1);
                }
                setExpandingNode(false);
                return;
            }

            const expandedNode = await apiExpandNode(child.title, child.summary, 'deepseek');
            const updatedNode = { ...child, children: expandedNode.children || [] };
            addToCache(updatedNode);

            console.log('生成的子节点:', expandedNode.children);

            const updatedData = updateNodeInTree(data, currentNode, child, updatedNode);
            if (onDataChange) {
                onDataChange(updatedData);
            }

            navigateToChild(updatedNode);
            setSelectedNode(null);

            if (depth + 1 < PRELOAD_DEPTH_THRESHOLD) {
                preloadNodeDescendants(updatedNode, depth + 1);
            }

        } catch (error) {
            console.error('生成子节点失败:', error);
            alert('生成子节点失败，请稍后重试');
        } finally {
            setExpandingNode(false);
        }
    }, [currentNode, data, onDataChange, getCurrentDepth, addToCache, getFromCache, navigateToChild, preloadNodeDescendants]);

    // 扩展节点的子节点
    const handleExpandNode = useCallback(async (node: KnowledgeNode) => {
        setExpandingNode(true);
        try {
            const cachedNode = getFromCache(node);
            if (cachedNode && cachedNode.children && cachedNode.children.length > 0) {
                if (selectedNode) {
                    setSelectedNode(cachedNode);
                }
                if (currentNode.title === node.title) {
                    updateCurrentNode(cachedNode);
                }
                setExpandingNode(false);
                return;
            }

            const expandedNode = await apiExpandNode(node.title, node.summary, 'deepseek');

            console.log('扩展节点返回数据:', expandedNode);
            console.log('子节点数量:', expandedNode.children?.length);

            const existingChildren = node.children || [];
            const newChildren = expandedNode.children || [];
            const updatedNode = { ...node, children: [...existingChildren, ...newChildren] };

            addToCache(updatedNode);

            const updatedData = updateNodeInTree(data, currentNode, node, updatedNode);
            if (onDataChange) {
                onDataChange(updatedData);
            }

            if (selectedNode && selectedNode.title === node.title) {
                setSelectedNode(updatedNode);
            }

            if (currentNode.title === node.title) {
                updateCurrentNode(updatedNode);
            }

            updateHistoryNode(h => h.title === node.title, updatedNode);

        } catch (error) {
            console.error('扩展节点失败:', error);
            alert('扩展节点失败，请稍后重试');
        } finally {
            setExpandingNode(false);
        }
    }, [selectedNode, currentNode, data, onDataChange, addToCache, getFromCache, updateCurrentNode, updateHistoryNode]);

    // 问AI解释知识点
    const handleAskAI = useCallback(async (node: KnowledgeNode) => {
        const contextPath = getBreadcrumbPath().join(' > ') + ' > ' + node.title;
        await requestExplanation(node, contextPath, 'deepseek');
    }, [getBreadcrumbPath, requestExplanation]);

    // 返回上一级
    const handleBack = useCallback(() => {
        if (navigateBack()) {
            setSelectedNode(null);
            closeExplanation();
        }
    }, [navigateBack, closeExplanation]);

    // 面包屑导航点击
    const handleBreadcrumbClick = useCallback((index: number) => {
        navigateToBreadcrumb(index);
    }, [navigateToBreadcrumb]);

    return (
        <div className="knowledge-graph-container" style={{ position: 'relative' }}>
            {/* 详情侧边栏 */}
            {selectedNode && (
                <DetailsSidebar
                    selectedNode={selectedNode}
                    currentNode={currentNode}
                    expandingNode={expandingNode}
                    loadingExplanation={loadingExplanation}
                    cacheSize={cacheSize}
                    maxCacheSize={maxSize}
                    currentDepth={getCurrentDepth()}
                    preloadDepthThreshold={PRELOAD_DEPTH_THRESHOLD}
                    preloadingNodesCount={preloadingNodes.size}
                    onClose={() => setSelectedNode(null)}
                    onEnterChild={handleEnterChild}
                    onExpandNode={handleExpandNode}
                    onAskAI={handleAskAI}
                />
            )}

            {/* AI解释弹窗 */}
            <AIExplanationModal
                show={showExplanation}
                loading={loadingExplanation}
                explanation={aiExplanation}
                onClose={closeExplanation}
            />

            {/* 导航栏 */}
            <NavigationBar
                history={history}
                currentNode={currentNode}
                onBack={handleBack}
                onBreadcrumbClick={handleBreadcrumbClick}
            />

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
