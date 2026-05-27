import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class CmsContentService {
  constructor(private prisma: PrismaService) {}

  // ─── Product ───
  async findAllProducts() {
    return this.prisma.productTab.findMany({
      include: { products: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
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

  // ─── Stats ───
  async findAllStats() {
    return this.prisma.stat.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async upsertStat(data: { key: string; label: string; value: string; suffix?: string; prefix?: string; sortOrder?: number }) {
    return this.prisma.stat.upsert({
      where: { key: data.key },
      update: { label: data.label, value: data.value, suffix: data.suffix, prefix: data.prefix, sortOrder: data.sortOrder },
      create: data,
    });
  }

  // ─── Client Logos ───
  async findAllLogos() {
    return this.prisma.clientLogo.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async upsertLogo(data: { name: string; logo: string; industry?: string; sortOrder?: number }) {
    return this.prisma.clientLogo.create({ data });
  }

  // ─── WhyUs ───
  async findAllWhyUsTabs() {
    return this.prisma.whyUsTab.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async upsertWhyUsTab(data: { slug: string; label: string; icon?: string; metrics?: any[]; sortOrder?: number }) {
    return this.prisma.whyUsTab.upsert({
      where: { slug: data.slug },
      update: { label: data.label, icon: data.icon, metrics: data.metrics, sortOrder: data.sortOrder },
      create: data,
    });
  }

  // ─── AI Family ───
  async findAllAiCards() {
    return this.prisma.aiCard.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async upsertAiCard(data: { slug: string; name: string; tagline: string; description?: string; icon?: string; features?: any[]; color?: string; sortOrder?: number }) {
    return this.prisma.aiCard.upsert({
      where: { slug: data.slug },
      update: { name: data.name, tagline: data.tagline, description: data.description, icon: data.icon, features: data.features, color: data.color, sortOrder: data.sortOrder },
      create: data,
    });
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

  async createResource(data: { categoryId: string; slug: string; title: string; description?: string; type?: string; coverImage?: string; fileUrl?: string; requiresLeadInfo?: boolean }) {
    return this.prisma.resource.create({ data });
  }
}
