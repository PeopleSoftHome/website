import { Test, TestingModule } from '@nestjs/testing';
import { SearchPrismaService } from './search-prisma.service';
import { PrismaService } from '@shared/prisma/prisma.service';
import { PostStatus } from '@prisma/client';

describe('SearchPrismaService', () => {
  let service: SearchPrismaService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchPrismaService,
        {
          provide: PrismaService,
          useValue: {
            blogPost: { findMany: jest.fn() },
            product: { findMany: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<SearchPrismaService>(SearchPrismaService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should search posts', async () => {
      const posts = [
        {
          id: 'b1',
          title: 'Post',
          excerpt: 'Excerpt',
          slug: 'post-slug',
          publishedAt: new Date('2024-01-01'),
          category: { name: 'Tech' },
        },
      ];
      jest.spyOn(prisma.blogPost, 'findMany').mockResolvedValue(posts as any);

      const result = await service.search('query', 'post', 5);

      expect(prisma.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: PostStatus.PUBLISHED }),
          take: 5,
          include: { category: true },
        }),
      );
      expect(result[0]).toMatchObject({
        type: 'post',
        title: 'Post',
        url: '/blog/post-slug',
      });
    });

    it('should search products', async () => {
      const products = [
        {
          id: 'p1',
          name: 'Product',
          tagline: 'Tagline',
          slug: 'product-slug',
          tab: { label: 'Tab' },
        },
      ];
      jest.spyOn(prisma.product, 'findMany').mockResolvedValue(products as any);

      const result = await service.search('query', 'product', 5);

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isPublished: true }),
          take: 5,
          include: { tab: true },
        }),
      );
      expect(result[0]).toMatchObject({
        type: 'product',
        title: 'Product',
        url: '/products/product-slug',
      });
    });

    it('should search both types and slice by limit', async () => {
      const posts = Array.from({ length: 3 }, (_, i) => ({
        id: `b${i}`,
        title: `Post ${i}`,
        excerpt: '',
        slug: `slug-${i}`,
        publishedAt: new Date(),
        category: null,
      }));
      const products = Array.from({ length: 3 }, (_, i) => ({
        id: `p${i}`,
        name: `Product ${i}`,
        tagline: '',
        slug: `p-slug-${i}`,
        tab: null,
      }));
      jest.spyOn(prisma.blogPost, 'findMany').mockResolvedValue(posts as any);
      jest.spyOn(prisma.product, 'findMany').mockResolvedValue(products as any);

      const result = await service.search('query', undefined, 5);

      expect(result).toHaveLength(5);
    });
  });

  describe('getSuggestions', () => {
    it('should return post titles', async () => {
      jest
        .spyOn(prisma.blogPost, 'findMany')
        .mockResolvedValue([{ title: 'Alpha' }, { title: 'Beta' }] as any);

      const result = await service.getSuggestions('a', 5);

      expect(prisma.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: PostStatus.PUBLISHED }),
          take: 5,
          select: { title: true },
        }),
      );
      expect(result).toEqual(['Alpha', 'Beta']);
    });
  });
});
