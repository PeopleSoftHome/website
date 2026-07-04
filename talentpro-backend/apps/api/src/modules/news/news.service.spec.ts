import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PostStatus } from '@prisma/client';
import { NewsService } from './news.service';
import { NewsRepository } from './news.repository';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('NewsService', () => {
  let service: NewsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        NewsRepository,
        {
          provide: PrismaService,
          useValue: {
            news: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              findUnique: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
              groupBy: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated published news', async () => {
      const mockNews = [{ id: 'n1', slug: 'news-a', title: 'News A', status: PostStatus.PUBLISHED, category: 'company' }];
      jest.spyOn(prisma.news, 'findMany').mockResolvedValue(mockNews as unknown as import('@prisma/client').News[]);
      jest.spyOn(prisma.news, 'count').mockResolvedValue(1);

      const result = await service.findAll();

      expect(prisma.news.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: PostStatus.PUBLISHED }),
          skip: 0,
          take: 20,
          orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
        }),
      );
      expect(result.data).toEqual(mockNews);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by category', async () => {
      const mockNews = [{ id: 'n1', slug: 'news-a', title: 'News A', status: PostStatus.PUBLISHED, category: 'product' }];
      jest.spyOn(prisma.news, 'findMany').mockResolvedValue(mockNews as unknown as import('@prisma/client').News[]);
      jest.spyOn(prisma.news, 'count').mockResolvedValue(1);

      const result = await service.findAll('product', 2, 10);

      expect(prisma.news.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: PostStatus.PUBLISHED, category: 'product' }),
          skip: 10,
          take: 10,
        }),
      );
      expect(result.meta.page).toBe(2);
    });
  });

  describe('findBySlug', () => {
    it('should return news and increment viewCount when found', async () => {
      const mockNewsItem = { id: 'n1', slug: 'news-a', title: 'News A', status: PostStatus.PUBLISHED, viewCount: 5 };
      jest.spyOn(prisma.news, 'findFirst').mockResolvedValue(mockNewsItem as unknown as import('@prisma/client').News);
      jest.spyOn(prisma.news, 'update').mockResolvedValue({ ...mockNewsItem, viewCount: 6 } as unknown as import('@prisma/client').News);

      const result = await service.findBySlug('news-a');

      expect(prisma.news.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'news-a', status: PostStatus.PUBLISHED },
        }),
      );
      expect(prisma.news.update).toHaveBeenCalledWith({
        where: { id: 'n1' },
        data: { viewCount: { increment: 1 } },
      });
      expect(result).toEqual(mockNewsItem);
    });

    it('should throw NotFoundException when news not found', async () => {
      jest.spyOn(prisma.news, 'findFirst').mockResolvedValue(null);

      await expect(service.findBySlug('not-found')).rejects.toThrow(NotFoundException);
      await expect(service.findBySlug('not-found')).rejects.toThrow('News not found');
    });
  });

  describe('findCategories', () => {
    it('should return category counts', async () => {
      const mockGroups = [
        { category: 'company', _count: { category: 4 } },
        { category: 'product', _count: { category: 2 } },
      ];
      jest.spyOn(prisma.news, 'groupBy').mockResolvedValue(mockGroups as never);

      const result = await service.findCategories();

      expect(prisma.news.groupBy).toHaveBeenCalledWith({
        by: ['category'],
        where: { status: PostStatus.PUBLISHED },
        _count: { category: true },
      });
      expect(result).toEqual([
        { name: 'company', count: 4 },
        { name: 'product', count: 2 },
      ]);
    });
  });
});
