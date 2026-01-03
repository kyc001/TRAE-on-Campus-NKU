import { useState, useCallback } from 'react';
import { KnowledgeNode } from '../types';

/**
 * 自定义 Hook 用于管理知识图谱的导航状态
 * 包括历史记录、当前节点和面包屑导航
 */
export const useNodeNavigation = (initialNode: KnowledgeNode) => {
  const [history, setHistory] = useState<KnowledgeNode[]>([]);
  const [currentNode, setCurrentNode] = useState<KnowledgeNode>(initialNode);

  /**
   * 计算当前深度
   */
  const getCurrentDepth = useCallback(() => history.length, [history.length]);

  /**
   * 进入下一级节点
   */
  const navigateToChild = useCallback((child: KnowledgeNode) => {
    setHistory(prev => [...prev, currentNode]);
    setCurrentNode(child);
  }, [currentNode]);

  /**
   * 返回上一级
   */
  const navigateBack = useCallback(() => {
    if (history.length > 0) {
      const previousNode = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentNode(previousNode);
      return true;
    }
    return false;
  }, [history]);

  /**
   * 面包屑导航点击
   * @param index -1 表示根节点，其他为历史记录索引
   */
  const navigateToBreadcrumb = useCallback((index: number) => {
    if (index === -1) {
      // 回到根节点
      if (history.length > 0) {
        setCurrentNode(history[0]);
        setHistory([]);
      }
    } else {
      // 回到历史记录中的某一级
      const targetNode = history[index];
      setCurrentNode(targetNode);
      setHistory(prev => prev.slice(0, index));
    }
  }, [history]);

  /**
   * 更新当前节点
   */
  const updateCurrentNode = useCallback((updatedNode: KnowledgeNode) => {
    setCurrentNode(updatedNode);
  }, []);

  /**
   * 更新历史记录中的节点
   */
  const updateHistoryNode = useCallback((predicate: (node: KnowledgeNode) => boolean, updatedNode: KnowledgeNode) => {
    setHistory(prev => prev.map(h => predicate(h) ? updatedNode : h));
  }, []);

  /**
   * 检查是否可以返回
   */
  const canGoBack = history.length > 0;

  /**
   * 获取面包屑路径
   */
  const getBreadcrumbPath = useCallback(() => {
    return [...history.map(h => h.title), currentNode.title];
  }, [history, currentNode]);

  return {
    history,
    currentNode,
    getCurrentDepth,
    navigateToChild,
    navigateBack,
    navigateToBreadcrumb,
    updateCurrentNode,
    updateHistoryNode,
    canGoBack,
    getBreadcrumbPath,
  };
};

export default useNodeNavigation;
