import { cover } from '../cover';
import type { BlogPost } from '../types';

export const BLOG_EMPLOYEE_EXPERIENCE_2026: BlogPost = {
  id: 'blog-4',
  slug: 'employee-experience-2026',
  title: '从入职到离职：如何设计员工全生命周期体验',
  excerpt: '员工体验不是福利堆砌，而是每一个关键节点的流畅与尊重。',
  content: `## 员工体验的经济价值
盖洛普研究显示，高敬业度团队的盈利能力高出 21%。

## 关键节点
- **入职前**：Offer 体验到设备准备
- **入职日**：文化融入与导师匹配
- **在职期**：成长机会与持续反馈
- **离职时**：体面告别与校友网络

## 数字化工具的角色
工具应减少 friction，而非增加打卡负担。`,
  coverImage: cover('员工体验'),
  createdAt: '2026-04-28T07:00:00.000Z',
  updatedAt: '2026-04-28T07:00:00.000Z',
  category: { id: 'cat-practice', name: '最佳实践', slug: 'practice' },
  tags: [{ id: 't7', name: '员工体验' }, { id: 't8', name: '敬业度' }],
  status: 'PUBLISHED',
};
