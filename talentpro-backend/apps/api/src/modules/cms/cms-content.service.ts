import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma, ResourceType } from '@prisma/client';
import { PrismaService } from '@shared/prisma/prisma.service';
import { CmsContentRepository } from './cms-content.repository';
import { SearchIndexEvent } from '@/events/search-index.event';

@Injectable()
export class CmsContentService {
  constructor(
    private prisma: PrismaService,
    private cmsRepo: CmsContentRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  // ─── Product ───
  async findAllProducts() {
    return this.cmsRepo.forModel('productTab').findAll({
      orderBy: { sortOrder: 'asc' },
      include: { products: { orderBy: { sortOrder: 'asc' } } },
      pageSize: 100,
    });
  }

  async findProductBySlug(slug: string) {
    return this.cmsRepo.forModel('product').findBySlug(slug);
  }

  async createProductTab(data: { label: string; slug: string; icon?: string; iconColor?: string; iconBg?: string }) {
    return this.cmsRepo.forModel('productTab').create(data);
  }

  async createProduct(data: { tabId: string; slug: string; name: string; tagline: string; description?: string; icon?: string; features?: Record<string, unknown>[] }) {
    const product = await this.cmsRepo.forModel('product').create({
      ...data,
      features: data.features || [],
    });
    this.eventEmitter.emit('search.index', new SearchIndexEvent('product', product.id, 'create'));
    return product;
  }

  // ─── Industry ───
  async findAllIndustries() {
    return this.cmsRepo.forModel('industry').findAll({
      where: { isPublished: true },
      orderBy: { sortOrder: 'asc' },
      pageSize: 100,
    });
  }

  async findIndustryBySlug(slug: string) {
    return this.cmsRepo.forModel('industry').findBySlug(slug);
  }

  async createIndustry(data: { slug: string; label: string; icon?: string; features?: Record<string, unknown>[]; screenshot?: Record<string, unknown> }) {
    return this.cmsRepo.forModel('industry').create({
      ...data,
      features: data.features || [],
      screenshot: data.screenshot || {},
    });
  }

  // ─── Testimonial ───
  async findAllTestimonials() {
    return this.cmsRepo.forModel('testimonial').findAll({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      pageSize: 100,
    });
  }

  async createTestimonial(data: { industry: string; product: string; text: string; name: string; title: string; avatar?: string }) {
    return this.cmsRepo.forModel('testimonial').create(data);
  }

  // ─── Stats ───
  async findAllStats() {
    return this.cmsRepo.forModel('stat').findAll({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      pageSize: 100,
    });
  }

  async upsertStat(data: { key: string; label: string; value: string; suffix?: string; prefix?: string; sortOrder?: number }) {
    return this.cmsRepo.forModel('stat').upsert(
      { key: data.key },
      { label: data.label, value: data.value, suffix: data.suffix, prefix: data.prefix, sortOrder: data.sortOrder },
      data,
    );
  }

  // ─── Client Logos ───
  async findAllLogos() {
    return this.cmsRepo.forModel('clientLogo').findAll({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      pageSize: 100,
    });
  }

  async upsertLogo(data: { name: string; logo: string; industry?: string; sortOrder?: number }) {
    return this.cmsRepo.forModel('clientLogo').create(data);
  }

  // ─── WhyUs ───
  async findAllWhyUsTabs() {
    return this.cmsRepo.forModel('whyUsTab').findAll({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      pageSize: 100,
    });
  }

  async upsertWhyUsTab(data: { slug: string; label: string; icon?: string; metrics?: Record<string, unknown>[]; sortOrder?: number }) {
    return this.cmsRepo.forModel('whyUsTab').upsert(
      { slug: data.slug },
      { label: data.label, icon: data.icon, metrics: data.metrics, sortOrder: data.sortOrder },
      data,
    );
  }

  // ─── AI Family ───
  async findAllAiCards() {
    return this.cmsRepo.forModel('aiCard').findAll({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      pageSize: 100,
    });
  }

  async upsertAiCard(data: { slug: string; name: string; tagline: string; description?: string; icon?: string; features?: Record<string, unknown>[]; color?: string; sortOrder?: number }) {
    return this.cmsRepo.forModel('aiCard').upsert(
      { slug: data.slug },
      { name: data.name, tagline: data.tagline, description: data.description, icon: data.icon, features: data.features, color: data.color, sortOrder: data.sortOrder },
      data,
    );
  }

  // ─── Resource ───
  async findAllResources(page = 1, pageSize = 20, categorySlug?: string) {
    const where: Prisma.ResourceWhereInput = { status: 'PUBLISHED' };
    if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    return this.cmsRepo.forModel('resource').findAll({
      page,
      pageSize,
      where,
      orderBy: { publishedAt: 'desc' },
      include: { category: true },
    });
  }

  async createResourceCategory(data: { name: string; slug: string; description?: string }) {
    return this.cmsRepo.forModel('resourceCategory').create(data);
  }

  async createResource(data: { categoryId: string; slug: string; title: string; description?: string; type?: ResourceType; coverImage?: string; fileUrl?: string; requiresLeadInfo?: boolean }) {
    return this.cmsRepo.forModel('resource').create(data);
  }
}
