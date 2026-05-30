import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostStatus } from '@prisma/client';
import { BlogPostService } from './blog-post.service';
import { BlogCategoryRepository } from './blog-category.repository';
import { BlogTagRepository } from './blog-tag.repository';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('BlogPostService', () => {
  let service: BlogPostService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogPostService,
        BlogCategoryRepository,
        BlogTagRepository,
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
        {
          provide: PrismaService,
          useValue: {
            blogPost: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            blogCategory: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            tag: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            comment: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<BlogPostService>(BlogPostService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllPosts', () => {
    it('should return paginated published posts', async () => {
      const mockPosts = [
        {
          id: 'p1',
          title: 'Hello World',
          slug: 'hello-world',
          status: PostStatus.PUBLISHED,
          category: { id: 'c1', name: 'Tech' },
          author: { id: 'u1', name: 'Alice', avatar: null },
          tags: [],
        },
      ];
      jest.spyOn(prisma.blogPost, 'findMany').mockResolvedValue(mockPosts as any);
      jest.spyOn(prisma.blogPost, 'count').mockResolvedValue(1);

      const result = await service.findAllPosts(1, 20);

      expect(prisma.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PUBLISHED' }),
          skip: 0,
          take: 20,
          orderBy: { publishedAt: 'desc' },
        }),
      );
      expect(result.data).toEqual(mockPosts);
      expect(result.meta).toEqual({ page: 1, pageSize: 20, total: 1, totalPages: 1 });
    });

    it('should filter by categorySlug when provided', async () => {
      const mockPosts = [
        {
          id: 'p1',
          title: 'Vue 3 Tips',
          slug: 'vue-3-tips',
          status: PostStatus.PUBLISHED,
          category: { id: 'c1', name: 'Frontend', slug: 'frontend' },
          author: { id: 'u1', name: 'Alice', avatar: null },
          tags: [],
        },
      ];
      jest.spyOn(prisma.blogPost, 'findMany').mockResolvedValue(mockPosts as any);
      jest.spyOn(prisma.blogPost, 'count').mockResolvedValue(1);

      const result = await service.findAllPosts(1, 20, 'frontend');

      expect(prisma.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PUBLISHED',
            category: { slug: 'frontend' },
          }),
        }),
      );
      expect(result.data).toEqual(mockPosts);
    });
  });

  describe('findPostBySlug', () => {
    it('should return post with comments when found', async () => {
      const mockPost = {
        id: 'p1',
        title: 'Hello World',
        slug: 'hello-world',
        status: PostStatus.PUBLISHED,
        category: { id: 'c1', name: 'Tech' },
        author: { id: 'u1', name: 'Alice', avatar: null },
        tags: [],
        viewCount: 10,
      };
      const mockComments = [
        {
          id: 'cm1',
          content: 'Nice post',
          author: { id: 'u2', name: 'Bob', avatar: null },
          replies: [],
        },
      ];
      jest.spyOn(prisma.blogPost, 'findFirst').mockResolvedValue(mockPost as any);
      jest.spyOn(prisma.blogPost, 'update').mockResolvedValue({ ...mockPost, viewCount: 11 } as any);
      jest.spyOn(prisma.comment, 'findMany').mockResolvedValue(mockComments as any);

      const result = await service.findPostBySlug('hello-world');

      expect(prisma.blogPost.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { slug: 'hello-world', status: 'PUBLISHED' },
        }),
      );
      expect(prisma.blogPost.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'p1' },
          data: { viewCount: { increment: 1 } },
        }),
      );
      expect(result).toEqual(expect.objectContaining({ ...mockPost, comments: mockComments }));
    });

    it('should throw NotFoundException when post not found', async () => {
      jest.spyOn(prisma.blogPost, 'findFirst').mockResolvedValue(null);

      await expect(service.findPostBySlug('not-found')).rejects.toThrow(NotFoundException);
      await expect(service.findPostBySlug('not-found')).rejects.toThrow('文章不存在');
    });
  });

  describe('createPost', () => {
    it('should create a post with tags connected', async () => {
      const dto = {
        title: 'New Post',
        slug: 'new-post',
        excerpt: 'Summary',
        content: 'Content body',
        coverImage: 'https://cdn.example.com/img.png',
        authorId: 'u1',
        categoryId: 'c1',
        tagIds: ['t1', 't2'],
        status: PostStatus.PUBLISHED,
      };
      const mockPost = {
        id: 'p1',
        ...dto,
        category: { id: 'c1', name: 'Tech' },
        tags: [{ id: 't1', name: 'Vue' }, { id: 't2', name: 'NestJS' }],
      };
      jest.spyOn(prisma.blogPost, 'create').mockResolvedValue(mockPost as any);

      const result = await service.createPost(dto);

      expect(prisma.blogPost.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: dto.title,
            slug: dto.slug,
            status: PostStatus.PUBLISHED,
            tags: { connect: [{ id: 't1' }, { id: 't2' }] },
          }),
          include: { category: true, tags: true },
        }),
      );
      expect(result).toEqual(mockPost);
    });

    it('should create a draft post without tags when tagIds not provided', async () => {
      const dto = {
        title: 'Draft Post',
        slug: 'draft-post',
        content: 'Draft content',
        authorId: 'u1',
        categoryId: 'c1',
      };
      const mockPost = {
        id: 'p2',
        ...dto,
        status: PostStatus.DRAFT,
        category: { id: 'c1', name: 'Tech' },
        tags: [],
      };
      jest.spyOn(prisma.blogPost, 'create').mockResolvedValue(mockPost as any);

      const result = await service.createPost(dto);

      expect(prisma.blogPost.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: PostStatus.DRAFT,
            tags: undefined,
          }),
          include: { category: true, tags: true },
        }),
      );
      expect(result).toEqual(mockPost);
    });
  });
});
