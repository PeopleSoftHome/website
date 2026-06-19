import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';
import { MEILISEARCH_CLIENT } from '../meilisearch/meilisearch.module';
import { SearchResult } from './search.types';

type SearchHit = Record<string, unknown>;

@Injectable()
export class SearchMeilisearchService {
  private readonly logger = new Logger(SearchMeilisearchService.name);
  private readonly indexes = ['blog_posts', 'forum_topics', 'products'] as const;

  constructor(
    @Inject(MEILISEARCH_CLIENT) private readonly meili: MeiliSearch,
  ) {}

  async onModuleInit() {
    for (const indexName of this.indexes) {
      try {
        await this.meili.createIndex(indexName, { primaryKey: 'id' });
        this.logger.log(`Meilisearch index created: ${indexName}`);
      } catch (e: unknown) {
        const err = e as { code?: string; message?: string };
        if (err.code === 'index_already_exists') {
          this.logger.log(`Meilisearch index already exists: ${indexName}`);
        } else {
          this.logger.warn(`Meilisearch index init warning: ${err.message}`);
        }
      }
    }
    try {
      await this.meili.index('blog_posts').updateSearchableAttributes(['title', 'excerpt', 'content']);
      await this.meili.index('forum_topics').updateSearchableAttributes(['title', 'content']);
      await this.meili.index('products').updateSearchableAttributes(['name', 'tagline', 'description']);
    } catch (e: unknown) {
      const err = e as { message?: string };
      this.logger.warn(`Meilisearch settings update warning: ${err.message}`);
    }
  }

  async search(q: string, type?: string, limit = 20): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const searchOpts = { limit, attributesToRetrieve: ['*'] };

    if (!type || type === 'post') {
      const res = await this.meili.index('blog_posts').search(q, searchOpts);
      results.push(...res.hits.map((h: SearchHit) => ({
        type: 'post',
        id: h.id as string,
        title: h.title as string,
        description: (h.excerpt as string) || '',
        slug: h.slug as string,
        url: `/blog/${h.slug as string}`,
        meta: { category: h.categoryName, publishedAt: h.publishedAt } as Record<string, unknown>,
      })));
    }

    if (!type || type === 'forum_topic') {
      const res = await this.meili.index('forum_topics').search(q, searchOpts);
      results.push(...res.hits.map((h: SearchHit) => ({
        type: 'forum_topic',
        id: h.id as string,
        title: h.title as string,
        description: '',
        slug: h.id as string,
        url: `/forum/topic/${h.id as string}`,
        meta: { category: h.categoryName, createdAt: h.createdAt } as Record<string, unknown>,
      })));
    }

    if (!type || type === 'product') {
      const res = await this.meili.index('products').search(q, searchOpts);
      results.push(...res.hits.map((h: SearchHit) => ({
        type: 'product',
        id: h.id as string,
        title: h.name as string,
        description: (h.tagline as string) || '',
        slug: h.slug as string,
        url: `/products/${h.slug as string}`,
        meta: { tab: h.tabName } as Record<string, unknown>,
      })));
    }

    return results.slice(0, limit);
  }

  async suggest(q: string, limit = 8): Promise<string[]> {
    const titles = new Set<string>();
    for (const idx of this.indexes) {
      const res = await this.meili.index(idx).search(q, { limit: 5, attributesToRetrieve: ['title'] });
      for (const hit of res.hits as SearchHit[]) {
        if (hit.title) titles.add(hit.title as string);
      }
    }
    return Array.from(titles).slice(0, limit);
  }

  async getSuggestions(q: string, limit = 5): Promise<string[]> {
    const res = await this.meili.index('blog_posts').search(q, {
      limit,
      attributesToRetrieve: ['title'],
    });
    return (res.hits as SearchHit[]).map((h) => h.title as string);
  }
}
