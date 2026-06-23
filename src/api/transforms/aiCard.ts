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
