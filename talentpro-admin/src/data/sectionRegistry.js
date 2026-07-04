/**
 * Admin 专用 Section 注册表信息
 * 与前端 portal 的 sectionRegistry.js 保持同步
 */

export const REGISTERED_SECTIONS = [
  {
    key: 'hero',
    title: 'Hero 首屏',
    required: true,
    defaultConfig: {
      showDashboard: true,
    },
    configSchema: [
      { prop: 'backgroundImage', label: '背景图', type: 'image-upload' },
      { prop: 'title', label: '主标题', type: 'input' },
      { prop: 'subtitle', label: '副标题', type: 'textarea', rows: 3 },
      { prop: 'ctaPrimary', label: '主按钮文案', type: 'input' },
      { prop: 'ctaSecondary', label: '次按钮文案', type: 'input' },
      { prop: 'showDashboard', label: '显示仪表盘视觉', type: 'switch', default: true },
    ],
  },
  { key: 'brands', title: '品牌滚动', defaultConfig: {}, configSchema: [] },
  { key: 'stats', title: '统计数据', defaultConfig: {}, configSchema: [] },
  { key: 'products', title: '产品矩阵', defaultConfig: {}, configSchema: [] },
  { key: 'ai-family', title: 'AI Family', defaultConfig: {}, configSchema: [] },
  { key: 'industries', title: '行业方案', defaultConfig: {}, configSchema: [] },
  { key: 'testimonials', title: '客户证言', defaultConfig: {}, configSchema: [] },
  { key: 'logos', title: 'Logo 墙', defaultConfig: {}, configSchema: [] },
  { key: 'why-us', title: '为什么选我们', defaultConfig: {}, configSchema: [] },
  { key: 'resources', title: '资源中心', defaultConfig: {}, configSchema: [] },
  { key: 'roi-calculator', title: 'ROI 计算器', defaultConfig: {}, configSchema: [] },
  { key: 'cta-banner', title: 'CTA 通栏', defaultConfig: {}, configSchema: [] },
];

export function getSectionConfigSchema(key) {
  return REGISTERED_SECTIONS.find((s) => s.key === key)?.configSchema || [];
}

export function resolveSections(pageConfig) {
  const sections = pageConfig?.sections || [];

  if (sections.length === 0) {
    return REGISTERED_SECTIONS.map((s) => ({
      key: s.key,
      title: s.title,
      isActive: true,
      sortOrder: 0,
      config: s.defaultConfig || {},
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
        config: s.config || registered?.defaultConfig || {},
        isUnknown: !registered,
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
