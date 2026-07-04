export const NEWS_CATEGORIES = ['全部', '公司动态', '产品更新', '行业洞察'];

export const NEWS_CATEGORIES_EN = ['All', 'Company News', 'Product Update', 'Industry Insight'];

export function getNewsCategories(locale?: string) {
  if (locale === 'en') return NEWS_CATEGORIES_EN;
  return NEWS_CATEGORIES;
}
