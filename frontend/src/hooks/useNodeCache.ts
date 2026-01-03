import { useRef, useState, useCallback } from 'react';
import { KnowledgeNode } from '../types';

interface CacheOptions {
    maxSize?: number;
}

/**
 * 自定义 Hook 用于管理知识节点缓存
 * 使用 LRU (Least Recently Used) 策略进行缓存淘汰
 */
export const useNodeCache = (options: CacheOptions = {}) => {
    const { maxSize = 50 } = options;

    // 使用 Map 保持插入顺序，便于 LRU 淘汰
    const cacheRef = useRef<Map<string, KnowledgeNode>>(new Map());
    const [cacheSize, setCacheSize] = useState(0);

    /**
     * 生成节点的唯一缓存键
     */
    const getNodeCacheKey = useCallback((node: KnowledgeNode): string => {
        return `${node.title}_${node.summary?.substring(0, 20) || ''}`;
    }, []);

    /**
     * 添加节点到缓存
     * 如果缓存已满，会淘汰最早加入的节点
     */
    const addToCache = useCallback((node: KnowledgeNode) => {
        const key = getNodeCacheKey(node);
        const cache = cacheRef.current;

        // LRU: 如果缓存已满且节点不存在，删除最早的
        if (cache.size >= maxSize && !cache.has(key)) {
            const firstKey = cache.keys().next().value;
            if (firstKey) {
                cache.delete(firstKey);
            }
        }

        // 如果节点已存在，先删除再添加（移到末尾，表示最近使用）
        if (cache.has(key)) {
            cache.delete(key);
        }

        cache.set(key, node);
        setCacheSize(cache.size);
    }, [maxSize, getNodeCacheKey]);

    /**
     * 从缓存获取节点
     */
    const getFromCache = useCallback((node: KnowledgeNode): KnowledgeNode | null => {
        const key = getNodeCacheKey(node);
        const cachedNode = cacheRef.current.get(key);

        // LRU: 访问时移到末尾
        if (cachedNode) {
            cacheRef.current.delete(key);
            cacheRef.current.set(key, cachedNode);
        }

        return cachedNode || null;
    }, [getNodeCacheKey]);

    /**
     * 检查节点是否在缓存中
     */
    const hasInCache = useCallback((node: KnowledgeNode): boolean => {
        return cacheRef.current.has(getNodeCacheKey(node));
    }, [getNodeCacheKey]);

    /**
     * 清空缓存
     */
    const clearCache = useCallback(() => {
        cacheRef.current.clear();
        setCacheSize(0);
    }, []);

    return {
        addToCache,
        getFromCache,
        hasInCache,
        clearCache,
        cacheSize,
        maxSize,
    };
};

export default useNodeCache;
