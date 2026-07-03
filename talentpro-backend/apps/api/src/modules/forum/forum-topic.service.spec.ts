import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ForumTopic } from '@prisma/client';
import { ForumTopicService } from './forum-topic.service';
import { ForumCategoryRepository } from './forum-category.repository';
import { ForumTopicRepository } from './forum-topic.repository';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('ForumTopicService', () => {
  let service: ForumTopicService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForumTopicService,
        ForumCategoryRepository,
        ForumTopicRepository,
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
        {
          provide: PrismaService,
          useValue: {
            forumTopic: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            forumCategory: {
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ForumTopicService>(ForumTopicService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllCategories', () => {
    it('should return categories with topic counts', async () => {
      const mockCategories = {
        data: [{ id: 'c1', name: 'General', slug: 'general', _count: { topics: 5 } }],
        meta: { page: 1, pageSize: 100, total: 1, totalPages: 1 },
      };
      jest.spyOn(prisma.forumCategory, 'findMany').mockResolvedValue(mockCategories.data as any);
      jest.spyOn(prisma.forumCategory, 'count').mockResolvedValue(1);

      const result = await service.findAllCategories();

      expect(prisma.forumCategory.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { sortOrder: 'asc' },
          include: { _count: { select: { topics: true } } },
          take: 100,
        }),
      );
      expect(result).toEqual(mockCategories);
    });
  });

  describe('createCategory', () => {
    it('should create a category', async () => {
      const dto = { name: 'General', description: 'General topics', sortOrder: 1 };
      const mockCategory = { id: 'c1', ...dto };
      jest.spyOn(prisma.forumCategory, 'create').mockResolvedValue(mockCategory as any);

      const result = await service.createCategory(dto);

      expect(prisma.forumCategory.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('updateCategory', () => {
    it('should update a category', async () => {
      const dto = { name: 'Updated General', sortOrder: 2 };
      const mockCategory = { id: 'c1', ...dto, description: null };
      jest.spyOn(prisma.forumCategory, 'update').mockResolvedValue(mockCategory as any);

      const result = await service.updateCategory('c1', dto);

      expect(prisma.forumCategory.update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: dto });
      expect(result).toEqual(mockCategory);
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      jest.spyOn(prisma.forumCategory, 'delete').mockResolvedValue({ id: 'c1', name: 'General', description: null, sortOrder: 1 } as any);

      const result = await service.deleteCategory('c1');

      expect(prisma.forumCategory.delete).toHaveBeenCalledWith({ where: { id: 'c1' } });
      expect(result).toEqual({ message: '删除成功' });
    });
  });

  describe('findAllTopics', () => {
    it('should return paginated topics', async () => {
      const mockTopics = [
        {
          id: 't1',
          title: 'Welcome',
          content: 'Welcome to the forum',
          isPinned: true,
          category: { id: 'c1', name: 'General' },
          author: { id: 'u1', name: 'Alice', avatar: null },
          _count: { posts: 5 },
        },
      ];
      jest.spyOn(prisma.forumTopic, 'findMany').mockResolvedValue(mockTopics as unknown as ForumTopic[]);
      jest.spyOn(prisma.forumTopic, 'count').mockResolvedValue(1);

      const result = await service.findAllTopics(1, 20);

      expect(prisma.forumTopic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
        }),
      );
      expect(result.data).toEqual(mockTopics);
      expect(result.meta).toEqual({ page: 1, pageSize: 20, total: 1, totalPages: 1 });
    });

    it('should filter by categoryId when provided', async () => {
      const mockTopics = [
        {
          id: 't2',
          title: 'Tech Discussion',
          content: 'Talk about tech',
          isPinned: false,
          category: { id: 'c2', name: 'Tech' },
          author: { id: 'u2', name: 'Bob', avatar: null },
          _count: { posts: 3 },
        },
      ];
      jest.spyOn(prisma.forumTopic, 'findMany').mockResolvedValue(mockTopics as unknown as ForumTopic[]);
      jest.spyOn(prisma.forumTopic, 'count').mockResolvedValue(1);

      const result = await service.findAllTopics(1, 20, 'c2');

      expect(prisma.forumTopic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { categoryId: 'c2' },
        }),
      );
      expect(result.data).toEqual(mockTopics);
    });

    it('should use default pagination when no params provided', async () => {
      const mockTopics = [
        {
          id: 't1',
          title: 'Welcome',
          content: 'Welcome to the forum',
          isPinned: true,
          category: { id: 'c1', name: 'General' },
          author: { id: 'u1', name: 'Alice', avatar: null },
          _count: { posts: 5 },
        },
      ];
      jest.spyOn(prisma.forumTopic, 'findMany').mockResolvedValue(mockTopics as unknown as ForumTopic[]);
      jest.spyOn(prisma.forumTopic, 'count').mockResolvedValue(1);

      const result = await service.findAllTopics();

      expect(prisma.forumTopic.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          where: {},
        }),
      );
      expect(result.meta).toEqual({ page: 1, pageSize: 20, total: 1, totalPages: 1 });
    });
  });

  describe('findTopicById', () => {
    it('should return topic with posts and increment viewCount', async () => {
      const mockTopic = {
        id: 't1',
        title: 'Welcome',
        content: 'Welcome to the forum',
        category: { id: 'c1', name: 'General' },
        author: { id: 'u1', name: 'Alice', avatar: null },
        posts: [
          {
            id: 'p1',
            content: 'Thanks!',
            author: { id: 'u2', name: 'Bob', avatar: null },
          },
        ],
      };
      jest.spyOn(prisma.forumTopic, 'findFirst').mockResolvedValue(mockTopic as unknown as ForumTopic);
      jest.spyOn(prisma.forumTopic, 'update').mockResolvedValue({ ...mockTopic, viewCount: 1 } as unknown as ForumTopic);

      const result = await service.findTopicById('t1');

      expect(prisma.forumTopic.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 't1' },
          include: expect.objectContaining({
            category: true,
            posts: expect.objectContaining({
              orderBy: { createdAt: 'asc' },
            }),
          }),
        }),
      );
      expect(prisma.forumTopic.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 't1' },
          data: { viewCount: { increment: 1 } },
        }),
      );
      expect(result).toEqual(mockTopic);
    });

    it('should throw NotFoundException when topic not found', async () => {
      jest.spyOn(prisma.forumTopic, 'findFirst').mockResolvedValue(null);

      await expect(service.findTopicById('missing')).rejects.toThrow(NotFoundException);
      await expect(service.findTopicById('missing')).rejects.toThrow('话题不存在');
    });

    it('should include workspaceId in query when provided', async () => {
      const mockTopic = {
        id: 't1',
        title: 'Welcome',
        content: 'Welcome to the forum',
        category: { id: 'c1', name: 'General' },
        author: { id: 'u1', name: 'Alice', avatar: null },
        posts: [],
      };
      jest.spyOn(prisma.forumTopic, 'findFirst').mockResolvedValue(mockTopic as unknown as ForumTopic);
      jest.spyOn(prisma.forumTopic, 'update').mockResolvedValue({ ...mockTopic, viewCount: 1 } as unknown as ForumTopic);

      const result = await service.findTopicById('t1', 'w1');

      expect(prisma.forumTopic.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 't1', workspaceId: 'w1' },
        }),
      );
      expect(result).toEqual(mockTopic);
    });
  });

  describe('createTopic', () => {
    it('should create a new topic with replyCount 0', async () => {
      const dto = {
        categoryId: 'c1',
        authorId: 'u1',
        title: 'New Topic',
        content: 'Topic content',
        workspaceId: 'w1',
      };
      const mockTopic = {
        id: 't1',
        ...dto,
        replyCount: 0,
        category: { id: 'c1', name: 'General' },
        author: { id: 'u1', name: 'Alice', avatar: null },
      };
      jest.spyOn(prisma.forumTopic, 'create').mockResolvedValue(mockTopic as unknown as ForumTopic);

      const result = await service.createTopic(dto);

      expect(prisma.forumTopic.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            categoryId: dto.categoryId,
            authorId: dto.authorId,
            title: dto.title,
            content: dto.content,
            workspaceId: dto.workspaceId,
            replyCount: 0,
          }),
          include: expect.objectContaining({
            category: true,
            author: { select: { id: true, name: true, avatar: true } },
          }),
        }),
      );
      expect(result).toEqual(mockTopic);
    });
  });

  describe('updateTopic', () => {
    it('should update a topic without workspaceId', async () => {
      const dto = { title: 'Updated Title' };
      const mockTopic = { id: 't1', ...dto };
      jest.spyOn(prisma.forumTopic, 'update').mockResolvedValue(mockTopic as unknown as ForumTopic);

      const result = await service.updateTopic('t1', dto);

      expect(prisma.forumTopic.findFirst).not.toHaveBeenCalled();
      expect(result).toEqual(mockTopic);
    });

    it('should update a topic with workspaceId when it exists', async () => {
      const dto = { title: 'Updated Title' };
      const mockTopic = { id: 't1', ...dto };
      jest.spyOn(prisma.forumTopic, 'findFirst').mockResolvedValue({ id: 't1' } as ForumTopic);
      jest.spyOn(prisma.forumTopic, 'update').mockResolvedValue(mockTopic as unknown as ForumTopic);

      const result = await service.updateTopic('t1', dto, 'w1');

      expect(prisma.forumTopic.findFirst).toHaveBeenCalledWith({ where: { id: 't1', workspaceId: 'w1' } });
      expect(result).toEqual(mockTopic);
    });

    it('should throw NotFoundException when workspace topic not found', async () => {
      jest.spyOn(prisma.forumTopic, 'findFirst').mockResolvedValue(null);

      await expect(service.updateTopic('t1', { title: 'X' }, 'w1')).rejects.toThrow(NotFoundException);
      await expect(service.updateTopic('t1', { title: 'X' }, 'w1')).rejects.toThrow('话题不存在或无权访问');
    });
  });

  describe('deleteTopic', () => {
    it('should delete a topic without workspaceId', async () => {
      jest.spyOn(prisma.forumTopic, 'delete').mockResolvedValue({ id: 't1' } as ForumTopic);

      const result = await service.deleteTopic('t1');

      expect(prisma.forumTopic.findFirst).not.toHaveBeenCalled();
      expect(result).toEqual({ message: '删除成功' });
    });

    it('should delete a topic with workspaceId when it exists', async () => {
      jest.spyOn(prisma.forumTopic, 'findFirst').mockResolvedValue({ id: 't1' } as ForumTopic);
      jest.spyOn(prisma.forumTopic, 'delete').mockResolvedValue({ id: 't1' } as ForumTopic);

      const result = await service.deleteTopic('t1', 'w1');

      expect(prisma.forumTopic.findFirst).toHaveBeenCalledWith({ where: { id: 't1', workspaceId: 'w1' } });
      expect(result).toEqual({ message: '删除成功' });
    });

    it('should throw NotFoundException when workspace topic not found', async () => {
      jest.spyOn(prisma.forumTopic, 'findFirst').mockResolvedValue(null);

      await expect(service.deleteTopic('t1', 'w1')).rejects.toThrow(NotFoundException);
      await expect(service.deleteTopic('t1', 'w1')).rejects.toThrow('话题不存在或无权访问');
    });
  });

  describe('togglePin', () => {
    it('should toggle pin status', async () => {
      const mockTopic = { id: 't1', isPinned: true };
      jest.spyOn(prisma.forumTopic, 'update').mockResolvedValue(mockTopic as unknown as ForumTopic);

      const result = await service.togglePin('t1', true);

      expect(prisma.forumTopic.update).toHaveBeenCalledWith({ where: { id: 't1' }, data: { isPinned: true } });
      expect(result).toEqual(mockTopic);
    });
  });

  describe('toggleLock', () => {
    it('should toggle lock status', async () => {
      const mockTopic = { id: 't1', isLocked: true };
      jest.spyOn(prisma.forumTopic, 'update').mockResolvedValue(mockTopic as unknown as ForumTopic);

      const result = await service.toggleLock('t1', true);

      expect(prisma.forumTopic.update).toHaveBeenCalledWith({ where: { id: 't1' }, data: { isLocked: true } });
      expect(result).toEqual(mockTopic);
    });
  });
});
