import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';
import { PrismaService } from '@shared/prisma/prisma.service';
import { PostStatus } from '@prisma/client';
import { MEILISEARCH_CLIENT } from '../meilisearch/meilisearch.module';
import { SearchDocument } from './search.types';

@Injectable()
export class SearchIndexService {
  private readonly logger = new Logger(SearchIndexService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(MEILISEARCH_CLIENT) private readonly meili: MeiliSearch,
  ) {}

  async indexDocument(entityType: string, payload: SearchDocument) {
    const indexName = this.mapIndexName(entityType);
    if (!indexName) return;
    try {
      await this.meili.index(indexName).addDocuments([payload]);
    } catch (e: unknown) {
      this.logger.warn(`indexDocument failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async updateDocument(entityType: string, entityId: string, payload?: SearchDocument) {
    const indexName = this.mapIndexName(entityType);
    if (!indexName) return;
    try {
      if (payload) {
        await this.meili.index(indexName).updateDocuments([{ id: entityId, ...payload }]);
      } else {
        const doc = await this.fetchDocumentForIndex(entityType, entityId);
        if (doc) {
          await this.meili.index(indexName).updateDocuments([doc]);
        }
      }
    } catch (e: unknown) {
      this.logger.warn(`updateDocument failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async deleteDocument(entityType: string, entityId: string) {
    const indexName = this.mapIndexName(entityType);
    if (!indexName) return;
    try {
      await this.meili.index(indexName).deleteDocument(entityId);
    } catch (e: unknown) {
      this.logger.warn(`deleteDocument failed: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async batchIndex(entityType: 'blog_post' | 'forum_topic' | 'product') {
    const indexName = this.mapIndexName(entityType);
    if (!indexName) return;

    let documents: SearchDocument[] = [];

    if (entityType === 'blog_post') {
      const posts = await this.prisma.blogPost.findMany({
        where: { status: PostStatus.PUBLISHED },
        include: { category: true, author: { select: { name: true } } },
      });
      documents = posts.map((p) => ({
        id: p.id,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
        slug: p.slug,
        categoryName: p.category?.name,
        authorName: p.author?.name,
        publishedAt: p.publishedAt,
      }));
    } else if (entityType === 'forum_topic') {
      const topics = await this.prisma.forumTopic.findMany({
        include: { category: true, author: { select: { name: true } } },
      });
      documents = topics.map((t) => ({
        id: t.id,
        title: t.title,
        content: t.content,
        categoryName: t.category?.name,
        authorName: t.author?.name,
        createdAt: t.createdAt,
      }));
    } else if (entityType === 'product') {
      const products = await this.prisma.product.findMany({
        where: { isPublished: true },
        include: { tab: true },
      });
      documents = products.map((p) => ({
        id: p.id,
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        slug: p.slug,
        tabName: p.tab?.label,
      }));
    }

    if (documents.length > 0) {
      try {
        await this.meili.index(indexName).addDocuments(documents);
        this.logger.log(`Batch indexed ${documents.length} ${entityType} documents`);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        const stack = e instanceof Error ? e.stack : String(e);
        this.logger.error(`Failed to index ${entityType} documents`, stack);
        throw new Error(`MeiliSearch indexing failed: ${message}`);
      }
    }
  }

  private mapIndexName(entityType: string): string | null {
    const map: Record<string, string> = {
      blog_post: 'blog_posts',
      forum_topic: 'forum_topics',
      product: 'products',
    };
    return map[entityType] || null;
  }

  async fetchDocumentForIndex(entityType: string, entityId: string): Promise<SearchDocument | null> {
    if (entityType === 'blog_post') {
      const post = await this.prisma.blogPost.findUnique({
        where: { id: entityId },
        include: { category: true, author: { select: { name: true } } },
      });
      if (!post) return null;
      return {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        slug: post.slug,
        categoryName: post.category?.name,
        authorName: post.author?.name,
        publishedAt: post.publishedAt,
      };
    }
    if (entityType === 'forum_topic') {
      const topic = await this.prisma.forumTopic.findUnique({
        where: { id: entityId },
        include: { category: true, author: { select: { name: true } } },
      });
      if (!topic) return null;
      return {
        id: topic.id,
        title: topic.title,
        content: topic.content,
        categoryName: topic.category?.name,
        authorName: topic.author?.name,
        createdAt: topic.createdAt,
      };
    }
    if (entityType === 'product') {
      const product = await this.prisma.product.findUnique({
        where: { id: entityId },
        include: { tab: true },
      });
      if (!product) return null;
      return {
        id: product.id,
        name: product.name,
        tagline: product.tagline,
        description: product.description,
        slug: product.slug,
        tabName: product.tab?.label,
      };
    }
    return null;
  }
}
