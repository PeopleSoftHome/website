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
});
