import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CmsContentRepository } from './cms-content.repository';

interface NavItem {
  label: string;
  href: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
  isExternal?: boolean;
}

@Injectable()
export class CmsPageService {
  constructor(
    private prisma: PrismaService,
    private cmsRepo: CmsContentRepository,
  ) {}

  async findAllPages(page = 1, pageSize = 20) {
    return this.cmsRepo.forModel('page').findAll({
      page,
      pageSize,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPageBySlug(slug: string) {
    const page = await this.cmsRepo.forModel('page').findBySlug(slug, {
      sections: { orderBy: { sortOrder: 'asc' } },
    });
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async createPage(data: { slug: string; title: string; metaTitle?: string; metaDesc?: string }) {
    return this.cmsRepo.forModel('page').create(data);
  }

  async updatePage(id: string, data: Partial<{ title: string; metaTitle: string; metaDesc: string; isPublished: boolean }>) {
    return this.cmsRepo.forModel('page').update(id, data);
  }

  async deletePage(id: string) {
    return this.cmsRepo.forModel('page').delete(id);
  }

  // ─── Sections ───
  async findSectionsByPage(pageId: string) {
    return this.cmsRepo.forModel('section').findAll({
      where: { pageId },
      orderBy: { sortOrder: 'asc' },
      pageSize: 100,
    });
  }

  async createSection(data: { pageId: string; type: string; sortOrder?: number; config?: Record<string, unknown>; isActive?: boolean }) {
    return this.cmsRepo.forModel('section').create({
      pageId: data.pageId,
      type: data.type,
      sortOrder: data.sortOrder ?? 0,
      config: data.config ?? {},
      isActive: data.isActive ?? true,
    });
  }

  async updateSection(id: string, data: Partial<{ type: string; sortOrder: number; config: Record<string, unknown>; isActive: boolean }>) {
    return this.cmsRepo.forModel('section').update(id, data);
  }

  async deleteSection(id: string) {
    return this.cmsRepo.forModel('section').delete(id);
  }

  async batchUpdateSections(sections: Array<{ id: string; sortOrder: number; isActive: boolean }>) {
    return this.prisma.$transaction(
      sections.map((s) =>
        this.prisma.section.update({
          where: { id: s.id },
          data: { sortOrder: s.sortOrder, isActive: s.isActive },
        }),
      ),
    );
  }

  // ─── Navigation ───
  async findNavigation(key: string) {
    return this.prisma.navigation.findUnique({
      where: { key },
      include: {
        items: {
          where: { parentId: null },
          include: { children: { orderBy: { sortOrder: 'asc' } } },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async upsertNavigation(data: { key: string; label: string; location?: string; items: NavItem[] }) {
    return this.prisma.$transaction(async (tx) => {
      const nav = await tx.navigation.upsert({
        where: { key: data.key },
        update: { label: data.label },
        create: { key: data.key, label: data.label, location: data.location || 'header' },
      });
      await tx.navItem.deleteMany({ where: { navigationId: nav.id } });
      for (const item of data.items) {
        await tx.navItem.create({
          data: {
            navigationId: nav.id,
            label: item.label,
            href: item.href,
            icon: item.icon,
            description: item.description,
            sortOrder: item.sortOrder || 0,
            isExternal: item.isExternal || false,
          },
        });
      }
      return tx.navigation.findUnique({
        where: { key: data.key },
        include: {
          items: {
            where: { parentId: null },
            include: { children: { orderBy: { sortOrder: 'asc' } } },
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
    });
  }

  // ─── Translation ───
  async findTranslations(locale: string, context?: string) {
    const where: Prisma.TranslationWhereInput = { locale };
    if (context) where.context = context;
    const rows = await this.prisma.translation.findMany({ where });
    const result: Record<string, string> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return result;
  }

  async upsertTranslation(data: { locale: string; key: string; value: string; context?: string }) {
    return this.prisma.translation.upsert({
      where: { locale_key: { locale: data.locale, key: data.key } },
      update: { value: data.value, context: data.context },
      create: data,
    });
  }

  async findAllTranslations(page: number | undefined, pageSize: number | undefined, locale?: string, context?: string) {
    const p = page || 1;
    const ps = pageSize || 20;
    const skip = (p - 1) * ps;
    const where: Prisma.TranslationWhereInput = {};
    if (locale) where.locale = locale;
    if (context) where.context = context;
    const [data, total] = await Promise.all([
      this.prisma.translation.findMany({
        where,
        skip,
        take: ps,
        orderBy: [{ locale: 'asc' }, { key: 'asc' }],
      }),
      this.prisma.translation.count({ where }),
    ]);
    return { data, meta: { page: p, pageSize: ps, total, totalPages: Math.ceil(total / ps) } };
  }

  async updateTranslation(id: string, data: { value?: string; context?: string }) {
    return this.prisma.translation.update({ where: { id }, data });
  }

  async deleteTranslation(id: string) {
    await this.prisma.translation.delete({ where: { id } });
    return { message: 'Deleted successfully' };
  }
}
