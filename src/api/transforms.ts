import {
  PRODUCT_ICONS,
  ICON_COLORS,
  ICON_BG_COLORS,
} from '@/components/ui/ProductIcons/index.js';

/* ─── Product Matrix ─── */
interface ProductTab {
  slug: string;
  label: string;
  products?: Product[];
}

interface Product {
  slug: string;
  name: string;
  description?: string;
  tagline?: string;
}

export function transformProductTabs(apiTabs: unknown[]) {
  if (!Array.isArray(apiTabs)) return [];
  return (apiTabs as ProductTab[]).map((tab) => ({
    id: tab.slug,
    label: tab.label,
    iconColor: ICON_COLORS[tab.slug as keyof typeof ICON_COLORS] || ICON_COLORS['hr-saas'],
    iconBg: ICON_BG_COLORS[tab.slug as keyof typeof ICON_BG_COLORS] || ICON_BG_COLORS['hr-saas'],
    products: (tab.products || []).map((p) => ({
      id: p.slug,
      icon: PRODUCT_ICONS[p.slug as keyof typeof PRODUCT_ICONS] || PRODUCT_ICONS['recruit'],
      name: p.name,
      desc: p.description || p.tagline || '',
    })),
  }));
}

/* ─── Industry Solution ─── */
interface IndustryFeature {
  badge?: string;
  title?: string;
  desc?: string;
}

interface Industry {
  slug: string;
  label: string;
  icon?: string;
  features?: IndustryFeature[];
  screenshot?: Record<string, unknown>;
}

export function transformIndustries(apiIndustries: unknown[]) {
  if (!Array.isArray(apiIndustries)) return [];
  return (apiIndustries as Industry[]).map((ind) => ({
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

interface Testimonial {
  id: string;
  industry?: string;
  product?: string;
  text?: string;
  name?: string;
  title?: string;
  avatar?: string | null;
}

export function transformTestimonials(apiTestimonials: unknown[]) {
  if (!Array.isArray(apiTestimonials)) return [];
  return (apiTestimonials as Testimonial[]).map((t, i) => ({
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
} as const;

interface Resource {
  slug?: string;
  id?: string;
  type: keyof typeof RESOURCE_TYPE_META;
  title: string;
  description?: string;
  publishedAt?: string;
  createdAt?: string;
}

export function transformResources(apiResources: unknown[]) {
  if (!Array.isArray(apiResources)) return [];
  return (apiResources as Resource[]).map((r) => {
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
        : new Date(r.createdAt as string).toISOString().split('T')[0],
      cta: meta.cta,
    };
  });
}

/* ─── Navigation ─── */
interface NavChild {
  icon?: string;
  label?: string;
  description?: string;
  href?: string;
}

interface NavItem {
  id?: string;
  label?: string;
  href?: string;
  children?: NavChild[];
}

interface Navigation {
  items?: NavItem[];
}

export function transformNavigation(apiNav: unknown) {
  if (!apiNav || !(apiNav as Navigation).items) return [];
  return ((apiNav as Navigation).items || []).map((item) => ({
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
interface Stat {
  key: string;
  value: string;
  suffix?: string;
  prefix?: string;
}

export function transformStats(apiStats: unknown[]) {
  if (!Array.isArray(apiStats)) return [];
  return (apiStats as Stat[]).map((s) => ({
    id: s.key,
    target: parseInt(s.value.replace(/\D/g, ''), 10) || 0,
    suffix: s.suffix || '',
    prefix: s.prefix || '',
  }));
}

/* ─── Logos ─── */
interface Logo {
  name: string;
  industry?: string;
}

export function transformLogos(apiLogos: unknown[]) {
  if (!Array.isArray(apiLogos)) return [];
  return (apiLogos as Logo[]).map((l) => ({
    id: l.name.toLowerCase().replace(/\s+/g, '-'),
    name: l.name,
    initial: l.name.charAt(0),
    brandColor: l.industry === 'tech' ? '#1B5FEB' : l.industry === 'mfg' ? '#059669' : l.industry === 'retail' ? '#D97706' : '#7C3AED',
    industry: l.industry || 'all',
  }));
}

/* ─── WhyUs ─── */
interface Metric {
  num?: string | number;
  value?: string | number;
  label?: string;
  desc?: string;
}

interface WhyUsTab {
  slug: string;
  label: string;
  icon?: string;
  metrics?: Metric[];
}

export function transformWhyUsTabs(apiTabs: unknown[]) {
  if (!Array.isArray(apiTabs)) return [];
  return (apiTabs as WhyUsTab[]).map((t) => ({
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
interface AiCard {
  slug: string;
  icon?: string;
  name?: string;
  tagline?: string;
}

export function transformAiCards(apiCards: unknown[]) {
  if (!Array.isArray(apiCards)) return [];
  return (apiCards as AiCard[]).map((c) => ({
    id: c.slug,
    icon: c.icon || 'sparkles',
    name: c.name,
    tagline: c.tagline,
    hot: c.slug === 'ai-interview',
  }));
}

/* ─── Search Results ─── */
const iconMap = {
  post: 'file-text',
  product: 'box',
  industry: 'factory',
  resource: 'book-open',
  general: 'link',
} as const;

interface SearchResult {
  id: string;
  type: keyof typeof iconMap;
  title: string;
  description?: string;
  url?: string;
}

export function transformSearchResults(apiResults: unknown[]) {
  if (!Array.isArray(apiResults)) return [];
  return (apiResults as SearchResult[]).map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    desc: r.description || '',
    icon: iconMap[r.type] || 'link',
    section: r.url || '#',
  }));
}
