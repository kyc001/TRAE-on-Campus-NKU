import { useState, useCallback } from 'react';
import { KnowledgeNode } from '../types';
import { askAI } from '../services/api';

/**
 * 自定义 Hook 用于管理 AI 解释功能
 */
export const useAIExplanation = () => {
  const [explanation, setExplanation] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * 请求 AI 解释知识点
   */
  const requestExplanation = useCallback(async (
    node: KnowledgeNode,
    contextPath: string,
    model: string = 'deepseek'
  ) => {
    setLoading(true);
    setShowExplanation(true);
    setExplanation('');
    
    try {
      const result = await askAI(node.title, node.summary, contextPath, model);
      setExplanation(result);
      return result;
    } catch (error) {
      console.error('获取AI解释失败:', error);
      const errorMessage = '抱歉，获取解释失败，请稍后重试。';
      setExplanation(errorMessage);
      return errorMessage;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 关闭解释弹窗
   */
  const closeExplanation = useCallback(() => {
    setShowExplanation(false);
  }, []);

  /**
   * 清空解释内容
   */
  const clearExplanation = useCallback(() => {
    setExplanation('');
    setShowExplanation(false);
    setLoading(false);
  }, []);

  return {
    explanation,
    showExplanation,
    loading,
    requestExplanation,
    closeExplanation,
    clearExplanation,
  };
};

export default useAIExplanation;
