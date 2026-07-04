/**
 * 应用广场分类静态 Fallback 数据
 * v2.0.0: 支持按 locale 返回对应语言数据
 */

const MARKETPLACE_CATEGORIES_ZH = [
  { id: 'recruitment', label: '招聘与人才获取', icon: 'users', count: 12 },
  { id: 'compensation', label: '薪酬与福利', icon: 'dollar-sign', count: 8 },
  { id: 'performance', label: '绩效与目标', icon: 'target', count: 9 },
  { id: 'learning', label: '学习与发展', icon: 'book-open', count: 11 },
  { id: 'experience', label: '员工体验', icon: 'heart', count: 7 },
  { id: 'compliance', label: '合规与安全', icon: 'shield', count: 6 },
  { id: 'ai', label: 'AI 与自动化', icon: 'bot', count: 14 },
  { id: 'analytics', label: '数据与分析', icon: 'bar-chart-2', count: 10 },
];

const MARKETPLACE_CATEGORIES_EN = [
  { id: 'recruitment', label: 'Recruitment & Talent', icon: 'users', count: 12 },
  { id: 'compensation', label: 'Compensation & Benefits', icon: 'dollar-sign', count: 8 },
  { id: 'performance', label: 'Performance & Goals', icon: 'target', count: 9 },
  { id: 'learning', label: 'Learning & Development', icon: 'book-open', count: 11 },
  { id: 'experience', label: 'Employee Experience', icon: 'heart', count: 7 },
  { id: 'compliance', label: 'Compliance & Security', icon: 'shield', count: 6 },
  { id: 'ai', label: 'AI & Automation', icon: 'bot', count: 14 },
  { id: 'analytics', label: 'Data & Analytics', icon: 'bar-chart-2', count: 10 },
];

export function getMarketplaceCategories(locale?: string) {
  if (locale === 'en') return MARKETPLACE_CATEGORIES_EN;
  return MARKETPLACE_CATEGORIES_ZH;
}

/** 兼容旧直接引用：默认中文 */
export const MARKETPLACE_CATEGORIES = MARKETPLACE_CATEGORIES_ZH;
