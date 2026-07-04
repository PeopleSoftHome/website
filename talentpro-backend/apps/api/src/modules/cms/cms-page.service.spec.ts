import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CmsPageService } from './cms-page.service';
import { CmsContentRepository } from './cms-content.repository';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('CmsPageService', () => {
  let service: CmsPageService;
  let prisma: PrismaService;
  let cmsRepo: CmsContentRepository;

  const createRepoMock = () => ({
    findAll: jest.fn(),
    findBySlug: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  });

  const repoMockMap: Record<string, ReturnType<typeof createRepoMock>> = {
    page: createRepoMock(),
    section: createRepoMock(),
  };

  beforeEach(async () => {
    Object.values(repoMockMap).forEach((repo) => {
      repo.findAll.mockReset();
      repo.findBySlug.mockReset();
      repo.create.mockReset();
      repo.update.mockReset();
      repo.delete.mockReset();
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CmsPageService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            navigation: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
            },
            navItem: {
              deleteMany: jest.fn(),
              create: jest.fn(),
            },
            translation: {
              findMany: jest.fn(),
              upsert: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            section: {
              update: jest.fn(),
            },
          },
        },
        {
          provide: CmsContentRepository,
          useValue: {
            forModel: jest.fn().mockImplementation((modelName: string) => repoMockMap[modelName]),
          },
        },
      ],
    }).compile();

    service = module.get<CmsPageService>(CmsPageService);
    prisma = module.get<PrismaService>(PrismaService);
    cmsRepo = module.get<CmsContentRepository>(CmsContentRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Page', () => {
    it('findAllPages should call page repository with defaults', async () => {
      const result = { data: [], meta: { total: 0 } };
      repoMockMap.page.findAll.mockResolvedValue(result);

      await expect(service.findAllPages()).resolves.toEqual(result);
      expect(cmsRepo.forModel).toHaveBeenCalledWith('page');
      expect(repoMockMap.page.findAll).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('findPageBySlug should return page with sections', async () => {
      const page = { id: 'p1', slug: 'home' };
      repoMockMap.page.findBySlug.mockResolvedValue(page);

      const result = await service.findPageBySlug('home');

      expect(repoMockMap.page.findBySlug).toHaveBeenCalledWith('home', {
        sections: { orderBy: { sortOrder: 'asc' } },
      });
      expect(result).toEqual(page);
    });

    it('findPageBySlug should throw NotFoundException when page not found', async () => {
      repoMockMap.page.findBySlug.mockResolvedValue(null);

      await expect(service.findPageBySlug('missing')).rejects.toThrow(NotFoundException);
    });

    it('createPage should create with page repository', async () => {
      const dto = { slug: 'home', title: 'Home' };
      const created = { id: 'p1', ...dto };
      repoMockMap.page.create.mockResolvedValue(created);

      const result = await service.createPage(dto);

      expect(repoMockMap.page.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });

    it('updatePage should update with page repository', async () => {
      const dto = { title: 'Updated' };
      const updated = { id: 'p1', ...dto };
      repoMockMap.page.update.mockResolvedValue(updated);

      const result = await service.updatePage('p1', dto);

      expect(repoMockMap.page.update).toHaveBeenCalledWith('p1', dto);
      expect(result).toEqual(updated);
    });

    it('deletePage should delete with page repository', async () => {
      repoMockMap.page.delete.mockResolvedValue({ message: 'Deleted successfully' });

      const result = await service.deletePage('p1');

      expect(repoMockMap.page.delete).toHaveBeenCalledWith('p1');
      expect(result).toEqual({ message: 'Deleted successfully' });
    });
  });

  describe('Section', () => {
    it('findSectionsByPage should filter by pageId', async () => {
      const result = { data: [], meta: { total: 0 } };
      repoMockMap.section.findAll.mockResolvedValue(result);

      await expect(service.findSectionsByPage('p1')).resolves.toEqual(result);
      expect(repoMockMap.section.findAll).toHaveBeenCalledWith({
        where: { pageId: 'p1' },
        orderBy: { sortOrder: 'asc' },
        pageSize: 100,
      });
    });

    it('createSection should apply defaults when optional fields omitted', async () => {
      const dto = { pageId: 'p1', type: 'hero' };
      const created = { id: 's1', ...dto, sortOrder: 0, config: {}, isActive: true };
      repoMockMap.section.create.mockResolvedValue(created);

      const result = await service.createSection(dto);

      expect(repoMockMap.section.create).toHaveBeenCalledWith({
        pageId: 'p1',
        type: 'hero',
        sortOrder: 0,
        config: {},
        isActive: true,
      });
      expect(result).toEqual(created);
    });

    it('createSection should preserve provided optional fields', async () => {
      const dto = { pageId: 'p1', type: 'hero', sortOrder: 5, config: { title: 'T' }, isActive: false };
      const created = { id: 's1', ...dto };
      repoMockMap.section.create.mockResolvedValue(created);

      const result = await service.createSection(dto);

      expect(repoMockMap.section.create).toHaveBeenCalledWith({
        pageId: 'p1',
        type: 'hero',
        sortOrder: 5,
        config: { title: 'T' },
        isActive: false,
      });
      expect(result).toEqual(created);
    });

    it('updateSection should update with section repository', async () => {
      const dto = { type: 'features' };
      const updated = { id: 's1', ...dto };
      repoMockMap.section.update.mockResolvedValue(updated);

      const result = await service.updateSection('s1', dto);

      expect(repoMockMap.section.update).toHaveBeenCalledWith('s1', dto);
      expect(result).toEqual(updated);
    });

    it('deleteSection should delete with section repository', async () => {
      repoMockMap.section.delete.mockResolvedValue({ message: 'Deleted successfully' });

      const result = await service.deleteSection('s1');

      expect(repoMockMap.section.delete).toHaveBeenCalledWith('s1');
      expect(result).toEqual({ message: 'Deleted successfully' });
    });

    it('batchUpdateSections should run transaction with section updates', async () => {
      const sections = [
        { id: 's1', sortOrder: 1, isActive: true },
        { id: 's2', sortOrder: 2, isActive: false },
      ];
      const transactionResult = [{ id: 's1' }, { id: 's2' }];
      (prisma.$transaction as jest.Mock).mockImplementation(async (ops: Promise<unknown>[]) => Promise.all(ops));
      (prisma.section.update as jest.Mock)
        .mockResolvedValueOnce(transactionResult[0])
        .mockResolvedValueOnce(transactionResult[1]);

      const result = await service.batchUpdateSections(sections);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(prisma.section.update).toHaveBeenCalledTimes(2);
      expect(prisma.section.update).toHaveBeenNthCalledWith(1, {
        where: { id: 's1' },
        data: { sortOrder: 1, isActive: true },
      });
      expect(prisma.section.update).toHaveBeenNthCalledWith(2, {
        where: { id: 's2' },
        data: { sortOrder: 2, isActive: false },
      });
      expect(result).toEqual([transactionResult[0], transactionResult[1]]);
    });
  });

  describe('Navigation', () => {
    it('findNavigation should include top-level items with children', async () => {
      const navigation = { id: 'n1', key: 'main', items: [] };
      (prisma.navigation.findUnique as jest.Mock).mockResolvedValue(navigation);

      const result = await service.findNavigation('main');

      expect(prisma.navigation.findUnique).toHaveBeenCalledWith({
        where: { key: 'main' },
        include: {
          items: {
            where: { parentId: null },
            include: { children: { orderBy: { sortOrder: 'asc' } } },
            orderBy: { sortOrder: 'asc' },
          },
        },
      });
      expect(result).toEqual(navigation);
    });

    it('upsertNavigation should replace items with defaults', async () => {
      const nav = { id: 'n1', key: 'main', label: 'Main' };
      const returnedNav = { id: 'n1', key: 'main', label: 'Main', items: [] };
      const tx = {
        navigation: {
          upsert: jest.fn().mockResolvedValue(nav),
          findUnique: jest.fn().mockResolvedValue(returnedNav),
        },
        navItem: {
          deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
          create: jest.fn().mockResolvedValue({}),
        },
      };
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) => callback(tx));

      const dto = {
        key: 'main',
        label: 'Main',
        items: [
          { label: 'Home', href: '/', sortOrder: 1, isExternal: true },
          { label: 'About', href: '/about' },
        ],
      };

      const result = await service.upsertNavigation(dto);

      expect(tx.navigation.upsert).toHaveBeenCalledWith({
        where: { key: 'main' },
        update: { label: 'Main' },
        create: { key: 'main', label: 'Main', location: 'header' },
      });
      expect(tx.navItem.deleteMany).toHaveBeenCalledWith({ where: { navigationId: 'n1' } });
      expect(tx.navItem.create).toHaveBeenCalledTimes(2);
      expect(tx.navItem.create).toHaveBeenNthCalledWith(1, {
        data: {
          navigationId: 'n1',
          label: 'Home',
          href: '/',
          icon: undefined,
          description: undefined,
          sortOrder: 1,
          isExternal: true,
        },
      });
      expect(tx.navItem.create).toHaveBeenNthCalledWith(2, {
        data: {
          navigationId: 'n1',
          label: 'About',
          href: '/about',
          icon: undefined,
          description: undefined,
          sortOrder: 0,
          isExternal: false,
        },
      });
      expect(result).toEqual(returnedNav);
    });

    it('upsertNavigation should use provided location', async () => {
      const nav = { id: 'n1', key: 'footer', label: 'Footer' };
      const tx = {
        navigation: {
          upsert: jest.fn().mockResolvedValue(nav),
          findUnique: jest.fn().mockResolvedValue(nav),
        },
        navItem: {
          deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
          create: jest.fn().mockResolvedValue({}),
        },
      };
      (prisma.$transaction as jest.Mock).mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) => callback(tx));

      await service.upsertNavigation({ key: 'footer', label: 'Footer', location: 'footer', items: [] });

      expect(tx.navigation.upsert).toHaveBeenCalledWith({
        where: { key: 'footer' },
        update: { label: 'Footer' },
        create: { key: 'footer', label: 'Footer', location: 'footer' },
      });
    });
  });

  describe('Translation', () => {
    it('findTranslations should return key-value map without context', async () => {
      const rows = [
        { id: '1', locale: 'zh', key: 'a', value: 'A' },
        { id: '2', locale: 'zh', key: 'b', value: 'B' },
      ];
      (prisma.translation.findMany as jest.Mock).mockResolvedValue(rows);

      const result = await service.findTranslations('zh');

      expect(prisma.translation.findMany).toHaveBeenCalledWith({ where: { locale: 'zh' } });
      expect(result).toEqual({ a: 'A', b: 'B' });
    });

    it('findTranslations should filter by context when provided', async () => {
      const rows = [{ id: '1', locale: 'zh', key: 'a', value: 'A', context: 'cms' }];
      (prisma.translation.findMany as jest.Mock).mockResolvedValue(rows);

      const result = await service.findTranslations('zh', 'cms');

      expect(prisma.translation.findMany).toHaveBeenCalledWith({ where: { locale: 'zh', context: 'cms' } });
      expect(result).toEqual({ a: 'A' });
    });

    it('upsertTranslation should upsert translation', async () => {
      const dto = { locale: 'zh', key: 'a', value: 'A', context: 'cms' };
      const upserted = { id: '1', ...dto };
      (prisma.translation.upsert as jest.Mock).mockResolvedValue(upserted);

      const result = await service.upsertTranslation(dto);

      expect(prisma.translation.upsert).toHaveBeenCalledWith({
        where: { locale_key: { locale: 'zh', key: 'a' } },
        update: { value: 'A', context: 'cms' },
        create: dto,
      });
      expect(result).toEqual(upserted);
    });

    it('findAllTranslations should use defaults and filters', async () => {
      const rows = [{ id: '1', locale: 'zh', key: 'a', value: 'A' }];
      (prisma.translation.findMany as jest.Mock).mockResolvedValue(rows);
      (prisma.translation.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAllTranslations(undefined, undefined, 'zh', 'cms');

      expect(prisma.translation.findMany).toHaveBeenCalledWith({
        where: { locale: 'zh', context: 'cms' },
        skip: 0,
        take: 20,
        orderBy: [{ locale: 'asc' }, { key: 'asc' }],
      });
      expect(result).toEqual({
        data: rows,
        meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      });
    });

    it('findAllTranslations should use provided pagination', async () => {
      const rows = [{ id: '1', locale: 'zh', key: 'a', value: 'A' }];
      (prisma.translation.findMany as jest.Mock).mockResolvedValue(rows);
      (prisma.translation.count as jest.Mock).mockResolvedValue(1);

      await service.findAllTranslations(2, 10);

      expect(prisma.translation.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 10,
        take: 10,
        orderBy: [{ locale: 'asc' }, { key: 'asc' }],
      });
    });

    it('updateTranslation should update translation', async () => {
      const dto = { value: 'B', context: 'cms' };
      const updated = { id: '1', ...dto };
      (prisma.translation.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.updateTranslation('1', dto);

      expect(prisma.translation.update).toHaveBeenCalledWith({ where: { id: '1' }, data: dto });
      expect(result).toEqual(updated);
    });

    it('deleteTranslation should delete and return message', async () => {
      (prisma.translation.delete as jest.Mock).mockResolvedValue(undefined);

      const result = await service.deleteTranslation('1');

      expect(prisma.translation.delete).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual({ message: 'Deleted successfully' });
    });
  });
});
