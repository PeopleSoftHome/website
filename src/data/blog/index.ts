import { BLOG_AI_RECRUITING_2026 } from './posts/ai-recruiting-2026';
import { BLOG_OKR_IMPLEMENTATION } from './posts/okr-implementation';
import { BLOG_HR_DATA_SECURITY } from './posts/hr-data-security';
import { BLOG_EMPLOYEE_EXPERIENCE_2026 } from './posts/employee-experience-2026';
import { BLOG_AI_FAMILY_3_DEEP_DIVE } from './posts/ai-family-3-deep-dive';
import { BLOG_TALENT_ANALYTICS_METRICS } from './posts/talent-analytics-metrics';

export const BLOG_POSTS = [
  BLOG_AI_RECRUITING_2026,
  BLOG_OKR_IMPLEMENTATION,
  BLOG_HR_DATA_SECURITY,
  BLOG_EMPLOYEE_EXPERIENCE_2026,
  BLOG_AI_FAMILY_3_DEEP_DIVE,
  BLOG_TALENT_ANALYTICS_METRICS,
];

export const BLOG_POST_MAP = Object.fromEntries(
  BLOG_POSTS.map((p) => [p.slug, p]),
);

export { BLOG_CATEGORIES } from './categories';
export type { BlogCategory, BlogTag, BlogStatus, BlogPost } from './types';
