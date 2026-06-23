import { cover } from '../cover';
import type { BlogPost } from '../types';

export const BLOG_AI_FAMILY_3_DEEP_DIVE: BlogPost = {
  id: 'blog-5',
  slug: 'ai-family-3-deep-dive',
  title: 'TalentPro AI Family 3.0 技术解读：10 大助手如何协同',
  excerpt: 'AI Family 3.0 不是单点工具，而是覆盖招聘、绩效、学习、员工服务的智能体网络。',
  content: `## 架构升级
AI Family 3.0 采用统一大模型底座 + 垂直领域小模型 + 企业知识库的三层架构。

## 10 大助手协作场景
- 招聘助手筛选候选人
- 面试官承担初面
- 薪酬助手回答政策问题
- 学习助手推荐课程
- 绩效助手生成洞察
- 员工服务助手 7×24 在线

## 安全与可控
所有 AI 输出均可追溯，关键决策保留人工复核。`,
  coverImage: cover('AI Family'),
  createdAt: '2026-04-15T06:00:00.000Z',
  updatedAt: '2026-04-15T06:00:00.000Z',
  category: { id: 'cat-product', name: '产品更新', slug: 'product' },
  tags: [{ id: 't9', name: 'AI Family' }, { id: 't10', name: '产品发布' }],
  status: 'PUBLISHED',
};
