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
