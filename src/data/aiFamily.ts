import {
  IconAIRecruit, IconAIInterview, IconAICoach, IconAICourse,
} from '../components/ui/ProductIcons/index';

/**
 * AI Family 专区数据（SEC-06 AiFamilySection）
 * v2.1.0：icon 字段替换为 SVG 组件引用
 * hot: 是否显示 HOT 🔥 徽章
 * v4.2.0：支持按 locale 返回对应语言数据
 */

const AI_CARDS_ZH = [
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

const AI_CARDS_EN = [
  {
    id: 'ai-recruit',
    icon: IconAIRecruit,
    name: 'AI Recruiter',
    tagline: 'Make recruiting effortless — smart resume screening, JD generation, and interview scheduling',
    hot: true,
  },
  {
    id: 'ai-interview',
    icon: IconAIInterview,
    name: 'AI Interviewer',
    tagline: 'Assess potential, not just skills — 24/7 automated intelligent interviews',
    hot: true,
  },
  {
    id: 'ai-coach',
    icon: IconAICoach,
    name: 'AI Leadership Coach',
    tagline: 'A personal AI coach for every manager, delivering personalized leadership growth',
    hot: false,
  },
  {
    id: 'ai-learning',
    icon: IconAICourse,
    name: 'AI Learning Coach',
    tagline: 'From learning to doing — personalized employee growth with instant knowledge Q&A',
    hot: false,
  },
];

const AI_BANNER_ZH = {
  label: '2025 AI 应用先锋实践案例',
  title: '蒙牛、京东方等行业先锋，AI+HR 标杆经验分享',
  sub:   '覆盖招聘、培训、绩效全场景，开启人力资源数字化新纪元',
  cta:   '立即获取',
};

const AI_BANNER_EN = {
  label: '2025 AI Trailblazer Showcase',
  title: 'Mengniu, BOE and more — sharing AI+HR success stories',
  sub:   'Covering recruiting, training, and performance across all scenarios',
  cta:   'Get the Playbook',
};

export function getAiCards(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return AI_CARDS_ZH;
  return AI_CARDS_EN;
}

export function getAiBanner(locale?: string) {
  if (locale === 'zh' || locale === 'zh-TW') return AI_BANNER_ZH;
  return AI_BANNER_EN;
}

/** 兼容旧直接引用：默认中文 */
export const AI_CARDS = AI_CARDS_ZH;
export const AI_BANNER = AI_BANNER_ZH;
