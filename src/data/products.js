import {
  IconRecruit, IconPerformance, IconOrg, IconAttendance,
  IconPayroll, IconLearning, IconTalent, IconAnalytics,
  IconAIRecruit, IconAIInterview, IconAICoach, IconAICourse,
  IconAssessRecruit, IconAssess360, IconAssessExam, IconAssessModel,
  IconLowCode, IconAPI, IconEco, IconSecurity,
  ICON_COLORS, ICON_BG_COLORS,
} from '../components/ui/ProductIcons/index.jsx';

/**
 * 产品矩阵数据（SEC-05 ProductMatrixSection）
 * v2.1.0：icon 字段替换为 SVG 组件引用（OPT-01 完成）
 */
export const PRODUCT_TABS = [
  {
    id: 'hr-saas',
    label: '一体化 HR SaaS',
    iconColor: ICON_COLORS['hr-saas'],
    iconBg:    ICON_BG_COLORS['hr-saas'],
    products: [
      { id: 'recruit',     icon: IconRecruit,     name: '招聘管理系统', desc: '全流程数字化招聘，提升人才获取效率，覆盖校招社招全场景' },
      { id: 'performance', icon: IconPerformance,  name: '绩效管理系统', desc: '目标对齐、绩效驱动，支持 OKR、KPI 等多种绩效模式' },
      { id: 'org',         icon: IconOrg,          name: '组织人事系统', desc: '集团化组织管控，多法人多区域跨境运营的人事管理' },
      { id: 'attendance',  icon: IconAttendance,   name: '假勤管理系统', desc: '智能排班、自动考勤，应对复杂考勤场景，提升人效' },
      { id: 'payroll',     icon: IconPayroll,      name: '薪酬管理系统', desc: '精准薪酬核算，合规个税处理，支持多种薪酬架构' },
      { id: 'learning',    icon: IconLearning,     name: '在线学习系统', desc: 'AI 赋能学习发展，个性化培养路径，促进知识沉淀' },
      { id: 'talent',      icon: IconTalent,       name: '盘点发展系统', desc: '科学发现高潜人才，数字化继任管理，支撑战略人才储备' },
      { id: 'analytics',   icon: IconAnalytics,    name: '数字人力分析', desc: '400+ 行业指标，BI 可视化洞察，赋能管理者科学决策' },
    ],
  },
  {
    id: 'ai-family',
    label: 'AI Family',
    iconColor: ICON_COLORS['ai-family'],
    iconBg:    ICON_BG_COLORS['ai-family'],
    products: [
      { id: 'ai-recruit',   icon: IconAIRecruit,   name: 'AI 招聘助手',   desc: '智能简历筛选、JD 生成，让招聘更快更准' },
      { id: 'ai-interview', icon: IconAIInterview, name: 'AI 面试官',     desc: '不止评能力，更要测潜力，7×24小时自动面试' },
      { id: 'ai-coach',     icon: IconAICoach,     name: 'AI 领导力教练', desc: '管理者身边的个人教练，个性化领导力提升' },
      { id: 'ai-course',    icon: IconAICourse,    name: 'AI 做课助手',   desc: '沉淀知识，让人人成为讲师，AI 生成高质量课程' },
    ],
  },
  {
    id: 'assessment',
    label: '人才测评',
    iconColor: ICON_COLORS['assessment'],
    iconBg:    ICON_BG_COLORS['assessment'],
    products: [
      { id: 'assess-recruit', icon: IconAssessRecruit, name: '招聘测评',     desc: '科学评估候选人综合素质，提升招聘命中率' },
      { id: 'assess-360',     icon: IconAssess360,     name: '360度评估',   desc: '多维度反馈系统，全面了解员工能力短板' },
      { id: 'assess-exam',    icon: IconAssessExam,    name: '在线考试系统', desc: '安全可靠的在线考试，支持多题型、防作弊' },
      { id: 'assess-model',   icon: IconAssessModel,   name: '人才模型构建', desc: '科学构建岗位胜任力模型，定义人才标准' },
    ],
  },
  {
    id: 'paas',
    label: 'PaaS 平台',
    iconColor: ICON_COLORS['paas'],
    iconBg:    ICON_BG_COLORS['paas'],
    products: [
      { id: 'paas-lowcode', icon: IconLowCode,  name: '低代码平台', desc: 'NoCode/LowCode 快速构建个性化 HR 应用' },
      { id: 'paas-api',     icon: IconAPI,      name: '开放 API',   desc: '标准化接口，轻松对接企业现有系统' },
      { id: 'paas-eco',     icon: IconEco,      name: '生态广场',   desc: '200+ 生态伙伴，链接全行业服务能力' },
      { id: 'paas-sec',     icon: IconSecurity, name: '安全合规',   desc: '九层安全防护，等保三级认证，数据安全' },
    ],
  },
];
