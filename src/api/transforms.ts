import {
  PRODUCT_ICONS,
  ICON_COLORS,
  ICON_BG_COLORS,
} from '@/components/ui/ProductIcons/index.js';

/* ─── Product Matrix ─── */
export function transformProductTabs(apiTabs) {
  if (!Array.isArray(apiTabs)) return [];
  return apiTabs.map((tab) => ({
    id: tab.slug,
    label: tab.label,
    iconColor: ICON_COLORS[tab.slug] || ICON_COLORS['hr-saas'],
    iconBg: ICON_BG_COLORS[tab.slug] || ICON_BG_COLORS['hr-saas'],
    products: (tab.products || []).map((p) => ({
      id: p.slug,
      icon: PRODUCT_ICONS[p.slug] || PRODUCT_ICONS['recruit'],
      name: p.name,
      desc: p.description || p.tagline || '',
    })),
  }));
}

/* ─── Industry Solution ─── */
export function transformIndustries(apiIndustries) {
  if (!Array.isArray(apiIndustries)) return [];
  return apiIndustries.map((ind) => ({
    id: ind.slug,
    label: ind.label,
    icon: ind.icon || 'factory',
    features: (ind.features || []).map((f, i) => ({
      badge: f.badge || `特色${['一', '二', '三'][i] || i + 1}`,
      title: f.title || '',
      desc: f.desc || '',
    })),
    screenshot: ind.screenshot || {},
  }));
}

/* ─── Testimonials ─── */
const GRAD_PRESETS = [
  'linear-gradient(135deg, #1B5FEB, #7C3AED)',
  'linear-gradient(135deg, #059669, #1B5FEB)',
  'linear-gradient(135deg, #D97706, #EF4444)',
  'linear-gradient(135deg, #7C3AED, #EC4899)',
  'linear-gradient(135deg, #0284C7, #1B5FEB)',
];

export function transformTestimonials(apiTestimonials) {
  if (!Array.isArray(apiTestimonials)) return [];
  return apiTestimonials.map((t, i) => ({
    id: t.id,
    industry: t.industry,
    product: t.product,
    text: t.text,
    name: t.name,
    title: t.title,
    avatar: t.avatar || null,
    avatarGrad: GRAD_PRESETS[i % GRAD_PRESETS.length],
    avatarChar: t.name?.charAt(0) || '?',
  }));
}

/* ─── Resources ─── */
const RESOURCE_TYPE_META = {
  report:  { typeLabel: '白皮书', icon: 'bar-chart',   imgGrad: 'linear-gradient(135deg, #EBF1FF, #DBEAFE)', cta: '立即获取' },
  case:    { typeLabel: '案例集', icon: 'award',       imgGrad: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', cta: '立即获取' },
  article: { typeLabel: '干货文章', icon: 'target',    imgGrad: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)', cta: '查看详情' },
  guide:   { typeLabel: '报告',   icon: 'clipboard-list', imgGrad: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)', cta: '立即下载' },
  video:   { typeLabel: '直播视频', icon: 'play-circle', imgGrad: 'linear-gradient(135deg, #FDF4FF, #FAE8FF)', cta: '观看回放' },
};

export function transformResources(apiResources) {
  if (!Array.isArray(apiResources)) return [];
  return apiResources.map((r) => {
    const meta = RESOURCE_TYPE_META[r.type] || RESOURCE_TYPE_META.article;
    return {
      id: r.slug || r.id,
      type: r.type,
      typeLabel: meta.typeLabel,
      icon: meta.icon,
      imgGrad: meta.imgGrad,
      title: r.title,
      desc: r.description || '',
      date: r.publishedAt
        ? new Date(r.publishedAt).toISOString().split('T')[0]
        : new Date(r.createdAt).toISOString().split('T')[0],
      cta: meta.cta,
    };
  });
}

/* ─── Navigation ─── */
export function transformNavigation(apiNav) {
  if (!apiNav || !apiNav.items) return [];
  return (apiNav.items || []).map((item) => ({
    id: item.label?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || item.id,
    label: item.label,
    href: item.href || '#',
    hasDropdown: !!(item.children && item.children.length),
    items: (item.children || []).map((c) => ({
      icon: c.icon || 'link',
      title: c.label,
      desc: c.description || '',
      href: c.href || '#',
    })),
    banner: null, // 后端暂无 banner 数据
  }));
}

/* ─── Stats ─── */
export function transformStats(apiStats) {
  if (!Array.isArray(apiStats)) return [];
  return apiStats.map((s) => ({
    id: s.key,
    target: parseInt(s.value.replace(/\D/g, ''), 10) || 0,
    suffix: s.suffix || '',
    prefix: s.prefix || '',
  }));
}

/* ─── Logos ─── */
export function transformLogos(apiLogos) {
  if (!Array.isArray(apiLogos)) return [];
  return apiLogos.map((l) => ({
    id: l.name.toLowerCase().replace(/\s+/g, '-'),
    name: l.name,
    initial: l.name.charAt(0),
    brandColor: l.industry === 'tech' ? '#1B5FEB' : l.industry === 'mfg' ? '#059669' : l.industry === 'retail' ? '#D97706' : '#7C3AED',
    industry: l.industry || 'all',
  }));
}

/* ─── WhyUs ─── */
export function transformWhyUsTabs(apiTabs) {
  if (!Array.isArray(apiTabs)) return [];
  return apiTabs.map((t) => ({
    id: t.slug,
    label: t.label,
    icon: t.icon,
    metrics: (t.metrics || []).map((m) => ({
      num: m.num || m.value || 0,
      label: m.label,
      desc: m.desc,
    })),
  }));
}

/* ─── AI Cards ─── */
export function transformAiCards(apiCards) {
  if (!Array.isArray(apiCards)) return [];
  return apiCards.map((c) => ({
    id: c.slug,
    icon: c.icon || 'sparkles',
    name: c.name,
    tagline: c.tagline,
    hot: c.slug === 'ai-interview',
  }));
}

/* ─── Search Results ─── */
export function transformSearchResults(apiResults) {
  if (!Array.isArray(apiResults)) return [];
  const iconMap = {
    post: 'file-text',
    product: 'box',
    industry: 'factory',
    resource: 'book-open',
    general: 'link',
  };
  return apiResults.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    desc: r.description || '',
    icon: iconMap[r.type] || 'link',
    section: r.url || '#',
  }));
}
