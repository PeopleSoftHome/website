import { cover } from '../cover';
import type { BlogPost } from '../types';

export const BLOG_OKR_IMPLEMENTATION: BlogPost = {
  id: 'blog-2',
  slug: 'okr-implementation',
  title: 'OKR 落地失败？90% 的企业忽略了这三点',
  excerpt: '目标管理工具只是表象，真正的挑战在于组织共识、过程复盘和绩效解耦。',
  content: `## 为什么 OKR 会失效
很多企业把 OKR 当作另一种 KPI，导致员工不敢设定挑战性目标。

## 关键一：与绩效解耦
OKR 应该鼓励冒险，如果直接决定奖金，员工只会写保守目标。

## 关键二：过程重于结果
每周的 Check-in 和每季度的复盘，比最终的打分更有价值。

## 关键三：工具要简单
复杂的功能会提高使用门槛，先跑通流程再谈数字化。`,
  coverImage: cover('OKR 落地'),
  createdAt: '2026-05-15T09:00:00.000Z',
  updatedAt: '2026-05-15T09:00:00.000Z',
  category: { id: 'cat-practice', name: '最佳实践', slug: 'practice' },
  tags: [{ id: 't3', name: 'OKR' }, { id: 't4', name: '绩效管理' }],
  status: 'PUBLISHED',
};

export const BLOG_OKR_IMPLEMENTATION_EN: BlogPost = {
  id: 'blog-2',
  slug: 'okr-implementation',
  title: 'Why OKR Implementations Fail: Three Things 90% of Companies Miss',
  excerpt: 'Goal-management tools are only the surface. The real challenges are organizational alignment, process review, and decoupling from performance ratings.',
  content: `## Why OKR Fails
Many companies treat OKR as another form of KPI, making employees afraid to set ambitious goals.

## Key 1: Decouple from Performance Ratings
OKR should encourage risk-taking. If it directly determines bonuses, employees will only write conservative goals.

## Key 2: Process Matters More Than Results
Weekly check-ins and quarterly reviews are more valuable than the final score.

## Key 3: Keep Tools Simple
Complex features raise the barrier to entry. Run the process first, then digitize.`,
  coverImage: cover('OKR Implementation'),
  createdAt: '2026-05-15T09:00:00.000Z',
  updatedAt: '2026-05-15T09:00:00.000Z',
  category: { id: 'cat-practice', name: 'Best Practice', slug: 'practice' },
  tags: [{ id: 't3', name: 'OKR' }, { id: 't4', name: 'Performance Management' }],
  status: 'PUBLISHED',
};
