export type SearchIndexAction = 'create' | 'update' | 'delete';

export class SearchIndexEvent {
  constructor(
    public readonly entityType: 'blog_post' | 'forum_topic' | 'product',
    public readonly entityId: string,
    public readonly action: SearchIndexAction,
    public readonly payload?: Record<string, unknown>,
  ) {}
}
