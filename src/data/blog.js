/**
 * 博客静态 Fallback 数据
 * 当 CMS / API 不可用时作为降级数据使用
 */

export const BLOG_CATEGORIES = [
  { id: 'cat-insight', name: '行业洞察', slug: 'insight' },
  { id: 'cat-product', name: '产品更新', slug: 'product' },
  { id: 'cat-practice', name: '最佳实践', slug: 'practice' },
  { id: 'cat-ai', name: 'AI 专栏', slug: 'ai' },
];

const cover = (text) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%233B82F6'/%3E%3Cstop offset='100%25' stop-color='%238B5CF6'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='32' fill='white' font-family='system-ui'%3E${encodeURIComponent(text)}%3C/text%3E%3C/svg%3E`;

export const BLOG_POSTS = [
  {
    id: 'blog-1',
    slug: 'ai-recruiting-2026',
    title: '2026 AI 招聘深度指南：从简历筛选到智能面试的落地路径',
    excerpt: 'AI 招聘已从概念验证进入规模化落地阶段。本文拆解简历解析、人岗匹配、AI 面试、Offer 预测四大核心环节的实现要点。',
    content: `## 一、AI 招聘的核心价值
在人才竞争日益激烈的今天，招聘效率直接决定企业的人才密度。AI 招聘通过自动化处理重复性工作，让 HR 回归高价值沟通。

## 二、简历解析的技术演进
从规则模板到深度学习，现代简历解析引擎能够处理 50+ 种格式，关键信息提取准确率超过 95%。

## 三、人岗匹配的关键指标
匹配评分不应只看关键词重叠，而应结合岗位胜任力模型、候选人潜力、文化契合度等多维因素。

## 四、AI 面试的最佳实践
AI 面试官适合初筛场景，能够 7×24 小时工作，但仍需人类 HR 参与终面与关键决策。

## 五、落地建议
1. 从岗位数量大、流程标准化的职位开始试点
2. 建立算法公平性审查机制
3. 持续收集用人部门反馈，迭代模型`,
    coverImage: cover('AI 招聘'),
    createdAt: '2026-05-20T10:00:00.000Z',
    updatedAt: '2026-05-20T10:00:00.000Z',
    category: { id: 'cat-ai', name: 'AI 专栏', slug: 'ai' },
    tags: [{ id: 't1', name: 'AI 招聘' }, { id: 't2', name: '人岗匹配' }],
    status: 'PUBLISHED',
  },
  {
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
  },
  {
    id: 'blog-3',
    slug: 'hr-data-security',
    title: 'HR SaaS 数据安全 checklist：等保三级只是起点',
    excerpt: '员工数据是企业最敏感的资产之一。本文梳理 HR 系统选型时必须验证的 12 项安全能力。',
    content: `## 数据安全为何是 HR SaaS 的生命线
从身份信息到薪酬数据，HR 系统存储着企业最核心的人员数据。

## 12 项核心能力
1. 传输加密与存储加密
2. 细粒度权限控制
3. 操作审计日志
4. 数据脱敏与分级
5. 异地备份与灾备
6. 第三方安全认证
7. 隐私合规框架
8. API 访问控制
9. 员工自助授权
10. 数据生命周期管理
11. 渗透测试与漏洞响应
12. 供应商安全评估`,
    coverImage: cover('数据安全'),
    createdAt: '2026-05-08T08:00:00.000Z',
    updatedAt: '2026-05-08T08:00:00.000Z',
    category: { id: 'cat-insight', name: '行业洞察', slug: 'insight' },
    tags: [{ id: 't5', name: '数据安全' }, { id: 't6', name: '合规' }],
    status: 'PUBLISHED',
  },
  {
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
  },
  {
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
  },
  {
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
  },
];

export const BLOG_POST_MAP = Object.fromEntries(BLOG_POSTS.map((p) => [p.slug, p]));
