/**
 * searchIndex.ts — 全局搜索索引（Sprint 12 / v2.3.0）
 *
 * 结构：每条记录包含
 *   id:      唯一 ID
 *   type:    'product' | 'industry' | 'resource' | 'feature' | 'general'
 *   title:   搜索结果标题（中文，en 版本用同一索引 + i18n 处理）
 *   tags:    关键词数组（中英文混合，用于模糊命中）
 *   desc:    搜索结果描述
 *   section: 点击后滚动定位的 Section ID
 *   icon:    展示图标（Emoji）
 *   weight:  权重系数 0.5~1.0（影响排序）
 */
/* ══════════════ MARKETPLACE — 12 条 ══════════════ */
export const SEARCH_MARKETPLACE = [
  {
    id: 'mp-resume', type: 'marketplace', weight: 0.85,
    title: '智能简历筛选 Pro',
    tags: ['简历筛选','AI招聘','简历解析','marketplace','应用市场','应用广场'],
    desc: 'AI 驱动的简历解析与智能匹配，减少 80% 重复工作',
    section: 'marketplace', icon: 'search',
    route: '/marketplace/smart-resume-screen',
  },
  {
    id: 'mp-payroll', type: 'marketplace', weight: 0.85,
    title: '薪酬自动核算助手',
    tags: ['薪酬核算','算薪','个税','社保','marketplace','应用广场'],
    desc: '一键算薪，合规无忧，支持全国 300+ 城市个税政策',
    section: 'marketplace', icon: 'dollar-sign',
    route: '/marketplace/payroll-auto-calc',
  },
  {
    id: 'mp-okr', type: 'marketplace', weight: 0.8,
    title: 'OKR 协同助手',
    tags: ['OKR','目标管理','绩效','marketplace','应用广场'],
    desc: '目标对齐，执行落地，支持 O-KR 层层拆解',
    section: 'marketplace', icon: 'target',
    route: '/marketplace/okr-copilot',
  },
  {
    id: 'mp-lms', type: 'marketplace', weight: 0.8,
    title: '微课学习平台',
    tags: ['学习','培训','LMS','微课','marketplace','应用广场'],
    desc: '碎片化学习，体系化成长，AI 推荐个性化学习路径',
    section: 'marketplace', icon: 'book-open',
    route: '/marketplace/lms-microlearning',
  },
  {
    id: 'mp-pulse', type: 'marketplace', weight: 0.8,
    title: '员工心声洞察',
    tags: ['员工体验','满意度','调研','离职预警','marketplace','应用广场'],
    desc: '实时感知员工情绪，主动干预留存',
    section: 'marketplace', icon: 'heart',
    route: '/marketplace/employee-pulse',
  },
  {
    id: 'mp-compliance', type: 'marketplace', weight: 0.75,
    title: '合规卫士',
    tags: ['合规','法规','用工风险','合同预警','marketplace','应用广场'],
    desc: '自动追踪法规变化，降低用工风险',
    section: 'marketplace', icon: 'shield',
    route: '/marketplace/compliance-guard',
  },
  {
    id: 'mp-ai-interview', type: 'marketplace', weight: 0.9,
    title: 'AI 面试机器人',
    tags: ['AI面试','智能面试','视频面试','marketplace','应用广场'],
    desc: '7×24 自动面试，精准评估潜力',
    section: 'marketplace', icon: 'bot',
    route: '/marketplace/ai-interview-bot',
  },
  {
    id: 'mp-analytics', type: 'marketplace', weight: 0.85,
    title: 'HR 数据洞察 Pro',
    tags: ['HR分析','数据洞察','报表','BI','marketplace','应用广场'],
    desc: '400+ 指标，一键生成高管报表',
    section: 'marketplace', icon: 'bar-chart-2',
    route: '/marketplace/hr-analytics-pro',
  },
  {
    id: 'mp-campus', type: 'marketplace', weight: 0.75,
    title: '校园招聘套件',
    tags: ['校招','校园招聘','宣讲会','marketplace','应用广场'],
    desc: '从宣讲到 Offer，校招全流程数字化',
    section: 'marketplace', icon: 'users',
    route: '/marketplace/campus-recruit-suite',
  },
  {
    id: 'mp-benefits', type: 'marketplace', weight: 0.7,
    title: '弹性福利商城',
    tags: ['福利','弹性福利','员工关怀','marketplace','应用广场'],
    desc: '员工自选福利，企业成本可控',
    section: 'marketplace', icon: 'gift',
    route: '/marketplace/benefits-marketplace',
  },
  {
    id: 'mp-talentmap', type: 'marketplace', weight: 0.8,
    title: '人才地图 360',
    tags: ['人才地图','九宫格','继任','盘点','marketplace','应用广场'],
    desc: '可视化人才分布，精准决策继任',
    section: 'marketplace', icon: 'map',
    route: '/marketplace/talent-map-360',
  },
  {
    id: 'mp-onboarding', type: 'marketplace', weight: 0.8,
    title: '入职体验管家',
    tags: ['入职','onboarding','新人','导师','marketplace','应用广场'],
    desc: '让新人第一天就感受到归属',
    section: 'marketplace', icon: 'sparkles',
    route: '/marketplace/onboarding-experience',
  },
];

