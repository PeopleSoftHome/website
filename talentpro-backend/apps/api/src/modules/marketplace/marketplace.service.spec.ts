import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AppStatus, PricingModel, SubscriptionStatus, App, AppCategory, AppReview, AppVendor, Subscription } from '@prisma/client';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceRepository } from './marketplace.repository';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateVendorDto, UpdateVendorDto } from './dto/create-vendor.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';

describe('MarketplaceService', () => {
  let service: MarketplaceService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketplaceService,
        MarketplaceRepository,
        {
          provide: PrismaService,
          useValue: {
            app: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            appCategory: {
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            appVendor: {
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            appReview: {
              findMany: jest.fn(),
              create: jest.fn(),
              count: jest.fn(),
              aggregate: jest.fn(),
            },
            subscription: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<MarketplaceService>(MarketplaceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllApps', () => {
    it('should return paginated published apps', async () => {
      const mockApps = [
        { id: 'a1', name: 'Test App', slug: 'test-app', status: AppStatus.PUBLISHED, pricingModel: PricingModel.FREE },
      ];
      jest.spyOn(prisma.app, 'findMany').mockResolvedValue(mockApps as unknown as App[]);
      jest.spyOn(prisma.app, 'count').mockResolvedValue(1);

      const result = await service.findAllApps({ page: 1, pageSize: 20 });

      expect(result.data).toEqual(mockApps);
      expect(result.meta.total).toBe(1);
    });

    it('should use default pagination when params are missing', async () => {
      jest.spyOn(prisma.app, 'findMany').mockResolvedValue([] as unknown as App[]);
      jest.spyOn(prisma.app, 'count').mockResolvedValue(0);

      await service.findAllApps({});

      expect(prisma.app.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it('should filter by category slug', async () => {
      jest.spyOn(prisma.app, 'findMany').mockResolvedValue([] as unknown as App[]);
      jest.spyOn(prisma.app, 'count').mockResolvedValue(0);

      await service.findAllApps({ category: 'recruitment' });

      expect(prisma.app.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: AppStatus.PUBLISHED,
            deletedAt: null,
            category: { slug: 'recruitment' },
          }),
        }),
      );
    });

    it('should filter by pricing model', async () => {
      jest.spyOn(prisma.app, 'findMany').mockResolvedValue([] as unknown as App[]);
      jest.spyOn(prisma.app, 'count').mockResolvedValue(0);

      await service.findAllApps({ pricingModel: PricingModel.SUBSCRIPTION });

      expect(prisma.app.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: AppStatus.PUBLISHED,
            deletedAt: null,
            pricingModel: PricingModel.SUBSCRIPTION,
          }),
        }),
      );
    });

    it('should search by name/tagline/description', async () => {
      jest.spyOn(prisma.app, 'findMany').mockResolvedValue([] as unknown as App[]);
      jest.spyOn(prisma.app, 'count').mockResolvedValue(0);

      await service.findAllApps({ search: 'AI' });

      expect(prisma.app.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'AI', mode: 'insensitive' } },
              { tagline: { contains: 'AI', mode: 'insensitive' } },
              { description: { contains: 'AI', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });

    it('should sort by rating', async () => {
      jest.spyOn(prisma.app, 'findMany').mockResolvedValue([] as unknown as App[]);
      jest.spyOn(prisma.app, 'count').mockResolvedValue(0);

      await service.findAllApps({ sort: 'rating' });

      expect(prisma.app.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { ratingAvg: 'desc' } }),
      );
    });

    it('should sort by install count', async () => {
      jest.spyOn(prisma.app, 'findMany').mockResolvedValue([] as unknown as App[]);
      jest.spyOn(prisma.app, 'count').mockResolvedValue(0);

      await service.findAllApps({ sort: 'installCount' });

      expect(prisma.app.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { installCount: 'desc' } }),
      );
    });

    it('should sort by name', async () => {
      jest.spyOn(prisma.app, 'findMany').mockResolvedValue([] as unknown as App[]);
      jest.spyOn(prisma.app, 'count').mockResolvedValue(0);

      await service.findAllApps({ sort: 'name' });

      expect(prisma.app.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { name: 'asc' } }),
      );
    });

    it('should sort by newest by default', async () => {
      jest.spyOn(prisma.app, 'findMany').mockResolvedValue([] as unknown as App[]);
      jest.spyOn(prisma.app, 'count').mockResolvedValue(0);

      await service.findAllApps({ sort: 'newest' });

      expect(prisma.app.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });
  });

  describe('findFeaturedApps', () => {
    it('should return featured published apps ordered by sortOrder', async () => {
      const mockApps = [{ id: 'a1', name: 'Featured', featured: true }];
      jest.spyOn(prisma.app, 'findMany').mockResolvedValue(mockApps as unknown as App[]);

      const result = await service.findFeaturedApps();

      expect(prisma.app.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: AppStatus.PUBLISHED, featured: true, deletedAt: null },
          orderBy: [{ featuredSortOrder: 'asc' }, { createdAt: 'desc' }],
        }),
      );
      expect(result).toEqual(mockApps);
    });
  });

  describe('findAppBySlug', () => {
    it('should return app when found', async () => {
      const mockApp = { id: 'a1', name: 'Test', slug: 'test' };
      jest.spyOn(prisma.app, 'findFirst').mockResolvedValue(mockApp as unknown as App);

      const result = await service.findAppBySlug('test');

      expect(result).toEqual(mockApp);
    });

    it('should throw NotFoundException when app not found', async () => {
      jest.spyOn(prisma.app, 'findFirst').mockResolvedValue(null);

      await expect(service.findAppBySlug('not-found')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findCategories', () => {
    it('should return root categories with children', async () => {
      const mockCats = [{ id: 'c1', name: 'HR', children: [], _count: { apps: 5 } }];
      jest.spyOn(prisma.appCategory, 'findMany').mockResolvedValue(mockCats as unknown as AppCategory[]);

      const result = await service.findCategories();

      expect(prisma.appCategory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { parentId: null },
          include: { children: true, _count: { select: { apps: true } } },
        }),
      );
      expect(result).toEqual(mockCats);
    });
  });

  describe('findReviews', () => {
    it('should return paginated reviews for an app', async () => {
      const mockApp = { id: 'a1', slug: 'test' };
      const mockReviews = [{ id: 'r1', rating: 5 }];
      jest.spyOn(prisma.app, 'findUnique').mockResolvedValue(mockApp as unknown as App);
      jest.spyOn(prisma.appReview, 'findMany').mockResolvedValue(mockReviews as unknown as AppReview[]);
      jest.spyOn(prisma.appReview, 'count').mockResolvedValue(1);

      const result = await service.findReviews('test', 1, 20);

      expect(result.data).toEqual(mockReviews);
      expect(result.meta.total).toBe(1);
    });

    it('should use default pagination when params are missing', async () => {
      const mockApp = { id: 'a1', slug: 'test' };
      jest.spyOn(prisma.app, 'findUnique').mockResolvedValue(mockApp as unknown as App);
      jest.spyOn(prisma.appReview, 'findMany').mockResolvedValue([] as unknown as AppReview[]);
      jest.spyOn(prisma.appReview, 'count').mockResolvedValue(0);

      await service.findReviews('test');

      expect(prisma.appReview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it('should throw NotFoundException when app not found', async () => {
      jest.spyOn(prisma.app, 'findUnique').mockResolvedValue(null);

      await expect(service.findReviews('not-found')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createReview', () => {
    it('should create review and recalculate app rating', async () => {
      const mockApp = { id: 'a1', slug: 'test' };
      const dto: CreateReviewDto = { rating: 5, content: 'Great!' };
      const mockReview = { id: 'r1', ...dto };
      jest.spyOn(prisma.app, 'findUnique').mockResolvedValue(mockApp as unknown as App);
      jest.spyOn(prisma.appReview, 'create').mockResolvedValue(mockReview as unknown as AppReview);
      jest.spyOn(prisma.appReview, 'aggregate').mockResolvedValue({
        _avg: { rating: 4.5 },
        _count: { rating: 2 },
      } as any);
      jest.spyOn(prisma.app, 'update').mockResolvedValue({} as unknown as App);

      const result = await service.createReview('test', 'user-1', dto);

      expect(prisma.appReview.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ appId: 'a1', userId: 'user-1', ...dto }),
        }),
      );
      expect(prisma.app.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'a1' },
          data: { ratingAvg: 4.5, ratingCount: 2 },
        }),
      );
      expect(result).toEqual(mockReview);
    });

    it('should fallback to zero when aggregate returns null values', async () => {
      const mockApp = { id: 'a1', slug: 'test' };
      const dto: CreateReviewDto = { rating: 5, content: 'Great!' };
      jest.spyOn(prisma.app, 'findUnique').mockResolvedValue(mockApp as unknown as App);
      jest.spyOn(prisma.appReview, 'create').mockResolvedValue({ id: 'r1' } as unknown as AppReview);
      jest.spyOn(prisma.appReview, 'aggregate').mockResolvedValue({
        _avg: { rating: null },
        _count: { rating: 0 },
      } as any);
      jest.spyOn(prisma.app, 'update').mockResolvedValue({} as unknown as App);

      await service.createReview('test', 'user-1', dto);

      expect(prisma.app.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'a1' },
          data: { ratingAvg: 0, ratingCount: 0 },
        }),
      );
    });

    it('should throw NotFoundException when app not found', async () => {
      jest.spyOn(prisma.app, 'findUnique').mockResolvedValue(null);

      await expect(service.createReview('not-found', 'user-1', { rating: 5, content: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('installApp', () => {
    it('should create trial subscription and increment install count', async () => {
      const mockApp = { id: 'a1', slug: 'test', pricingModel: PricingModel.SUBSCRIPTION };
      jest.spyOn(prisma.app, 'findUnique').mockResolvedValue(mockApp as unknown as App);
      jest.spyOn(prisma.subscription, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.subscription, 'create').mockResolvedValue({ id: 's1' } as unknown as Subscription);
      jest.spyOn(prisma.app, 'update').mockResolvedValue({} as unknown as App);

      const result = await service.installApp('test', 'ws-1', 'user-1');

      expect(prisma.subscription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            appId: 'a1',
            workspaceId: 'ws-1',
            status: SubscriptionStatus.TRIAL,
            amount: 0,
          }),
        }),
      );
      expect(prisma.app.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'a1' },
          data: { installCount: { increment: 1 } },
        }),
      );
      expect(result.id).toBe('s1');
    });

    it('should throw NotFoundException when app not found', async () => {
      jest.spyOn(prisma.app, 'findUnique').mockResolvedValue(null);

      await expect(service.installApp('not-found', 'ws-1', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when already installed', async () => {
      const mockApp = { id: 'a1', slug: 'test' };
      jest.spyOn(prisma.app, 'findUnique').mockResolvedValue(mockApp as unknown as App);
      jest.spyOn(prisma.subscription, 'findFirst').mockResolvedValue({ id: 's1' } as unknown as Subscription);

      await expect(service.installApp('test', 'ws-1', 'user-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('getWorkspaceApps', () => {
    it('should return installed apps for a workspace', async () => {
      const expected = [{ id: 's1', app: { id: 'a1', name: 'Test' } }];
      jest.spyOn(prisma.subscription, 'findMany').mockResolvedValue(expected as unknown as Subscription[]);

      const result = await service.getWorkspaceApps('ws-1');

      expect(prisma.subscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { workspaceId: 'ws-1' },
          include: { app: { include: { category: true, vendor: true } } },
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(result).toEqual(expected);
    });
  });

  describe('getWorkspaceSubscriptions', () => {
    it('should return subscriptions for a workspace', async () => {
      const expected = [{ id: 's1', app: { id: 'a1' } }];
      jest.spyOn(prisma.subscription, 'findMany').mockResolvedValue(expected as unknown as Subscription[]);

      const result = await service.getWorkspaceSubscriptions('ws-1');

      expect(prisma.subscription.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { workspaceId: 'ws-1' },
          include: { app: true },
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(result).toEqual(expected);
    });
  });

  describe('findAllAppsForAdmin', () => {
    it('should return paginated apps with status and category filters', async () => {
      const mockApps = [{ id: 'a1', name: 'Test' }];
      jest.spyOn(prisma.app, 'findMany').mockResolvedValue(mockApps as unknown as App[]);
      jest.spyOn(prisma.app, 'count').mockResolvedValue(1);

      const result = await service.findAllAppsForAdmin({ status: AppStatus.PUBLISHED, category: 'hr' });

      expect(prisma.app.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            status: AppStatus.PUBLISHED,
            category: { slug: 'hr' },
          }),
        }),
      );
      expect(result.meta.total).toBe(1);
    });

    it('should filter by status only', async () => {
      jest.spyOn(prisma.app, 'findMany').mockResolvedValue([] as unknown as App[]);
      jest.spyOn(prisma.app, 'count').mockResolvedValue(0);

      await service.findAllAppsForAdmin({ status: AppStatus.DRAFT });

      expect(prisma.app.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: AppStatus.DRAFT }),
        }),
      );
    });

    it('should filter by category only', async () => {
      jest.spyOn(prisma.app, 'findMany').mockResolvedValue([] as unknown as App[]);
      jest.spyOn(prisma.app, 'count').mockResolvedValue(0);

      await service.findAllAppsForAdmin({ category: 'hr' });

      expect(prisma.app.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: { slug: 'hr' } }),
        }),
      );
    });

    it('should use default pagination when filters are absent', async () => {
      jest.spyOn(prisma.app, 'findMany').mockResolvedValue([] as unknown as App[]);
      jest.spyOn(prisma.app, 'count').mockResolvedValue(0);

      await service.findAllAppsForAdmin({});

      expect(prisma.app.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });
  });

  describe('updateAppStatus', () => {
    it('should update app status', async () => {
      const expected = { id: 'a1', status: AppStatus.PUBLISHED };
      jest.spyOn(prisma.app, 'update').mockResolvedValue(expected as unknown as App);

      const result = await service.updateAppStatus('a1', AppStatus.PUBLISHED);

      expect(prisma.app.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'a1' }, data: { status: AppStatus.PUBLISHED } }),
      );
      expect(result).toEqual(expected);
    });
  });

  describe('featureApp', () => {
    it('should update featured with sort order', async () => {
      const expected = { id: 'a1', featured: true, featuredSortOrder: 1 };
      jest.spyOn(prisma.app, 'update').mockResolvedValue(expected as unknown as App);

      const result = await service.featureApp('a1', true, 1);

      expect(prisma.app.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'a1' },
          data: { featured: true, featuredSortOrder: 1 },
        }),
      );
      expect(result).toEqual(expected);
    });

    it('should update featured without sort order', async () => {
      const expected = { id: 'a1', featured: false };
      jest.spyOn(prisma.app, 'update').mockResolvedValue(expected as unknown as App);

      const result = await service.featureApp('a1', false);

      expect(prisma.app.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'a1' },
          data: { featured: false, featuredSortOrder: undefined },
        }),
      );
      expect(result).toEqual(expected);
    });
  });

  describe('findAllVendors', () => {
    it('should return paginated vendors', async () => {
      const mockVendors = [{ id: 'v1', name: 'Vendor' }];
      jest.spyOn(prisma.appVendor, 'findMany').mockResolvedValue(mockVendors as unknown as AppVendor[]);
      jest.spyOn(prisma.appVendor, 'count').mockResolvedValue(1);

      const result = await service.findAllVendors({ page: 1, pageSize: 20 });

      expect(result.data).toEqual(mockVendors);
      expect(result.meta.total).toBe(1);
    });

    it('should use default pagination', async () => {
      jest.spyOn(prisma.appVendor, 'findMany').mockResolvedValue([] as unknown as AppVendor[]);
      jest.spyOn(prisma.appVendor, 'count').mockResolvedValue(0);

      await service.findAllVendors({});

      expect(prisma.appVendor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });
  });

  describe('createVendor', () => {
    it('should create a vendor', async () => {
      const dto: CreateVendorDto = {
        name: 'Vendor',
        slug: 'vendor',
        contactEmail: 'vendor@example.com',
      };
      const expected = { id: 'v1', ...dto };
      jest.spyOn(prisma.appVendor, 'create').mockResolvedValue(expected as unknown as AppVendor);

      const result = await service.createVendor(dto);

      expect(prisma.appVendor.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(expected);
    });
  });

  describe('updateVendor', () => {
    it('should update a vendor', async () => {
      const data: UpdateVendorDto = { name: 'Updated Vendor' };
      const expected = { id: 'v1', name: 'Updated Vendor' };
      jest.spyOn(prisma.appVendor, 'update').mockResolvedValue(expected as unknown as AppVendor);

      const result = await service.updateVendor('v1', data);

      expect(prisma.appVendor.update).toHaveBeenCalledWith({ where: { id: 'v1' }, data });
      expect(result).toEqual(expected);
    });
  });

  describe('deleteVendor', () => {
    it('should delete a vendor', async () => {
      const expected = { id: 'v1' };
      jest.spyOn(prisma.appVendor, 'delete').mockResolvedValue(expected as unknown as AppVendor);

      const result = await service.deleteVendor('v1');

      expect(prisma.appVendor.delete).toHaveBeenCalledWith({ where: { id: 'v1' } });
      expect(result).toEqual(expected);
    });
  });

  describe('findAllCategoriesForAdmin', () => {
    it('should return paginated categories', async () => {
      const mockCats = [{ id: 'c1', name: 'HR' }];
      jest.spyOn(prisma.appCategory, 'findMany').mockResolvedValue(mockCats as unknown as AppCategory[]);
      jest.spyOn(prisma.appCategory, 'count').mockResolvedValue(1);

      const result = await service.findAllCategoriesForAdmin({ page: 1, pageSize: 20 });

      expect(result.data).toEqual(mockCats);
      expect(result.meta.total).toBe(1);
    });

    it('should use default pagination', async () => {
      jest.spyOn(prisma.appCategory, 'findMany').mockResolvedValue([] as unknown as AppCategory[]);
      jest.spyOn(prisma.appCategory, 'count').mockResolvedValue(0);

      await service.findAllCategoriesForAdmin({});

      expect(prisma.appCategory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const dto: CreateCategoryDto = { name: 'HR', slug: 'hr', sortOrder: 1 };
      const expected = { id: 'c1', ...dto };
      jest.spyOn(prisma.appCategory, 'create').mockResolvedValue(expected as unknown as AppCategory);

      const result = await service.createCategory(dto);

      expect(prisma.appCategory.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(expected);
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const data: UpdateCategoryDto = { name: 'Updated HR' };
      const expected = { id: 'c1', name: 'Updated HR' };
      jest.spyOn(prisma.appCategory, 'update').mockResolvedValue(expected as unknown as AppCategory);

      const result = await service.updateCategory('c1', data);

      expect(prisma.appCategory.update).toHaveBeenCalledWith({ where: { id: 'c1' }, data });
      expect(result).toEqual(expected);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      const expected = { id: 'c1' };
      jest.spyOn(prisma.appCategory, 'delete').mockResolvedValue(expected as unknown as AppCategory);

      const result = await service.deleteCategory('c1');

      expect(prisma.appCategory.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
      expect(result).toEqual(expected);
    });
  });
});
