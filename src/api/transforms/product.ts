import {
  PRODUCT_ICONS,
  ICON_COLORS,
  ICON_BG_COLORS,
} from '@/components/ui/ProductIcons/index';

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
