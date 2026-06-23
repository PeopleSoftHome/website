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
    const searchOpts = { attributesToRetrieve: ['*'] as string[] };

    // 使用 multi-search 将多个索引查询合并为一次 HTTP 往返，显著降低延迟。
    const queries: { indexUid: string; q: string; limit: number; attributesToRetrieve: string[] }[] = [];
    if (!type || type === 'post') queries.push({ indexUid: 'blog_posts', q, limit, ...searchOpts });
    if (!type || type === 'forum_topic') queries.push({ indexUid: 'forum_topics', q, limit, ...searchOpts });
    if (!type || type === 'product') queries.push({ indexUid: 'products', q, limit, ...searchOpts });

    if (queries.length === 0) return [];

    const multiRes = await this.meili.multiSearch({ queries });

    multiRes.results.forEach((res) => {
      const indexUid = (res as SearchHit & { indexUid?: string }).indexUid || '';
      const hits = (res as SearchHit & { hits?: SearchHit[] }).hits || [];
      if (indexUid === 'blog_posts' && (!type || type === 'post')) {
        results.push(...hits.map((h: SearchHit) => ({
          type: 'post',
          id: h.id as string,
          title: h.title as string,
          description: (h.excerpt as string) || '',
          slug: h.slug as string,
          url: `/blog/${h.slug as string}`,
          meta: { category: h.categoryName, publishedAt: h.publishedAt } as Record<string, unknown>,
        })));
      } else if (indexUid === 'forum_topics' && (!type || type === 'forum_topic')) {
        results.push(...hits.map((h: SearchHit) => ({
          type: 'forum_topic',
          id: h.id as string,
          title: h.title as string,
          description: '',
          slug: h.id as string,
          url: `/forum/topic/${h.id as string}`,
          meta: { category: h.categoryName, createdAt: h.createdAt } as Record<string, unknown>,
        })));
      } else if (indexUid === 'products' && (!type || type === 'product')) {
        results.push(...hits.map((h: SearchHit) => ({
          type: 'product',
          id: h.id as string,
          title: h.name as string,
          description: (h.tagline as string) || '',
          slug: h.slug as string,
          url: `/products/${h.slug as string}`,
          meta: { tab: h.tabName } as Record<string, unknown>,
        })));
      }
    });

    return results.slice(0, limit);
  }

  async suggest(q: string, limit = 8): Promise<string[]> {
    // 并行查询三个索引，缩短建议等待时间。
    const queries = this.indexes.map((indexUid) => ({ indexUid, q, limit: 5, attributesToRetrieve: ['title'] as string[] }));
    const multiRes = await this.meili.multiSearch({ queries });
    const titles = new Set<string>();
    multiRes.results.forEach((res) => {
      const hits = (res as SearchHit & { hits?: SearchHit[] }).hits || [];
      for (const hit of hits) {
        if (hit.title) titles.add(hit.title as string);
      }
    });
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
