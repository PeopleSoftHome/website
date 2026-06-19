/**
 * searchIndex.js — 全局搜索索引（Sprint 12 / v2.3.0）
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
/* ══════════════ PRODUCT — 20 条 ══════════════ */
export const SEARCH_PRODUCTS = [
  // HR SaaS
  {
    id: 'p-recruit', type: 'product', weight: 1.0,
    title: '招聘管理系统',
    tags:  ['招聘', '校招', '社招', 'JD', '简历', '面试', 'recruitment', 'hiring', 'ATS'],
    desc:  '全流程数字化招聘，覆盖校招社招全场景',
    section: 'products', icon: 'users',
  },
  {
    id: 'p-performance', type: 'product', weight: 0.9,
    title: '绩效管理系统',
    tags:  ['绩效', 'OKR', 'KPI', '目标', '考核', 'performance', 'appraisal'],
    desc:  '目标对齐、绩效驱动，支持 OKR、KPI 等多种模式',
    section: 'products', icon: 'bar-chart',
  },
  {
    id: 'p-org', type: 'product', weight: 0.9,
    title: '组织人事系统',
    tags:  ['组织', '人事', '架构', '集团', '法人', 'org', 'HRIS', '入离职'],
    desc:  '集团化组织管控，多法人多区域人事管理',
    section: 'products', icon: 'building',
  },
  {
    id: 'p-attendance', type: 'product', weight: 0.9,
    title: '假勤管理系统',
    tags:  ['考勤', '排班', '打卡', '假期', '请假', '加班', 'attendance', 'scheduling'],
    desc:  '智能排班、自动考勤，应对复杂考勤场景',
    section: 'products', icon: 'clock',
  },
  {
    id: 'p-payroll', type: 'product', weight: 0.9,
    title: '薪酬管理系统',
    tags:  ['薪酬', '工资', '发薪', '个税', '社保', 'payroll', 'salary', 'compensation'],
    desc:  '精准薪酬核算，合规个税处理',
    section: 'products', icon: 'dollar-sign',
  },
  {
    id: 'p-learning', type: 'product', weight: 0.85,
    title: '在线学习系统',
    tags:  ['学习', '培训', 'LMS', '课程', '知识库', 'e-learning', 'training', '员工成长'],
    desc:  'AI 赋能学习发展，个性化培养路径',
    section: 'products', icon: 'book-open',
  },
  {
    id: 'p-talent', type: 'product', weight: 0.85,
    title: '盘点发展系统',
    tags:  ['盘点', '人才', '高潜', '继任', '九宫格', 'talent review', '梯队', '发展'],
    desc:  '科学发现高潜人才，数字化继任管理',
    section: 'products', icon: 'search',
  },
  {
    id: 'p-analytics', type: 'product', weight: 0.85,
    title: '数字人力分析',
    tags:  ['分析', '数据', 'BI', '报表', '指标', 'analytics', 'dashboard', '决策'],
    desc:  '400+ 行业指标，BI 可视化洞察',
    section: 'products', icon: 'trending-up',
  },
  // AI Family
  {
    id: 'p-ai-recruit', type: 'product', weight: 1.0,
    title: 'AI 招聘助手',
    tags:  ['AI招聘', 'AI', '简历筛选', 'JD生成', '智能招聘', 'AI recruiter', '人工智能'],
    desc:  '智能简历筛选、JD 生成，让招聘更快更准',
    section: 'ai', icon: 'bot',
  },
  {
    id: 'p-ai-interview', type: 'product', weight: 1.0,
    title: 'AI 面试官',
    tags:  ['AI面试', 'AI', '面试', '自动面试', '7x24', 'AI interviewer', '视频面试'],
    desc:  '不止评能力，更要测潜力，7×24 无间断智能面试',
    section: 'ai', icon: 'target',
  },
  {
    id: 'p-ai-coach', type: 'product', weight: 0.9,
    title: 'AI 领导力教练',
    tags:  ['AI教练', 'AI', '领导力', '管理者', '教练', '成长', 'leadership', 'coaching'],
    desc:  '管理者身边的 AI 个人教练，个性化领导力提升',
    section: 'ai', icon: 'zap',
  },
  {
    id: 'p-ai-learning', type: 'product', weight: 0.9,
    title: 'AI 学习助手',
    tags:  ['AI学习', 'AI', '学习', '答疑', '个性化', '知识', 'AI learning'],
    desc:  '从学到用，陪伴员工个性化成长',
    section: 'ai', icon: 'book',
  },
  // 测评
  {
    id: 'p-assess-recruit', type: 'product', weight: 0.85,
    title: '招聘测评',
    tags:  ['测评', '招聘测评', '素质', '能力测试', 'assessment', '候选人评估'],
    desc:  '科学评估候选人综合素质，提升招聘命中率',
    section: 'products', icon: 'clipboard-list',
  },
  {
    id: 'p-assess-360', type: 'product', weight: 0.85,
    title: '360度评估',
    tags:  ['360', '360评估', '多维反馈', '员工评估', '360 feedback', '绩效评估'],
    desc:  '多维度反馈系统，全面了解员工能力短板',
    section: 'products', icon: 'refresh-cw',
  },
  {
    id: 'p-exam', type: 'product', weight: 0.8,
    title: '在线考试系统',
    tags:  ['考试', '在线考试', '题库', '防作弊', 'exam', '测试'],
    desc:  '安全可靠的在线考试，支持多题型、防作弊',
    section: 'products', icon: 'file-text',
  },
  {
    id: 'p-competency', type: 'product', weight: 0.8,
    title: '人才模型构建',
    tags:  ['人才模型', '胜任力', '岗位标准', 'competency', '人才画像'],
    desc:  '科学构建岗位胜任力模型，定义人才标准',
    section: 'products', icon: 'target',
  },
  // PaaS
  {
    id: 'p-lowcode', type: 'product', weight: 0.8,
    title: '低代码平台',
    tags:  ['低代码', 'LowCode', 'NoCode', '自定义', '开发', 'low-code', '定制化'],
    desc:  'NoCode/LowCode 快速构建个性化 HR 应用',
    section: 'products', icon: 'tool',
  },
  {
    id: 'p-api', type: 'product', weight: 0.75,
    title: '开放 API',
    tags:  ['API', '接口', '集成', '对接', '开放平台', 'open API', '系统集成'],
    desc:  '标准化接口，轻松对接企业现有系统',
    section: 'products', icon: 'link',
  },
  {
    id: 'p-eco', type: 'product', weight: 0.75,
    title: '生态广场',
    tags:  ['生态', '合作伙伴', '第三方', 'marketplace', '应用市场'],
    desc:  '200+ 生态伙伴，链接全行业服务能力',
    section: 'products', icon: 'globe',
  },
  {
    id: 'p-security', type: 'product', weight: 0.8,
    title: '安全合规',
    tags:  ['安全', '合规', '等保', '数据安全', 'security', '加密', 'compliance'],
    desc:  '九层安全防护，等保三级认证',
    section: 'whyus', icon: 'shield',
  },
];

