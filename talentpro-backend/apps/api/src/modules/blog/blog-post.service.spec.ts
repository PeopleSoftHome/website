import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PostStatus, BlogPost, Comment } from '@prisma/client';
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

  describe('findAllCategories', () => {
    it('should return categories with post counts', async () => {
      const mockCategories = {
        data: [{ id: 'c1', name: 'Tech', slug: 'tech', _count: { posts: 5 } }],
        meta: { page: 1, pageSize: 100, total: 1, totalPages: 1 },
      };
      jest.spyOn(prisma.blogCategory, 'findMany').mockResolvedValue(mockCategories.data as any);
      jest.spyOn(prisma.blogCategory, 'count').mockResolvedValue(1);

      const result = await service.findAllCategories();

      expect(prisma.blogCategory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { sortOrder: 'asc' },
          include: { _count: { select: { posts: true } } },
          take: 100,
        }),
      );
      expect(result).toEqual(mockCategories);
    });
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const dto = { name: 'Tech', slug: 'tech', description: 'Tech posts' };
      const mockCategory = { id: 'c1', ...dto, sortOrder: 1 };
      jest.spyOn(prisma.blogCategory, 'create').mockResolvedValue(mockCategory as any);

      const result = await service.createCategory(dto);

      expect(prisma.blogCategory.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const dto = { name: 'Updated Tech', sortOrder: 2 };
      const mockCategory = { id: 'c1', ...dto, slug: 'tech', description: null };
      jest.spyOn(prisma.blogCategory, 'update').mockResolvedValue(mockCategory as any);

      const result = await service.updateCategory('c1', dto);

      expect(prisma.blogCategory.update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: dto });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      jest.spyOn(prisma.blogCategory, 'delete').mockResolvedValue({ id: 'c1', name: 'Tech', slug: 'tech', description: null, sortOrder: 1 } as any);

      const result = await service.deleteCategory('c1');

      expect(prisma.blogCategory.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
      expect(result).toEqual({ message: 'Deleted successfully' });
    });
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
      jest.spyOn(prisma.blogPost, 'findMany').mockResolvedValue(mockPosts as unknown as BlogPost[]);
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
      jest.spyOn(prisma.blogPost, 'findMany').mockResolvedValue(mockPosts as unknown as BlogPost[]);
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

    it('should filter by status when provided', async () => {
      const mockPosts = [
        {
          id: 'p1',
          title: 'Draft Post',
          slug: 'draft-post',
          status: PostStatus.DRAFT,
          category: { id: 'c1', name: 'Tech' },
          author: { id: 'u1', name: 'Alice', avatar: null },
          tags: [],
        },
      ];
      jest.spyOn(prisma.blogPost, 'findMany').mockResolvedValue(mockPosts as unknown as BlogPost[]);
      jest.spyOn(prisma.blogPost, 'count').mockResolvedValue(1);

      const result = await service.findAllPosts(1, 20, undefined, PostStatus.DRAFT);

      expect(prisma.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: PostStatus.DRAFT }),
        }),
      );
      expect(result.data).toEqual(mockPosts);
    });

    it('should use default pagination when no params provided', async () => {
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
      jest.spyOn(prisma.blogPost, 'findMany').mockResolvedValue(mockPosts as unknown as BlogPost[]);
      jest.spyOn(prisma.blogPost, 'count').mockResolvedValue(1);

      const result = await service.findAllPosts();

      expect(prisma.blogPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          where: expect.objectContaining({ status: 'PUBLISHED' }),
        }),
      );
      expect(result.meta).toEqual({ page: 1, pageSize: 20, total: 1, totalPages: 1 });
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
      jest.spyOn(prisma.blogPost, 'findFirst').mockResolvedValue(mockPost as unknown as BlogPost);
      jest.spyOn(prisma.blogPost, 'update').mockResolvedValue({ ...mockPost, viewCount: 11 } as unknown as BlogPost);
      jest.spyOn(prisma.comment, 'findMany').mockResolvedValue(mockComments as unknown as Comment[]);

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
      await expect(service.findPostBySlug('not-found')).rejects.toThrow('Post not found');
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
      jest.spyOn(prisma.blogPost, 'create').mockResolvedValue(mockPost as unknown as BlogPost);

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
      jest.spyOn(prisma.blogPost, 'create').mockResolvedValue(mockPost as unknown as BlogPost);

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

    it('should create a post with workspaceId', async () => {
      const dto = {
        title: 'Workspace Post',
        slug: 'workspace-post',
        content: 'Content',
        authorId: 'u1',
        categoryId: 'c1',
        workspaceId: 'w1',
      };
      const mockPost = {
        id: 'p3',
        ...dto,
        status: PostStatus.DRAFT,
        category: { id: 'c1', name: 'Tech' },
        tags: [],
      };
      jest.spyOn(prisma.blogPost, 'create').mockResolvedValue(mockPost as unknown as BlogPost);

      const result = await service.createPost(dto);

      expect(prisma.blogPost.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            workspaceId: 'w1',
          }),
          include: { category: true, tags: true },
        }),
      );
      expect(result).toEqual(mockPost);
    });
  });

  describe('updatePost', () => {
    it('should update a post without workspaceId', async () => {
      const dto = { title: 'Updated Title', tagIds: ['t1'] };
      const mockPost = {
        id: 'p1',
        ...dto,
        slug: 'updated-title',
        category: { id: 'c1', name: 'Tech' },
        tags: [{ id: 't1', name: 'Vue' }],
      };
      jest.spyOn(prisma.blogPost, 'update').mockResolvedValue(mockPost as unknown as BlogPost);

      const result = await service.updatePost('p1', dto);

      expect(prisma.blogPost.findFirst).not.toHaveBeenCalled();
      expect(prisma.blogPost.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'p1' },
          data: expect.objectContaining({
            title: dto.title,
            tags: { set: [{ id: 't1' }] },
          }),
          include: { category: true, tags: true },
        }),
      );
      expect(result).toEqual(mockPost);
    });

    it('should update a post with workspaceId when it exists', async () => {
      const dto = { title: 'Updated Title' };
      const mockPost = {
        id: 'p1',
        ...dto,
        slug: 'updated-title',
        category: { id: 'c1', name: 'Tech' },
        tags: [],
      };
      jest.spyOn(prisma.blogPost, 'findFirst').mockResolvedValue({ id: 'p1' } as BlogPost);
      jest.spyOn(prisma.blogPost, 'update').mockResolvedValue(mockPost as unknown as BlogPost);

      const result = await service.updatePost('p1', dto, 'w1');

      expect(prisma.blogPost.findFirst).toHaveBeenCalledWith({ where: { id: 'p1', workspaceId: 'w1' } });
      expect(prisma.blogPost.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'p1' },
          data: expect.objectContaining({ title: dto.title }),
        }),
      );
      expect(result).toEqual(mockPost);
    });

    it('should throw NotFoundException when workspace post not found', async () => {
      jest.spyOn(prisma.blogPost, 'findFirst').mockResolvedValue(null);

      await expect(service.updatePost('p1', { title: 'X' }, 'w1')).rejects.toThrow(NotFoundException);
      await expect(service.updatePost('p1', { title: 'X' }, 'w1')).rejects.toThrow('Post not found or no access');
    });
  });

  describe('deletePost', () => {
    it('should delete a post without workspaceId', async () => {
      jest.spyOn(prisma.blogPost, 'delete').mockResolvedValue({ id: 'p1' } as BlogPost);

      const result = await service.deletePost('p1');

      expect(prisma.blogPost.findFirst).not.toHaveBeenCalled();
      expect(prisma.blogPost.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
      expect(result).toEqual({ message: 'Deleted successfully' });
    });

    it('should delete a post with workspaceId when it exists', async () => {
      jest.spyOn(prisma.blogPost, 'findFirst').mockResolvedValue({ id: 'p1' } as BlogPost);
      jest.spyOn(prisma.blogPost, 'delete').mockResolvedValue({ id: 'p1' } as BlogPost);

      const result = await service.deletePost('p1', 'w1');

      expect(prisma.blogPost.findFirst).toHaveBeenCalledWith({ where: { id: 'p1', workspaceId: 'w1' } });
      expect(prisma.blogPost.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
      expect(result).toEqual({ message: 'Deleted successfully' });
    });

    it('should throw NotFoundException when workspace post not found', async () => {
      jest.spyOn(prisma.blogPost, 'findFirst').mockResolvedValue(null);

      await expect(service.deletePost('p1', 'w1')).rejects.toThrow(NotFoundException);
      await expect(service.deletePost('p1', 'w1')).rejects.toThrow('Post not found or no access');
    });
  });

  describe('findAllTags', () => {
    it('should return tags with post counts', async () => {
      const mockTags = {
        data: [{ id: 't1', name: 'Vue', slug: 'vue', _count: { posts: 3 } }],
        meta: { page: 1, pageSize: 100, total: 1, totalPages: 1 },
      };
      jest.spyOn(prisma.tag, 'findMany').mockResolvedValue(mockTags.data as any);
      jest.spyOn(prisma.tag, 'count').mockResolvedValue(1);

      const result = await service.findAllTags();

      expect(prisma.tag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
          include: { _count: { select: { posts: true } } },
          take: 100,
        }),
      );
      expect(result).toEqual(mockTags);
    });
  });

  describe('createTag', () => {
    it('should create a tag', async () => {
      const dto = { name: 'Vue', slug: 'vue' };
      const mockTag = { id: 't1', ...dto };
      jest.spyOn(prisma.tag, 'create').mockResolvedValue(mockTag);

      const result = await service.createTag(dto);

      expect(prisma.tag.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(mockTag);
    });
  });

  describe('deleteTag', () => {
    it('should delete a tag', async () => {
      jest.spyOn(prisma.tag, 'delete').mockResolvedValue({ id: 't1', name: 'Vue', slug: 'vue' } as any);

      const result = await service.deleteTag('t1');

      expect(prisma.tag.delete).toHaveBeenCalledWith({ where: { id: 't1' } });
      expect(result).toEqual({ message: 'Deleted successfully' });
    });
  });
});
