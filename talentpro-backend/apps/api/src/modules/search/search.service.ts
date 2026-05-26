import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PostStatus } from '@prisma/client';

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  description?: string;
  slug?: string;
  url?: string;
  meta?: Record<string, any>;
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string, filters?: { type?: string; limit?: number }): Promise<SearchResult[]> {
    const q = query.trim();
    if (!q) return [];
    const limit = filters?.limit || 20;
    const results: SearchResult[] = [];

    // Blog posts
    if (!filters?.type || filters.type === 'post') {
      const posts = await this.prisma.blogPost.findMany({
        where: {
          status: PostStatus.PUBLISHED,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { excerpt: { contains: q, mode: 'insensitive' } },
            { content: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { publishedAt: 'desc' },
        include: { category: true },
      });
      results.push(...posts.map((p) => ({
        type: 'post',
        id: p.id,
        title: p.title,
        description: p.excerpt || '',
        slug: p.slug,
        url: `/blog/${p.slug}`,
        meta: { category: p.category?.name, publishedAt: p.publishedAt },
      })));
    }

    // Products
    if (!filters?.type || filters.type === 'product') {
      const products = await this.prisma.product.findMany({
        where: {
          isPublished: true,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { tagline: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        include: { tab: true },
      });
      results.push(...products.map((p) => ({
        type: 'product',
        id: p.id,
        title: p.name,
        description: p.tagline,
        slug: p.slug,
        url: `/products/${p.slug}`,
        meta: { tab: p.tab?.label },
      })));
    }

    // Industries
    if (!filters?.type || filters.type === 'industry') {
      const industries = await this.prisma.industry.findMany({
        where: {
          isPublished: true,
          OR: [
            { label: { contains: q, mode: 'insensitive' } },
            { slug: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
      });
      results.push(...industries.map((i) => ({
        type: 'industry',
        id: i.id,
        title: i.label,
        description: '',
        slug: i.slug,
        url: `/solutions/${i.slug}`,
        meta: {},
      })));
    }

    // Resources
    if (!filters?.type || filters.type === 'resource') {
      const resources = await this.prisma.resource.findMany({
        where: {
          status: PostStatus.PUBLISHED,
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        include: { category: true },
      });
      results.push(...resources.map((r) => ({
        type: 'resource',
        id: r.id,
        title: r.title,
        description: r.description || '',
        slug: r.slug,
        url: `/resources/${r.slug}`,
        meta: { category: r.category?.name, type: r.type },
      })));
    }

    return results.slice(0, limit);
  }

  async getSuggestions(query: string, limit = 5): Promise<string[]> {
    const q = query.trim();
    if (!q) return [];
    const posts = await this.prisma.blogPost.findMany({
      where: { status: PostStatus.PUBLISHED, title: { contains: q, mode: 'insensitive' } },
      take: limit,
      select: { title: true },
    });
    return posts.map((p) => p.title);
  }
}
