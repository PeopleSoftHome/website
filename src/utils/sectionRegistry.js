import { defineAsyncComponent } from 'vue';

/**
 * Section 插件注册表
 *
 * 设计目标：
 * 1. 每个首页板块是一个可插拔的 Section 插件
 * 2. 支持懒加载，减少首屏 bundle
 * 3. 通过 CMS API 的配置驱动首页组装
 * 4. 新增板块只需注册插件 + 配置即可，无需修改 HomePage
 *
 * 使用方式：
 *   import { sectionRegistry, resolveSections } from '@/utils/sectionRegistry.js';
 *
 *   // HomePage.vue
 *   const sections = resolveSections(cmsPageConfig);
 *   // sections = [{ key, component, config, sortOrder, isActive }]
 */

const registry = new Map();

/**
 * 注册一个 Section 插件
 * @param {string} key - 唯一标识，如 'hero', 'stats', 'products'
 * @param {Object} plugin
 * @param {Function} plugin.component - defineAsyncComponent(() => import('...'))
 * @param {string} plugin.title - 中文名称
 * @param {string} [plugin.icon] - 图标名
 * @param {Object} [plugin.defaultConfig] - 默认配置（JSON）
 * @param {boolean} [plugin.required=false] - 是否必须显示（不可禁用）
 */
export function registerSection(key, plugin) {
  if (registry.has(key)) {
    if (import.meta.env.DEV) {
      console.warn(`[sectionRegistry] Section "${key}" is already registered, overwriting.`);
    }
  }
  registry.set(key, {
    key,
    title: plugin.title || key,
    icon: plugin.icon || 'box',
    defaultConfig: plugin.defaultConfig || {},
    required: plugin.required || false,
    component: plugin.component,
  });
}

/**
 * 获取单个 Section 插件
 */
export function getSection(key) {
  return registry.get(key);
}

/**
 * 获取所有已注册的 Section 插件
 */
export function getAllSections() {
  return Array.from(registry.values());
}

/**
 * 根据 CMS Page 配置解析要渲染的 Section 列表
 *
 * @param {Object} pageConfig - CMS 返回的 Page 对象
 * @param {Array} pageConfig.sections - [{ type, sortOrder, isActive, config }]
 * @returns {Array} 按 sortOrder 排序的 Section 渲染列表
 */
export function resolveSections(pageConfig) {
  const sections = pageConfig?.sections || [];

  if (sections.length === 0) {
    // CMS 无配置时，使用所有已注册且未标记 required=false 的 Section
    return getAllSections()
      .filter((s) => s.component)
      .sort((a, b) => (DEFAULT_ORDER[a.key] || 99) - (DEFAULT_ORDER[b.key] || 99));
  }

  return sections
    .filter((s) => s.isActive !== false)
    .map((s) => {
      const plugin = registry.get(s.type);
      return {
        key: s.type,
        component: plugin?.component || null,
        title: plugin?.title || s.type,
        config: { ...(plugin?.defaultConfig || {}), ...(s.config || {}) },
        sortOrder: s.sortOrder ?? 0,
        isActive: s.isActive !== false,
        isUnknown: !plugin,
      };
    })
    .filter((s) => s.component)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * 默认 Section 渲染顺序（CMS 无配置时 fallback）
 */
const DEFAULT_ORDER = {
  hero: 0,
  brands: 1,
  stats: 2,
  products: 3,
  'ai-family': 4,
  industries: 5,
  testimonials: 6,
  logos: 7,
  'why-us': 8,
  resources: 9,
  'roi-calculator': 10,
  'cta-banner': 11,
};

// ═══════════════════════════════════════════════════════════════
// 注册所有首页 Section 插件
// ═══════════════════════════════════════════════════════════════

registerSection('hero', {
  title: 'Hero 首屏',
  icon: 'home',
  required: true,
  component: defineAsyncComponent(() => import('@/components/sections/HeroSection/HeroSection.vue')),
});

registerSection('brands', {
  title: '品牌滚动',
  icon: 'scroll',
  component: defineAsyncComponent(() => import('@/components/sections/BrandScrollSection/BrandScrollSection.vue')),
});

registerSection('stats', {
  title: '统计数据',
  icon: 'data-line',
  component: defineAsyncComponent(() => import('@/components/sections/StatsSection/StatsSection.vue')),
});

registerSection('products', {
  title: '产品矩阵',
  icon: 'goods',
  component: defineAsyncComponent(() => import('@/components/sections/ProductMatrixSection/ProductMatrixSection.vue')),
});

registerSection('ai-family', {
  title: 'AI Family',
  icon: 'magic-stick',
  component: defineAsyncComponent(() => import('@/components/sections/AiFamilySection/AiFamilySection.vue')),
});

registerSection('industries', {
  title: '行业方案',
  icon: 'office-building',
  component: defineAsyncComponent(() => import('@/components/sections/IndustrySolutionSection/IndustrySolutionSection.vue')),
});

registerSection('testimonials', {
  title: '客户证言',
  icon: 'chat-dot-square',
  component: defineAsyncComponent(() => import('@/components/sections/TestimonialSection/TestimonialSection.vue')),
});

registerSection('logos', {
  title: 'Logo 墙',
  icon: 'picture',
  component: defineAsyncComponent(() => import('@/components/sections/LogoWallSection/LogoWallSection.vue')),
});

registerSection('why-us', {
  title: '为什么选我们',
  icon: 'question-filled',
  component: defineAsyncComponent(() => import('@/components/sections/WhyUsSection/WhyUsSection.vue')),
});

registerSection('resources', {
  title: '资源中心',
  icon: 'document',
  component: defineAsyncComponent(() => import('@/components/sections/ResourceSection/ResourceSection.vue')),
});

registerSection('roi-calculator', {
  title: 'ROI 计算器',
  icon: 'calculator',
  component: defineAsyncComponent(() => import('@/components/sections/RoiCalculatorSection/RoiCalculatorSection.vue')),
});

registerSection('cta-banner', {
  title: 'CTA 通栏',
  icon: 'promotion',
  component: defineAsyncComponent(() => import('@/components/sections/CtaBannerSection/CtaBannerSection.vue')),
});

// 导出全局注册表实例（供 Admin 配置页使用）
export const sectionRegistry = {
  register: registerSection,
  get: getSection,
  getAll: getAllSections,
  resolve: resolveSections,
};

// sectionRegistry 在模块级别自动初始化，无需额外插件逻辑
