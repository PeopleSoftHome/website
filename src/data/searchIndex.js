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

/* ══════════════ INDUSTRY — 5 条 ══════════════ */
export const SEARCH_INDUSTRIES = [
  {
    id: 'i-mfg', type: 'industry', weight: 0.9,
    title: '制造业方案',
    tags:  ['制造', '工厂', '蓝领', '排班', '考勤', '车间', 'manufacturing', '生产'],
    desc:  '智能排班 + 试工管理 + 资质合规追踪',
    section: 'industry', icon: 'factory',
  },
  {
    id: 'i-retail', type: 'industry', weight: 0.85,
    title: '零售连锁方案',
    tags:  ['零售', '连锁', '门店', '店长', '蓝领', 'retail', '快消', '餐饮'],
    desc:  '店长招聘工作台 + 门店人才培养 + 多门店人事管理',
    section: 'industry', icon: 'store',
  },
  {
    id: 'i-internet', type: 'industry', weight: 0.85,
    title: '互联网方案',
    tags:  ['互联网', 'HRBP', '科技', '研发', 'OKR', '互联网公司', 'tech', '敏捷'],
    desc:  'HRBP 工作台 + 全员招聘协作 + 人才梯队建设',
    section: 'industry', icon: 'monitor',
  },
  {
    id: 'i-gov', type: 'industry', weight: 0.85,
    title: '央国企方案',
    tags:  ['央企', '国企', '国有企业', '竞聘', '干部', '校招', '党建', 'SOE'],
    desc:  '数字化校招 + 年轻干部梯队 + 干部竞聘',
    section: 'industry', icon: 'landmark',
  },
  {
    id: 'i-finance', type: 'industry', weight: 0.85,
    title: '金融行业方案',
    tags:  ['金融', '银行', '保险', '证券', '校招', '后备人才', 'finance', '营销员'],
    desc:  '校招创新管理 + 后备人才库 + 营销员增员',
    section: 'industry', icon: 'bank',
  },
];

/* ══════════════ RESOURCE — 6 条 ══════════════ */
export const SEARCH_RESOURCES = [
  {
    id: 'r-whitepaper', type: 'resource', weight: 0.85,
    title: 'HR 数智化成熟度白皮书',
    tags:  ['白皮书', '报告', 'HRDIMM', '数智化', '成熟度', 'whitepaper', '趋势'],
    desc:  '整合 567 家企业调研，三阶转型方案',
    section: 'resources', icon: 'bar-chart',
  },
  {
    id: 'r-ai-cases', type: 'resource', weight: 0.85,
    title: 'AI 面试官案例集',
    tags:  ['案例', 'AI面试', '案例集', '海尔', '茶颜悦色', '校招案例'],
    desc:  '11 家领军企业 AI 面试实战亲测',
    section: 'resources', icon: 'award',
  },
  {
    id: 'r-talent-review', type: 'resource', weight: 0.8,
    title: 'AI 重塑人才盘点体系',
    tags:  ['盘点', '九宫格', 'AI', '人才管理', '文章', '干货'],
    desc:  '从传统九宫格到 AI 驱动的数字化盘点',
    section: 'resources', icon: 'target',
  },
  {
    id: 'r-campus', type: 'resource', weight: 0.8,
    title: '校园招聘 AI 应用指南',
    tags:  ['校招', '校园招聘', 'AI', '指南', '白皮书', '大学生', '应届生'],
    desc:  '全链路校招提效方案，50+ 企业案例',
    section: 'resources', icon: 'award',
  },
  {
    id: 'r-digital', type: 'resource', weight: 0.75,
    title: 'HR 数字化升级全景指南',
    tags:  ['数字化', '转型', '报告', '路线图', 'HR数字化', '实施'],
    desc:  '8 大业务模块、12 个决策节点完整路径',
    section: 'resources', icon: 'clipboard-list',
  },
  {
    id: 'r-video', type: 'resource', weight: 0.75,
    title: '人才选用育留一体化直播',
    tags:  ['直播', '视频', '人才管理', '选用育留', '回放', '方法论'],
    desc:  '首席专家主讲，完整方法论 PPT 下载',
    section: 'resources', icon: 'play-circle',
  },
];

/* ══════════════ FEATURE — 12 条（功能特色，权重较低）══════════════ */
export const SEARCH_FEATURES = [
  {
    id: 'f-smart-schedule', type: 'feature', weight: 0.7,
    title: '智能排班',
    tags:  ['排班', '智能排班', '班次', '工厂排班', '自动排班'],
    desc:  '5000+ 考勤规则自动处理，移动端即时排班',
    section: 'industry', icon: 'calendar',
  },
  {
    id: 'f-ai-screen', type: 'feature', weight: 0.75,
    title: 'AI 简历初筛',
    tags:  ['AI初筛', '简历筛选', '自动筛选', 'AI', '简历', '批量'],
    desc:  'AI 自动筛选简历，减少 80% 重复工作',
    section: 'ai', icon: 'search',
  },
  {
    id: 'f-okr', type: 'feature', weight: 0.7,
    title: 'OKR 目标管理',
    tags:  ['OKR', '目标', 'KR', '对齐', '目标管理', '互联网'],
    desc:  'O-KR 层层拆解，目标进度实时可见',
    section: 'products', icon: 'target',
  },
  {
    id: 'f-mobile-attendance', type: 'feature', weight: 0.7,
    title: '移动端考勤打卡',
    tags:  ['手机打卡', '移动打卡', 'GPS打卡', '人脸识别', '外勤'],
    desc:  '手机 GPS/人脸/Wi-Fi 多模式打卡',
    section: 'products', icon: 'smartphone',
  },
  {
    id: 'f-payslip', type: 'feature', weight: 0.65,
    title: '电子工资条',
    tags:  ['工资条', '电子工资单', '薪资明细', '发薪'],
    desc:  '一键发放电子工资条，员工微信/App 查看',
    section: 'products', icon: 'credit-card',
  },
  {
    id: 'f-hrbp', type: 'feature', weight: 0.7,
    title: 'HRBP 工作台',
    tags:  ['HRBP', 'HR业务伙伴', '工作台', '数据看板', 'BP'],
    desc:  '部门 HR 一站式管理工作台',
    section: 'industry', icon: 'briefcase',
  },
  {
    id: 'f-talent-pool', type: 'feature', weight: 0.7,
    title: '人才库管理',
    tags:  ['人才库', '候选人库', '简历库', '后备人才', '储备'],
    desc:  '沉淀企业人才资产，随时激活备用候选人',
    section: 'products', icon: 'database',
  },
  {
    id: 'f-onboarding', type: 'feature', weight: 0.65,
    title: '数字化入职',
    tags:  ['入职', '新人入职', '电子签约', 'onboarding', '入职流程'],
    desc:  '全流程线上入职，合同电子签，材料自动归档',
    section: 'products', icon: 'sparkles',
  },
  {
    id: 'f-esg', type: 'feature', weight: 0.6,
    title: '员工关怀 ESG',
    tags:  ['员工关怀', 'ESG', '员工福利', '心理健康', '企业文化'],
    desc:  '员工满意度调研、福利管理、EAP 支持',
    section: 'products', icon: 'heart',
  },
  {
    id: 'f-succession', type: 'feature', weight: 0.65,
    title: '继任者管理',
    tags:  ['继任', '接班人', '继任计划', '人才梯队', '高潜'],
    desc:  '识别关键岗位继任者，系统化培养路径',
    section: 'products', icon: 'award',
  },
  {
    id: 'f-trial-worker', type: 'feature', weight: 0.65,
    title: '试工管理',
    tags:  ['试工', '蓝领', '试用', '工厂', '扫码入职', '临时工'],
    desc:  '扫码入系统，试工全流程线上化管理',
    section: 'industry', icon: 'bookmark',
  },
  {
    id: 'f-roi', type: 'feature', weight: 0.7,
    title: 'ROI 计算器',
    tags:  ['ROI', '投资回报', '成本节省', '计算器', '预算'],
    desc:  '量化 TalentPro 为您节省的人力成本',
    section: 'resources', icon: 'calculator',
  },
];

/* ══════════════ GENERAL — 7 条 ══════════════ */
export const SEARCH_GENERAL = [
  {
    id: 'g-about', type: 'general', weight: 0.5,
    title: '关于 TalentPro',
    tags:  ['关于', '公司', '介绍', '背景', 'about', '品牌', '历史'],
    desc:  '20 年专注 HR SaaS，IDC 连续九年第一',
    section: 'whyus', icon: 'home',
  },
  {
    id: 'g-contact', type: 'general', weight: 0.6,
    title: '联系我们 / 预约演示',
    tags:  ['联系', '预约', '演示', '电话', '咨询', 'contact', '400'],
    desc:  '400-888-8888，专属顾问 1 个工作日响应',
    section: 'cta', icon: 'phone',
  },
  {
    id: 'g-price', type: 'general', weight: 0.65,
    title: '价格与方案',
    tags:  ['价格', '定价', '收费', '报价', 'price', '费用', '采购'],
    desc:  '按需定制，联系顾问获取专属报价',
    section: 'cta', icon: 'gem',
  },
  {
    id: 'g-customers', type: 'general', weight: 0.6,
    title: '客户案例',
    tags:  ['客户', '案例', '口碑', '客户故事', 'case study', '成功案例'],
    desc:  '8000+ 企业客户，覆盖各行各业',
    section: 'testimonials', icon: 'star',
  },
  {
    id: 'g-security-cert', type: 'general', weight: 0.6,
    title: '安全认证',
    tags:  ['安全', '等保三级', 'ISO27001', 'SOC2', '认证', '合规', '数据保护'],
    desc:  '等保三级 / ISO 27001 / SOC 2 / 国密算法',
    section: 'whyus', icon: 'lock',
  },
  {
    id: 'g-sla', type: 'general', weight: 0.55,
    title: '服务保障 SLA',
    tags:  ['SLA', '服务', '保障', '7x24', '响应', '运维', 'uptime'],
    desc:  '99.9% SLA 可用性，7×24 全天候支持',
    section: 'whyus', icon: 'settings',
  },
  {
    id: 'g-global', type: 'general', weight: 0.55,
    title: '出海 / 全球化 HR',
    tags:  ['出海', '全球化', '跨境', '海外', 'global', '多语言', '国际化'],
    desc:  '支持多法人、多货币、多语言全球化人事管理',
    section: 'products', icon: 'globe',
  },
];

/* ══════════════ 合并完整索引 ══════════════ */
export const SEARCH_INDEX = [
  ...SEARCH_PRODUCTS,
  ...SEARCH_INDUSTRIES,
  ...SEARCH_RESOURCES,
  ...SEARCH_FEATURES,
  ...SEARCH_GENERAL,
];

/** 热门搜索词（无输入时展示）*/
export const HOT_SEARCHES = [
  'AI 招聘', 'AI 面试官', '制造业', '白皮书', '360评估', '排班', '薪酬', '校招',
];

/** 按类型分组（用于结果分类展示）*/
export const TYPE_LABELS = {
  product:  '产品',
  industry: '行业方案',
  resource: '资源',
  feature:  '功能特色',
  general:  '其他',
};
