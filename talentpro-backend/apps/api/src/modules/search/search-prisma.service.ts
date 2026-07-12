import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { PostStatus } from '@prisma/client';
import { SearchResult } from './search.types';

@Injectable()
export class SearchPrismaService {
  constructor(private prisma: PrismaService) {}

  async search(q: string, type?: string, limit = 20): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    if (!type || type === 'post') {
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

    if (!type || type === 'product') {
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

    return results.slice(0, limit);
  }

  async getSuggestions(q: string, limit = 5): Promise<string[]> {
    const posts = await this.prisma.blogPost.findMany({
      where: { status: PostStatus.PUBLISHED, title: { contains: q, mode: 'insensitive' } },
      take: limit,
      select: { title: true },
    });
    return posts.map((p) => p.title);
  }
}
