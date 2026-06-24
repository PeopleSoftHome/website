import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { AppStatus, PricingModel, SubscriptionStatus, App, AppCategory, Subscription } from '@prisma/client';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceRepository } from './marketplace.repository';
import { PrismaService } from '@/common/prisma/prisma.service';

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

    it('should throw ConflictException when already installed', async () => {
      const mockApp = { id: 'a1', slug: 'test' };
      jest.spyOn(prisma.app, 'findUnique').mockResolvedValue(mockApp as unknown as App);
      jest.spyOn(prisma.subscription, 'findFirst').mockResolvedValue({ id: 's1' } as unknown as Subscription);

      await expect(service.installApp('test', 'ws-1', 'user-1')).rejects.toThrow(ConflictException);
    });
  });
});
