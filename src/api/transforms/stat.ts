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
