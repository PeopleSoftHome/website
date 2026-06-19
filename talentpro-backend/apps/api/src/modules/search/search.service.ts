import { Injectable, Logger } from '@nestjs/common';
import { SearchMeilisearchService } from './search-meilisearch.service';
import { SearchPrismaService } from './search-prisma.service';
import { SearchIndexService } from './search-index.service';
import { SearchDocument, SearchResult } from './search.types';

/**
 * SearchService — Facade
 * 组合 Meilisearch / Prisma / Index 三个子服务，对外保持统一接口
 */
@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private meiliService: SearchMeilisearchService,
    private prismaService: SearchPrismaService,
    private indexService: SearchIndexService,
  ) {}

  async search(query: string, filters?: { type?: string; limit?: number }): Promise<SearchResult[]> {
    const q = query.trim();
    if (!q) return [];
    const limit = filters?.limit || 20;

    try {
      return await this.meiliService.search(q, filters?.type, limit);
    } catch (e: unknown) {
      this.logger.warn(`Meilisearch search failed, falling back to Prisma: ${e instanceof Error ? e.message : String(e)}`);
      return this.prismaService.search(q, filters?.type, limit);
    }
  }

  async suggest(query: string, limit = 8): Promise<string[]> {
    const q = query.trim();
    if (!q || q.length < 2) return [];
    try {
      return await this.meiliService.suggest(q, limit);
    } catch (e: unknown) {
      this.logger.warn(`Suggest failed: ${e instanceof Error ? e.message : String(e)}`);
      return [];
    }
  }

  async getSuggestions(query: string, limit = 5): Promise<string[]> {
    const q = query.trim();
    if (!q) return [];
    try {
      return await this.meiliService.getSuggestions(q, limit);
    } catch {
      return this.prismaService.getSuggestions(q, limit);
    }
  }

  // 索引操作委托给 SearchIndexService
  async indexDocument(entityType: string, payload: SearchDocument) {
    return this.indexService.indexDocument(entityType, payload);
  }

  async updateDocument(entityType: string, entityId: string, payload?: SearchDocument) {
    return this.indexService.updateDocument(entityType, entityId, payload);
  }

  async deleteDocument(entityType: string, entityId: string) {
    return this.indexService.deleteDocument(entityType, entityId);
  }

  async batchIndex(entityType: 'blog_post' | 'forum_topic' | 'product') {
    return this.indexService.batchIndex(entityType);
  }
}
