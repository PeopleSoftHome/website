import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PostStatus } from '@prisma/client';
import { MEILISEARCH_CLIENT } from '../meilisearch/meilisearch.module';

@Injectable()
export class SearchIndexService {
  private readonly logger = new Logger(SearchIndexService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(MEILISEARCH_CLIENT) private readonly meili: MeiliSearch,
  ) {}

  async indexDocument(entityType: string, payload: any) {
    const indexName = this.mapIndexName(entityType);
    if (!indexName) return;
    try {
      await this.meili.index(indexName).addDocuments([payload]);
    } catch (e: any) {
      this.logger.warn(`indexDocument failed: ${e.message}`);
    }
  }

  async updateDocument(entityType: string, entityId: string, payload?: any) {
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
    } catch (e: any) {
      this.logger.warn(`updateDocument failed: ${e.message}`);
    }
  }

  async deleteDocument(entityType: string, entityId: string) {
    const indexName = this.mapIndexName(entityType);
    if (!indexName) return;
    try {
      await this.meili.index(indexName).deleteDocument(entityId);
    } catch (e: any) {
      this.logger.warn(`deleteDocument failed: ${e.message}`);
    }
  }

  async batchIndex(entityType: 'blog_post' | 'forum_topic' | 'product') {
    const indexName = this.mapIndexName(entityType);
    if (!indexName) return;

    let documents: any[] = [];

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
      await this.meili.index(indexName).addDocuments(documents);
      this.logger.log(`Batch indexed ${documents.length} ${entityType} documents`);
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

  private async fetchDocumentForIndex(entityType: string, entityId: string): Promise<any | null> {
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
    return null;
  }
}
