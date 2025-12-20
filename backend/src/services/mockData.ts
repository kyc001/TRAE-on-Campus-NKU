// 模拟的知识网络数据，用于测试
export const mockKnowledgeNetworks = {
  // AI 基础课程示例
  aiBasics: {
    title: "人工智能基础课程",
    summary: "涵盖机器学习、神经网络和深度学习的核心概念与应用",
    children: [
      {
        title: "机器学习概述",
        summary: "机器学习是AI的核心，通过数据学习模式和规律",
        children: [
          {
            title: "监督学习",
            summary: "使用标注数据训练模型，如分类和回归任务",
            children: []
          },
          {
            title: "无监督学习",
            summary: "从无标注数据中发现模式，如聚类和降维",
            children: []
          },
          {
            title: "强化学习",
            summary: "通过奖励机制学习最优决策策略",
            children: []
          }
        ]
      },
      {
        title: "神经网络",
        summary: "模拟人脑神经元结构的计算模型",
        children: [
          {
            title: "网络结构",
            summary: "包含输入层、隐藏层和输出层的多层架构",
            children: []
          },
          {
            title: "反向传播算法",
            summary: "通过梯度下降优化网络权重的训练方法",
            children: []
          },
          {
            title: "激活函数",
            summary: "引入非线性特性，如ReLU、Sigmoid等",
            children: []
          }
        ]
      },
      {
        title: "深度学习",
        summary: "使用多层神经网络进行特征学习的技术",
        children: [
          {
            title: "卷积神经网络(CNN)",
            summary: "专门处理图像数据的深度学习架构",
            children: []
          },
          {
            title: "循环神经网络(RNN)",
            summary: "处理序列数据的网络结构，适用于时间序列",
            children: []
          },
          {
            title: "自动特征提取",
            summary: "深度网络能自动学习数据的层次化表示",
            children: []
          },
          {
            title: "预训练模型",
            summary: "使用大规模数据预训练的通用模型如BERT、GPT",
            children: []
          }
        ]
      }
    ]
  },

  // 数据结构示例
  dataStructures: {
    title: "数据结构与算法",
    summary: "计算机科学的基础，包含常用数据结构和算法设计",
    children: [
      {
        title: "线性数据结构",
        summary: "元素按线性顺序组织的数据结构",
        children: [
          {
            title: "数组",
            summary: "连续内存空间存储，支持O(1)随机访问",
            children: []
          },
          {
            title: "链表",
            summary: "通过指针连接节点，插入删除O(1)时间",
            children: []
          },
          {
            title: "栈和队列",
            summary: "特殊的线性结构，遵循LIFO和FIFO原则",
            children: []
          }
        ]
      },
      {
        title: "树形结构",
        summary: "层次化的非线性数据结构",
        children: [
          {
            title: "二叉树",
            summary: "每个节点最多两个子节点的树结构",
            children: []
          },
          {
            title: "平衡树",
            summary: "如AVL树、红黑树，保持树高度平衡",
            children: []
          },
          {
            title: "堆",
            summary: "完全二叉树实现的优先队列",
            children: []
          }
        ]
      },
      {
        title: "图与哈希",
        summary: "复杂关系和快速查找的数据结构",
        children: [
          {
            title: "图的表示",
            summary: "邻接表和邻接矩阵表示节点关系",
            children: []
          },
          {
            title: "图遍历算法",
            summary: "BFS和DFS两种基本遍历方式",
            children: []
          },
          {
            title: "哈希表",
            summary: "通过哈希函数实现O(1)平均查找时间",
            children: []
          }
        ]
      }
    ]
  },

  // 通用默认示例
  default: {
    title: "知识网络",
    summary: "基于提供内容生成的结构化知识图谱",
    children: [
      {
        title: "核心概念1",
        summary: "第一个主要知识点的概述",
        children: [
          {
            title: "子概念1.1",
            summary: "详细说明和应用场景",
            children: []
          },
          {
            title: "子概念1.2",
            summary: "相关理论和实践方法",
            children: []
          }
        ]
      },
      {
        title: "核心概念2",
        summary: "第二个主要知识点的概述",
        children: [
          {
            title: "子概念2.1",
            summary: "基础原理和定义",
            children: []
          },
          {
            title: "子概念2.2",
            summary: "实际应用和案例",
            children: []
          },
          {
            title: "子概念2.3",
            summary: "扩展知识和进阶内容",
            children: []
          }
        ]
      },
      {
        title: "核心概念3",
        summary: "第三个主要知识点的概述",
        children: [
          {
            title: "子概念3.1",
            summary: "关键技术和方法论",
            children: []
          },
          {
            title: "子概念3.2",
            summary: "最佳实践和注意事项",
            children: []
          }
        ]
      }
    ]
  }
};

// 根据内容关键词选择合适的模拟数据
export function getMockData(content: string): any {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('机器学习') || lowerContent.includes('神经网络') || lowerContent.includes('深度学习') || lowerContent.includes('人工智能')) {
    return mockKnowledgeNetworks.aiBasics;
  }
  
  if (lowerContent.includes('数据结构') || lowerContent.includes('算法') || lowerContent.includes('链表') || lowerContent.includes('二叉树')) {
    return mockKnowledgeNetworks.dataStructures;
  }
  
  return mockKnowledgeNetworks.default;
}
