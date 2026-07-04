/**
 * 应用广场评价静态 Fallback 数据
 * v2.0.0: 支持按 locale 返回对应语言数据
 */

const MARKETPLACE_REVIEWS_ZH = [
  { user: '张经理', company: '某互联网公司', rating: 5, text: '极大地提升了我们的招聘效率，AI 匹配非常精准。', date: '2026-05-20' },
  { user: '李总监', company: '某制造企业', rating: 4, text: '功能很全面，和 TalentPro 集成也很顺畅。', date: '2026-04-15' },
  { user: '王HR', company: '某零售企业', rating: 5, text: '界面友好，团队上手很快，推荐！', date: '2026-03-28' },
];

const MARKETPLACE_REVIEWS_EN = [
  { user: 'Manager Zhang', company: 'An Internet Company', rating: 5, text: 'Greatly improved our recruiting efficiency; the AI matching is remarkably accurate.', date: '2026-05-20' },
  { user: 'Director Li', company: 'A Manufacturing Enterprise', rating: 4, text: 'Comprehensive features and smooth integration with TalentPro.', date: '2026-04-15' },
  { user: 'HR Wang', company: 'A Retail Enterprise', rating: 5, text: 'User-friendly interface and quick team adoption. Highly recommended!', date: '2026-03-28' },
];

export function getMarketplaceReviews(locale?: string) {
  if (locale === 'en') return MARKETPLACE_REVIEWS_EN;
  return MARKETPLACE_REVIEWS_ZH;
}

/** 兼容旧直接引用：默认中文 */
export const MARKETPLACE_REVIEWS = MARKETPLACE_REVIEWS_ZH;
