/**
 * 资源中心数据（SEC-11 ResourceSection）
 * v2.1.0：扩展至 6 条，新增 video / report(报告) 类型（ENH-03 完成）
 * type: 'report'(白皮书) | 'case'(案例集) | 'article'(干货文章) | 'video'(直播视频) | 'guide'(报告)
 */
export const RESOURCES = [
  /* ── 原有 3 条 ── */
  {
    id: 'whitepaper',
    type: 'report',
    typeLabel: '白皮书',
    icon: 'bar-chart',
    imgGrad: 'linear-gradient(135deg, #EBF1FF, #DBEAFE)',
    title: '《2026 HR 数智化成熟度模型白皮书》',
    desc: '首次发布 AI+HR 数智化成熟度模型 HRDIMM，整合 567 家企业调研洞察，适配不同成熟度企业的三阶转型方案。',
    date: '2026-01-15',
    cta: '立即获取',
  },
  {
    id: 'ai-cases',
    type: 'case',
    typeLabel: '案例集',
    icon: 'award',
    imgGrad: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
    title: '《2026 AI 面试官精选案例集》',
    desc: '茶颜悦色、海尔、信达生物等 11 家行业领军企业实战亲测，覆盖校招、社招、蓝领招聘全场景。',
    date: '2026-03-01',
    cta: '立即获取',
  },
  {
    id: 'ai-talent',
    type: 'article',
    typeLabel: '干货文章',
    icon: 'target',
    imgGrad: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)',
    title: '如何应用 AI 重塑企业人才盘点体系',
    desc: '从传统九宫格到 AI 驱动的数字化盘点，帮助 HR 实现更科学、更高效的人才评估，支撑战略人才储备。',
    date: '2026-02-20',
    cta: '查看详情',
  },

  /* ── 新增 3 条（v2.1.0）── */
  {
    id: 'campus-guide',
    type: 'report',
    typeLabel: '白皮书',
    icon: 'award',
    imgGrad: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
    title: '《2026 企业校园招聘 AI 应用实用指南》',
    desc: '从 JD 生成到 AI 面试，全链路校招提效方案，附 50+ 一线企业实战案例，覆盖制造、互联网、金融三大赛道。',
    date: '2026-02-10',
    cta: '立即获取',
  },
  {
    id: 'digital-guide',
    type: 'guide',
    typeLabel: '报告',
    icon: 'clipboard-list',
    imgGrad: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)',
    title: '《HR 数字化升级全景指南》',
    desc: '系统梳理从制度设计到系统落地的完整路径，覆盖 8 大业务模块、12 个关键决策节点，帮助 HR 少走弯路。',
    date: '2026-01-20',
    cta: '立即下载',
  },
  {
    id: 'live-video',
    type: 'video',
    typeLabel: '直播视频',
    icon: 'play-circle',
    imgGrad: 'linear-gradient(135deg, #FDF4FF, #FAE8FF)',
    title: '人才选用育留一体化：从理念到实践',
    desc: 'TalentPro 首席专家主讲，系统分享如何用数字化工具打通人才全生命周期管理，附完整方法论 PPT 下载。',
    date: '2026-03-05',
    cta: '观看回放',
  },
];

/**
 * 资源类型 Tag 样式映射
 * v2.1.0 新增：video（紫色）/ guide（天蓝色）
 */
export const RESOURCE_TYPE_STYLES = {
  report:  { bg: '#FFF7ED', color: '#EA580C' },  // 橙
  case:    { bg: '#F0FDF4', color: '#16A34A' },  // 绿
  article: { bg: '#EBF1FF', color: '#1B5FEB' },  // 蓝
  guide:   { bg: '#F0F9FF', color: '#0284C7' },  // 天蓝
  video:   { bg: '#FDF4FF', color: '#7C3AED' },  // 紫
};
