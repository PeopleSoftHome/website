/**
 * Admin 专用 Section 注册表信息
 * 与前端 portal 的 sectionRegistry.js 保持同步
 */

export const REGISTERED_SECTIONS = [
  { key: 'hero', title: 'Hero 首屏', required: true },
  { key: 'brands', title: '品牌滚动' },
  { key: 'stats', title: '统计数据' },
  { key: 'products', title: '产品矩阵' },
  { key: 'ai-family', title: 'AI Family' },
  { key: 'industries', title: '行业方案' },
  { key: 'testimonials', title: '客户证言' },
  { key: 'logos', title: 'Logo 墙' },
  { key: 'why-us', title: '为什么选我们' },
  { key: 'resources', title: '资源中心' },
  { key: 'roi-calculator', title: 'ROI 计算器' },
  { key: 'cta-banner', title: 'CTA 通栏' },
];

export function resolveSections(pageConfig) {
  const sections = pageConfig?.sections || [];

  if (sections.length === 0) {
    return REGISTERED_SECTIONS.map((s) => ({
      key: s.key,
      title: s.title,
      isActive: true,
      sortOrder: 0,
      config: {},
      isUnknown: false,
    }));
  }

  return sections
    .filter((s) => s.isActive !== false)
    .map((s) => {
      const registered = REGISTERED_SECTIONS.find((r) => r.key === s.type);
      return {
        key: s.type,
        title: registered?.title || s.type,
        isActive: s.isActive !== false,
        sortOrder: s.sortOrder ?? 0,
        config: s.config || {},
        isUnknown: !registered,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
