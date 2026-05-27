import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';
import { MEILISEARCH_CLIENT } from '../meilisearch/meilisearch.module';
import { SearchResult } from './search.types';

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
      } catch (e: any) {
        if (e.code === 'index_already_exists') {
          this.logger.log(`Meilisearch index already exists: ${indexName}`);
        } else {
          this.logger.warn(`Meilisearch index init warning: ${e.message}`);
        }
      }
    }
    try {
      await this.meili.index('blog_posts').updateSearchableAttributes(['title', 'excerpt', 'content']);
      await this.meili.index('forum_topics').updateSearchableAttributes(['title', 'content']);
      await this.meili.index('products').updateSearchableAttributes(['name', 'tagline', 'description']);
    } catch (e: any) {
      this.logger.warn(`Meilisearch settings update warning: ${e.message}`);
    }
  }

  async search(q: string, type?: string, limit = 20): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const searchOpts = { limit, attributesToRetrieve: ['*'] };

    if (!type || type === 'post') {
      const res = await this.meili.index('blog_posts').search(q, searchOpts);
      results.push(...res.hits.map((h: any) => ({
        type: 'post',
        id: h.id,
        title: h.title,
        description: h.excerpt || '',
        slug: h.slug,
        url: `/blog/${h.slug}`,
        meta: { category: h.categoryName, publishedAt: h.publishedAt },
      })));
    }

    if (!type || type === 'forum_topic') {
      const res = await this.meili.index('forum_topics').search(q, searchOpts);
      results.push(...res.hits.map((h: any) => ({
        type: 'forum_topic',
        id: h.id,
        title: h.title,
        description: '',
        slug: h.id,
        url: `/forum/topic/${h.id}`,
        meta: { category: h.categoryName, createdAt: h.createdAt },
      })));
    }

    if (!type || type === 'product') {
      const res = await this.meili.index('products').search(q, searchOpts);
      results.push(...res.hits.map((h: any) => ({
        type: 'product',
        id: h.id,
        title: h.name,
        description: h.tagline || '',
        slug: h.slug,
        url: `/products/${h.slug}`,
        meta: { tab: h.tabName },
      })));
    }

    return results.slice(0, limit);
  }

  async suggest(q: string, limit = 8): Promise<string[]> {
    const titles = new Set<string>();
    for (const idx of this.indexes) {
      const res = await this.meili.index(idx).search(q, { limit: 5, attributesToRetrieve: ['title'] });
      for (const hit of res.hits) {
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
    return res.hits.map((h: any) => h.title);
  }
}
