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
