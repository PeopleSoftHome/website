import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { AppStatus, PricingModel, SubscriptionStatus, Prisma } from '@prisma/client';
import { getSkip, buildPaginatedResponse } from '@shared/helpers/pagination.helper';
import { MarketplaceRepository } from './marketplace.repository';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class MarketplaceService {
  constructor(
    private prisma: PrismaService,
    private marketplaceRepo: MarketplaceRepository,
  ) {}

  // ─── Public Apps ───

  async findAllApps({
    category,
    pricingModel,
    search,
    sort,
    page = 1,
    pageSize = 20,
  }: {
    category?: string;
    pricingModel?: PricingModel;
    search?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
  }) {
    const where: Record<string, unknown> = { status: AppStatus.PUBLISHED, deletedAt: null };
    if (category) where.category = { slug: category };
    if (pricingModel) where.pricingModel = pricingModel;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    const orderBy = this.buildSortOrder(sort);
    return this.marketplaceRepo.findAll({
      page,
      pageSize,
      where,
      orderBy,
      include: { category: true, vendor: true },
    });
  }

  async findFeaturedApps() {
    return this.prisma.app.findMany({
      where: { status: AppStatus.PUBLISHED, featured: true, deletedAt: null },
      include: { category: true, vendor: true },
      orderBy: [{ featuredSortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findAppBySlug(slug: string) {
    const app = await this.prisma.app.findFirst({
      where: { slug, status: AppStatus.PUBLISHED, deletedAt: null },
      include: { category: true, vendor: true },
    });
    if (!app) throw new NotFoundException('App not found');
    return app;
  }

  // ─── Categories ───

  async findCategories() {
    return this.prisma.appCategory.findMany({
      where: { parentId: null },
      include: { children: true, _count: { select: { apps: true } } },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // ─── Reviews ───

  async findReviews(appSlug: string, page = 1, pageSize = 20) {
    const app = await this.prisma.app.findUnique({ where: { slug: appSlug } });
    if (!app) throw new NotFoundException('App not found');
    const skip = getSkip(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.appReview.findMany({
        where: { appId: app.id, deletedAt: null },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.appReview.count({ where: { appId: app.id, deletedAt: null } }),
    ]);
    return buildPaginatedResponse(data, page, pageSize, total);
  }

  async createReview(appSlug: string, userId: string, dto: CreateReviewDto) {
    const app = await this.prisma.app.findUnique({ where: { slug: appSlug } });
    if (!app) throw new NotFoundException('App not found');
    const review = await this.prisma.appReview.create({
      data: { ...dto, appId: app.id, userId },
    });
    await this.recalculateAppRating(app.id);
    return review;
  }

  // ─── Install / Subscriptions ───

  async installApp(appSlug: string, workspaceId: string, _userId: string) {
    const app = await this.prisma.app.findUnique({ where: { slug: appSlug } });
    if (!app) throw new NotFoundException('App not found');
    const existing = await this.prisma.subscription.findFirst({
      where: { appId: app.id, workspaceId },
    });
    if (existing) throw new ConflictException('This app is already installed in the workspace');
    const subscription = await this.prisma.subscription.create({
      data: {
        appId: app.id,
        workspaceId,
        tierName: 'trial',
        pricingModel: app.pricingModel,
        amount: 0,
        status: SubscriptionStatus.TRIAL,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });
    await this.prisma.app.update({
      where: { id: app.id },
      data: { installCount: { increment: 1 } },
    });
    return subscription;
  }

  async getWorkspaceApps(workspaceId: string) {
    return this.prisma.subscription.findMany({
      where: { workspaceId },
      include: { app: { include: { category: true, vendor: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWorkspaceSubscriptions(workspaceId: string) {
    return this.prisma.subscription.findMany({
      where: { workspaceId },
      include: { app: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Admin ───

  async findAllAppsForAdmin({
    page = 1,
    pageSize = 20,
    status,
    category,
  }: {
    page?: number;
    pageSize?: number;
    status?: AppStatus;
    category?: string;
  }) {
    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (category) where.category = { slug: category };
    return this.marketplaceRepo.findAll({
      page,
      pageSize,
      where,
      orderBy: { createdAt: 'desc' },
      include: { category: true, vendor: true },
    });
  }

  async updateAppStatus(id: string, status: AppStatus) {
    return this.marketplaceRepo.update(id, { status });
  }

  // ─── Admin Subscriptions ───

  async findAllSubscriptionsForAdmin({
    status,
    page = 1,
    pageSize = 20,
  }: {
    status?: SubscriptionStatus;
    page?: number;
    pageSize?: number;
  }) {
    const pageNum = Math.max(1, page);
    const size = Math.max(1, pageSize);
    const skip = getSkip(pageNum, size);
    const where: Prisma.SubscriptionWhereInput = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
        include: { app: true },
      }),
      this.prisma.subscription.count({ where }),
    ]);
    return buildPaginatedResponse(data, pageNum, size, total);
  }

  async updateSubscriptionStatus(id: string, status: SubscriptionStatus) {
    const subscription = await this.prisma.subscription.findUnique({ where: { id } });
    if (!subscription) throw new NotFoundException('Subscription not found');
    return this.prisma.subscription.update({ where: { id }, data: { status } });
  }

  async featureApp(id: string, featured: boolean, sortOrder?: number) {
    return this.marketplaceRepo.update(id, { featured, featuredSortOrder: sortOrder });
  }

  // ─── Admin Vendors ───

  async findAllVendors({ page = 1, pageSize = 20 }: { page?: number; pageSize?: number }) {
    const skip = getSkip(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.appVendor.findMany({ skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      this.prisma.appVendor.count(),
    ]);
    return buildPaginatedResponse(data, page, pageSize, total);
  }

  async createVendor(data: { name: string; slug: string; description?: string; contactEmail: string; verified?: boolean; revenueShareRate?: number }) {
    return this.prisma.appVendor.create({ data });
  }

  async updateVendor(id: string, data: Record<string, unknown> | object) {
    return this.prisma.appVendor.update({ where: { id }, data });
  }

  async deleteVendor(id: string) {
    return this.prisma.appVendor.delete({ where: { id } });
  }

  // ─── Admin Categories ───

  async findAllCategoriesForAdmin({ page = 1, pageSize = 20 }: { page?: number; pageSize?: number }) {
    const skip = getSkip(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.appCategory.findMany({
        skip,
        take: pageSize,
        orderBy: { sortOrder: 'asc' },
        include: { parent: true },
      }),
      this.prisma.appCategory.count(),
    ]);
    return buildPaginatedResponse(data, page, pageSize, total);
  }

  async createCategory(data: { name: string; slug: string; description?: string; icon?: string; sortOrder?: number; parentId?: string }) {
    return this.prisma.appCategory.create({ data });
  }

  async updateCategory(id: string, data: Record<string, unknown> | object) {
    return this.prisma.appCategory.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    return this.prisma.appCategory.delete({ where: { id } });
  }

  // ─── Helpers ───

  private async recalculateAppRating(appId: string) {
    const agg = await this.prisma.appReview.aggregate({
      where: { appId, deletedAt: null },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await this.prisma.app.update({
      where: { id: appId },
      data: { ratingAvg: agg._avg.rating || 0, ratingCount: agg._count.rating || 0 },
    });
  }

  private buildSortOrder(sort?: string) {
    switch (sort) {
      case 'rating':
        return { ratingAvg: 'desc' };
      case 'installCount':
        return { installCount: 'desc' };
      case 'name':
        return { name: 'asc' };
      case 'newest':
      default:
        return { createdAt: 'desc' };
    }
  }
}
