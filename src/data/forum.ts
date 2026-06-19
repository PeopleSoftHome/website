/**
 * 论坛静态 Fallback 数据
 * 当 CMS / API 不可用时作为降级数据使用
 */

export const FORUM_CATEGORIES = [
  { id: 'cat-product', name: '产品交流', slug: 'product' },
  { id: 'cat-practice', name: '最佳实践', slug: 'practice' },
  { id: 'cat-qa', name: '问题求助', slug: 'qa' },
  { id: 'cat-industry', name: '行业动态', slug: 'industry' },
];

export const FORUM_TOPICS = [
  {
    id: '1',
    title: 'AI 面试官的评估结果和人工终面差异大吗？',
    content: `我们最近上线了 AI 面试官，想了解一下大家的实践经验：

- AI 评分与人工终面的一致性如何？
- 哪些岗位更适合用 AI 初筛？
- 如何校准 AI 的评估标准？

欢迎大家分享案例。`,
    createdAt: '2026-06-10T08:00:00.000Z',
    updatedAt: '2026-06-10T08:00:00.000Z',
    category: { id: 'cat-product', name: '产品交流', slug: 'product' },
    author: { id: 'u1', name: '张经理', avatar: '' },
    isPinned: true,
    isLocked: false,
    viewCount: 1240,
    _count: { posts: 3 },
    posts: [
      { id: 'r1', content: '我们测试了 200 个候选人，AI 与终面一致性约 85%，技术岗位更高。', createdAt: '2026-06-10T09:00:00.000Z', author: { id: 'u2', name: '李 HR', avatar: '' } },
      { id: 'r2', content: '建议每月用终面结果回标一批数据，持续提升模型。', createdAt: '2026-06-10T10:00:00.000Z', author: { id: 'u3', name: '王总监', avatar: '' } },
      { id: 'r3', content: '销售岗位慎用，行为面试还是人工更准。', createdAt: '2026-06-10T11:00:00.000Z', author: { id: 'u4', name: '赵顾问', avatar: '' } },
    ],
  },
  {
    id: '2',
    title: 'OKR 和 KPI 双轨运行，大家的实践经验是什么？',
    content: `公司明年准备 OKR 与 KPI 并行，想请教几个问题：

1. 目标设定周期怎么安排？
2. 考核奖金按 KPI 还是 OKR？
3. 如何避免员工写两套目标？`,
    createdAt: '2026-06-08T07:00:00.000Z',
    updatedAt: '2026-06-08T07:00:00.000Z',
    category: { id: 'cat-practice', name: '最佳实践', slug: 'practice' },
    author: { id: 'u5', name: '陈 HRD', avatar: '' },
    isPinned: true,
    isLocked: false,
    viewCount: 980,
    _count: { posts: 2 },
    posts: [
      { id: 'r4', content: '我们是季度 OKR + 年度 KPI，奖金按 KPI，OKR 用于发展。', createdAt: '2026-06-08T08:00:00.000Z', author: { id: 'u6', name: '刘经理', avatar: '' } },
      { id: 'r5', content: '关键是让员工理解两套目标的关系，否则就是形式主义。', createdAt: '2026-06-08T09:00:00.000Z', author: { id: 'u7', name: '孙总监', avatar: '' } },
    ],
  },
  {
    id: '3',
    title: '如何向老板证明 HR 数字化项目的 ROI？',
    content: `年底要申报明年预算，老板问 ROI。除了招聘周期、算薪时间，还有哪些量化指标更容易被管理层接受？`,
    createdAt: '2026-06-05T06:00:00.000Z',
    updatedAt: '2026-06-05T06:00:00.000Z',
    category: { id: 'cat-practice', name: '最佳实践', slug: 'practice' },
    author: { id: 'u8', name: '马总监', avatar: '' },
    isPinned: false,
    isLocked: false,
    viewCount: 756,
    _count: { posts: 2 },
    posts: [
      { id: 'r6', content: '我们用离职成本公式算了一笔账，保留率提升 5% 相当于节省 800 万。', createdAt: '2026-06-05T07:00:00.000Z', author: { id: 'u9', name: '钱经理', avatar: '' } },
      { id: 'r7', content: '老板最在乎的是人均产出和人力成本占比。', createdAt: '2026-06-05T08:00:00.000Z', author: { id: 'u10', name: '田顾问', avatar: '' } },
    ],
  },
  {
    id: '4',
    title: '薪酬系统对接个税接口报错，有人遇到过吗？',
    content: `最近在对接自然人电子税务局接口，偶尔会出现「token 过期」报错，但 token 明明是刚申请的。`,
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
    category: { id: 'cat-qa', name: '问题求助', slug: 'qa' },
    author: { id: 'u11', name: '周薪酬', avatar: '' },
    isPinned: false,
    isLocked: false,
    viewCount: 432,
    _count: { posts: 1 },
    posts: [
      { id: 'r8', content: '检查系统时间与税局服务器时间是否同步，我们之前差了两分钟导致 token 校验失败。', createdAt: '2026-06-01T11:00:00.000Z', author: { id: 'u12', name: '吴开发', avatar: '' } },
    ],
  },
  {
    id: '5',
    title: '2026 年 HR 科技趋势：AI 代理会成为新入口吗？',
    content: `Gartner 预测到 2027 年，50% 的员工日常 HR 请求将由 AI 代理处理。大家觉得这个预测靠谱吗？`,
    createdAt: '2026-05-28T09:00:00.000Z',
    updatedAt: '2026-05-28T09:00:00.000Z',
    category: { id: 'cat-industry', name: '行业动态', slug: 'industry' },
    author: { id: 'u13', name: '郑分析师', avatar: '' },
    isPinned: false,
    isLocked: false,
    viewCount: 1120,
    _count: { posts: 3 },
    posts: [
      { id: 'r9', content: '政策咨询、假期余额、证明开具这些标准化请求很适合 AI 代理。', createdAt: '2026-05-28T10:00:00.000Z', author: { id: 'u14', name: '何经理', avatar: '' } },
      { id: 'r10', content: '涉及敏感人事决策的，还是要有明确的人工 escalations 机制。', createdAt: '2026-05-28T11:00:00.000Z', author: { id: 'u15', name: '林顾问', avatar: '' } },
      { id: 'r11', content: '关键是知识库要维护好，否则 AI 会一本正经胡说。', createdAt: '2026-05-28T12:00:00.000Z', author: { id: 'u16', name: '黄 HR', avatar: '' } },
    ],
  },
  {
    id: '6',
    title: '校招季来了，如何提高简历筛选效率？',
    content: `每年校招都要处理几万份简历，有没有好的方法或工具推荐？`,
    createdAt: '2026-05-20T08:00:00.000Z',
    updatedAt: '2026-05-20T08:00:00.000Z',
    category: { id: 'cat-practice', name: '最佳实践', slug: 'practice' },
    author: { id: 'u17', name: '冯校招', avatar: '' },
    isPinned: false,
    isLocked: false,
    viewCount: 645,
    _count: { posts: 1 },
    posts: [
      { id: 'r12', content: '建议用 AI 初筛 + 测评组合，把人工精力留给终面和高潜候选人的保温。', createdAt: '2026-05-20T09:00:00.000Z', author: { id: 'u18', name: '魏专家', avatar: '' } },
    ],
  },
];

export const FORUM_TOPIC_MAP = Object.fromEntries(FORUM_TOPICS.map((t) => [String(t.id), t]));
