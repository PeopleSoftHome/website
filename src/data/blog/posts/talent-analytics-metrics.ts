import { cover } from '../cover';
import type { BlogPost } from '../types';

export const BLOG_TALENT_ANALYTICS_METRICS: BlogPost = {
  id: 'blog-6',
  slug: 'talent-analytics-metrics',
  title: 'HR 数据分析必看的 20 个指标',
  excerpt: '从招聘漏斗到离职预测，用数据说话，让 HR 决策更有底气。',
  content: `## 招聘类指标
- 简历转化率
- 渠道 ROI
- 平均到岗时间
- Offer 接受率

## 绩效类指标
- 目标对齐率
- 绩效分布合理性
- 高潜人才识别率

## 离职与保留
- 主动离职率
- 新员工流失率
- 关键人才保留率

## 学习与发展
- 培训覆盖率
- 学习完成率
- 技能提升转化率`,
  coverImage: cover('数据指标'),
  createdAt: '2026-04-02T05:00:00.000Z',
  updatedAt: '2026-04-02T05:00:00.000Z',
  category: { id: 'cat-insight', name: '行业洞察', slug: 'insight' },
  tags: [{ id: 't11', name: '数据分析' }, { id: 't12', name: 'HR 指标' }],
  status: 'PUBLISHED',
};
