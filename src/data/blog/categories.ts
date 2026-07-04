import type { BlogCategory } from './types';

export const BLOG_CATEGORIES: BlogCategory[] = [
  { id: 'cat-insight', name: '行业洞察', slug: 'insight' },
  { id: 'cat-product', name: '产品更新', slug: 'product' },
  { id: 'cat-practice', name: '最佳实践', slug: 'practice' },
  { id: 'cat-ai', name: 'AI 专栏', slug: 'ai' },
];

export const BLOG_CATEGORIES_EN: BlogCategory[] = [
  { id: 'cat-insight', name: 'Industry Insight', slug: 'insight' },
  { id: 'cat-product', name: 'Product Update', slug: 'product' },
  { id: 'cat-practice', name: 'Best Practice', slug: 'practice' },
  { id: 'cat-ai', name: 'AI Column', slug: 'ai' },
];

export function getBlogCategories(locale?: string): BlogCategory[] {
  if (locale === 'en') return BLOG_CATEGORIES_EN;
  return BLOG_CATEGORIES;
}
