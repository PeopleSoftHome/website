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
