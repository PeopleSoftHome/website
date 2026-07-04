import { BLOG_AI_RECRUITING_2026, BLOG_AI_RECRUITING_2026_EN } from './posts/ai-recruiting-2026';
import { BLOG_OKR_IMPLEMENTATION, BLOG_OKR_IMPLEMENTATION_EN } from './posts/okr-implementation';
import { BLOG_HR_DATA_SECURITY, BLOG_HR_DATA_SECURITY_EN } from './posts/hr-data-security';
import { BLOG_EMPLOYEE_EXPERIENCE_2026, BLOG_EMPLOYEE_EXPERIENCE_2026_EN } from './posts/employee-experience-2026';
import { BLOG_AI_FAMILY_3_DEEP_DIVE, BLOG_AI_FAMILY_3_DEEP_DIVE_EN } from './posts/ai-family-3-deep-dive';
import { BLOG_TALENT_ANALYTICS_METRICS, BLOG_TALENT_ANALYTICS_METRICS_EN } from './posts/talent-analytics-metrics';

const BLOG_POSTS_ZH = [
  BLOG_AI_RECRUITING_2026,
  BLOG_OKR_IMPLEMENTATION,
  BLOG_HR_DATA_SECURITY,
  BLOG_EMPLOYEE_EXPERIENCE_2026,
  BLOG_AI_FAMILY_3_DEEP_DIVE,
  BLOG_TALENT_ANALYTICS_METRICS,
];

const BLOG_POSTS_EN = [
  BLOG_AI_RECRUITING_2026_EN,
  BLOG_OKR_IMPLEMENTATION_EN,
  BLOG_HR_DATA_SECURITY_EN,
  BLOG_EMPLOYEE_EXPERIENCE_2026_EN,
  BLOG_AI_FAMILY_3_DEEP_DIVE_EN,
  BLOG_TALENT_ANALYTICS_METRICS_EN,
];

export function getBlogPosts(locale?: string) {
  if (locale === 'en') return BLOG_POSTS_EN;
  return BLOG_POSTS_ZH;
}

export function getBlogPostMap(locale?: string) {
  const posts = getBlogPosts(locale);
  return Object.fromEntries(posts.map((p) => [p.slug, p]));
}

/** 兼容旧直接引用：默认中文 */
export const BLOG_POSTS = BLOG_POSTS_ZH;
export const BLOG_POST_MAP = Object.fromEntries(
  BLOG_POSTS_ZH.map((p) => [p.slug, p]),
);

export { BLOG_CATEGORIES, BLOG_CATEGORIES_EN, getBlogCategories } from './categories';
export type { BlogCategory, BlogTag, BlogStatus, BlogPost } from './types';
