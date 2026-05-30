import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PostStatus } from '@prisma/client';
import { NewsRepository } from './news.repository';

@Injectable()
export class NewsService {
  constructor(
    private prisma: PrismaService,
    private repo: NewsRepository,
  ) {}

  async findAll(category?: string, page = 1, pageSize = 20) {
    const where: any = { status: PostStatus.PUBLISHED };
    if (category) where.category = category;
    return this.repo.findAll({ page, pageSize, where, orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }] });
  }

  async findBySlug(slug: string) {
    const data = await this.prisma.news.findFirst({
      where: { slug, status: PostStatus.PUBLISHED },
    });
    if (!data) throw new NotFoundException('新闻不存在');
    await this.prisma.news.update({ where: { id: data.id }, data: { viewCount: { increment: 1 } } });
    return data;
  }

  async findCategories() {
    const rows = await this.prisma.news.groupBy({
      by: ['category'],
      where: { status: PostStatus.PUBLISHED },
      _count: { category: true },
    });
    return rows.map((r) => ({ name: r.category, count: r._count.category }));
  }
}
