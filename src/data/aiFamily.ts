import {
  IconAIRecruit, IconAIInterview, IconAICoach, IconAICourse,
} from '../components/ui/ProductIcons/index';

/**
 * AI Family 专区数据（SEC-06 AiFamilySection）
 * v2.1.0：icon 字段替换为 SVG 组件引用
 * hot: 是否显示 HOT 🔥 徽章
 */
export const AI_CARDS = [
  {
    id: 'ai-recruit',
    icon: IconAIRecruit,
    name: 'AI 招聘助手',
    tagline: '让招聘更轻松，智能处理简历、生成 JD、安排面试',
    hot: true,
  },
  {
    id: 'ai-interview',
    icon: IconAIInterview,
    name: 'AI 面试官',
    tagline: '不止评能力，更要测潜力，7×24 无间断智能面试',
    hot: true,
  },
  {
    id: 'ai-coach',
    icon: IconAICoach,
    name: 'AI 领导力教练',
    tagline: '管理者身边的 AI 个人教练，个性化领导力提升',
    hot: false,
  },
  {
    id: 'ai-learning',
    icon: IconAICourse,
    name: 'AI 学习助手',
    tagline: '从学到用，陪伴员工个性化成长，知识即时答疑',
    hot: false,
  },
];

export const AI_BANNER = {
  label: '2025 AI 应用先锋实践案例',
  title: '蒙牛、京东方等行业先锋，AI+HR 标杆经验分享',
  sub:   '覆盖招聘、培训、绩效全场景，开启人力资源数字化新纪元',
  cta:   '立即获取',
};
