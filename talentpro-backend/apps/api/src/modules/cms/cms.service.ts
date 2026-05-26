import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class CmsService {
  constructor(private prisma: PrismaService) {}

  // ─── Page ───
  async findAllPages(page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
      this.prisma.page.findMany({ skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      this.prisma.page.count(),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findPageBySlug(slug: string) {
    const page = await this.prisma.page.findUnique({
      where: { slug },
      include: { sections: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!page) throw new NotFoundException('页面不存在');
    return page;
  }

  async createPage(data: { slug: string; title: string; metaTitle?: string; metaDesc?: string }) {
    return this.prisma.page.create({ data });
  }

  async updatePage(id: string, data: Partial<{ title: string; metaTitle: string; metaDesc: string; isPublished: boolean }>) {
    return this.prisma.page.update({ where: { id }, data });
  }

  async deletePage(id: string) {
    await this.prisma.page.delete({ where: { id } });
    return { message: '删除成功' };
  }

  // ─── Product ───
  async findAllProducts() {
    const tabs = await this.prisma.productTab.findMany({
      include: { products: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
    return tabs;
  }

  async createProductTab(data: { label: string; slug: string; icon?: string; iconColor?: string; iconBg?: string }) {
    return this.prisma.productTab.create({ data });
  }

  async createProduct(data: { tabId: string; slug: string; name: string; tagline: string; description?: string; icon?: string; features?: any[] }) {
    return this.prisma.product.create({
      data: { ...data, features: data.features || [] },
    });
  }

  // ─── Industry ───
  async findAllIndustries() {
    return this.prisma.industry.findMany({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createIndustry(data: { slug: string; label: string; icon?: string; features?: any[]; screenshot?: any }) {
    return this.prisma.industry.create({
      data: { ...data, features: data.features || [], screenshot: data.screenshot || {} },
    });
  }

  // ─── Testimonial ───
  async findAllTestimonials() {
    return this.prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createTestimonial(data: { industry: string; product: string; text: string; name: string; title: string; avatar?: string }) {
    return this.prisma.testimonial.create({ data });
  }

  // ─── Resource ───
  async findAllResources(page = 1, pageSize = 20, categorySlug?: string) {
    const skip = (page - 1) * pageSize;
    const where: any = { status: 'PUBLISHED' };
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    const [data, total] = await Promise.all([
      this.prisma.resource.findMany({
        skip,
        take: pageSize,
        where,
        include: { category: true },
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.resource.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async createResourceCategory(data: { name: string; slug: string; description?: string }) {
    return this.prisma.resourceCategory.create({ data });
  }

  async createResource(data: { categoryId: string; slug: string; title: string; description?: string; type?: string; coverImage?: string; fileUrl?: string }) {
    return this.prisma.resource.create({ data });
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

  async upsertNavigation(data: { key: string; label: string; location?: string; items: any[] }) {
    const nav = await this.prisma.navigation.upsert({
      where: { key: data.key },
      update: { label: data.label },
      create: { key: data.key, label: data.label, location: data.location || 'header' },
    });
    // 简化实现：先删除旧 items，再创建新 items
    await this.prisma.navItem.deleteMany({ where: { navigationId: nav.id } });
    for (const item of data.items) {
      await this.prisma.navItem.create({
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
    return this.findNavigation(data.key);
  }

  // ─── Translation ───
  async findTranslations(locale: string, context?: string) {
    const where: any = { locale };
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
}
