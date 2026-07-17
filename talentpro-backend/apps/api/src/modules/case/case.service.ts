import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PostStatus } from '@prisma/client';
import { PrismaService } from '@shared/prisma/prisma.service';
import { incrementViewCount } from '@shared/helpers/view-count.helper';
import { CaseStudyRepository } from './case-study.repository';

@Injectable()
export class CaseService {
  constructor(
    private prisma: PrismaService,
    private caseRepo: CaseStudyRepository,
  ) {}

  async findAll(industry?: string, featured?: boolean, page = 1, pageSize = 20) {
    const where: Prisma.CaseStudyWhereInput = { status: PostStatus.PUBLISHED, deletedAt: null };
    if (industry) where.industry = industry;
    if (featured !== undefined) where.featured = featured;
    return this.caseRepo.findAll({
      page,
      pageSize,
      where,
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }, { publishedAt: 'desc' }],
      include: { metrics: true },
    });
  }

  async findBySlug(slug: string) {
    const data = await this.prisma.caseStudy.findFirst({
      where: { slug, status: PostStatus.PUBLISHED, deletedAt: null },
      include: { metrics: true },
    });
    if (!data) throw new NotFoundException('Case not found');
    await incrementViewCount(this.prisma.caseStudy, data.id);
    return data;
  }

  async findIndustries() {
    const rows = await this.prisma.caseStudy.groupBy({
      by: ['industry'],
      where: { status: PostStatus.PUBLISHED, deletedAt: null },
      _count: { industry: true },
    });
    return rows.map((r) => ({ name: r.industry, count: r._count.industry }));
  }
}
