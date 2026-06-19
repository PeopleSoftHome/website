export interface SearchResult {
  type: string;
  id: string;
  title: string;
  description?: string;
  slug?: string;
  url?: string;
  meta?: Record<string, unknown>;
}

export type SearchDocument = Record<string, unknown>;
