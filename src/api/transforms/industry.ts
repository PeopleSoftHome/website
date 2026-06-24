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
