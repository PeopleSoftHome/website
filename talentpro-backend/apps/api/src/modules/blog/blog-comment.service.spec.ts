import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CommentStatus, Comment } from '@prisma/client';
import { BlogCommentService } from './blog-comment.service';
import { CommentModerationService } from './comment-moderation.service';
import { PrismaService } from '@shared/prisma/prisma.service';
import { getSkip, buildPaginatedResponse } from '@shared/helpers/pagination.helper';

jest.mock('@shared/helpers/pagination.helper', () => ({
  getSkip: jest.fn((page: number, pageSize: number) => (page - 1) * pageSize),
  buildPaginatedResponse: jest.fn((data, page, pageSize, total) => ({
    data,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  })),
}));

describe('BlogCommentService', () => {
  let service: BlogCommentService;
  let prisma: PrismaService;
  let moderationService: CommentModerationService;
  let eventEmitter: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogCommentService,
        {
          provide: PrismaService,
          useValue: {
            comment: {
              findMany: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
        {
          provide: CommentModerationService,
          useValue: {
            moderateContent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BlogCommentService>(BlogCommentService);
    prisma = module.get<PrismaService>(PrismaService);
    moderationService = module.get<CommentModerationService>(CommentModerationService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findComments', () => {
    it('should return paginated approved comments', async () => {
      const mockComments = [
        {
          id: 'cm1',
          content: 'Nice',
          status: CommentStatus.APPROVED,
          author: { id: 'u1', name: 'Alice', avatar: null },
          replies: [],
        },
      ];
      jest.spyOn(prisma.comment, 'findMany').mockResolvedValue(mockComments as unknown as Comment[]);
      jest.spyOn(prisma.comment, 'count').mockResolvedValue(1);

      const result = await service.findComments('BlogPost', 'p1', 1, 20);

      expect(getSkip).toHaveBeenCalledWith(1, 20);
      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          where: { entityType: 'BlogPost', entityId: 'p1', status: CommentStatus.APPROVED },
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(buildPaginatedResponse).toHaveBeenCalledWith(mockComments, 1, 20, 1);
      expect(result.data).toEqual(mockComments);
    });

    it('should use default pagination when no params provided', async () => {
      const mockComments = [
        {
          id: 'cm1',
          content: 'Nice',
          status: CommentStatus.APPROVED,
          author: { id: 'u1', name: 'Alice', avatar: null },
          replies: [],
        },
      ];
      jest.spyOn(prisma.comment, 'findMany').mockResolvedValue(mockComments as unknown as Comment[]);
      jest.spyOn(prisma.comment, 'count').mockResolvedValue(1);

      const result = await service.findComments('BlogPost', 'p1');

      expect(getSkip).toHaveBeenCalledWith(1, 20);
      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );
      expect(buildPaginatedResponse).toHaveBeenCalledWith(mockComments, 1, 20, 1);
      expect(result.meta).toEqual({ page: 1, pageSize: 20, total: 1, totalPages: 1 });
    });
  });

  describe('createComment', () => {
    it('should create approved comment when moderation autoApproves', async () => {
      jest.spyOn(moderationService, 'moderateContent').mockResolvedValue({
        riskScore: 0,
        flags: [],
        autoApprove: true,
      });
      const data = {
        entityType: 'BlogPost',
        entityId: 'p1',
        authorId: 'u1',
        content: 'Nice post',
      };
      const mockComment = {
        id: 'cm1',
        ...data,
        status: CommentStatus.APPROVED,
        author: { id: 'u1', name: 'Alice', avatar: null },
      };
      jest.spyOn(prisma.comment, 'create').mockResolvedValue(mockComment as unknown as Comment);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ name: 'Alice' } as never);

      const result = await service.createComment(data);

      expect(moderationService.moderateContent).toHaveBeenCalledWith(data.content);
      expect(prisma.comment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ...data,
            status: CommentStatus.APPROVED,
            aiRiskScore: 0,
            aiFlags: [],
          }),
        }),
      );
      expect(result).toEqual(mockComment);
    });

    it('should create pending comment when moderation requires review', async () => {
      jest.spyOn(moderationService, 'moderateContent').mockResolvedValue({
        riskScore: 0.8,
        flags: ['spam'],
        autoApprove: false,
      });
      const data = {
        entityType: 'BlogPost',
        entityId: 'p1',
        authorId: 'u1',
        content: 'Spam content',
      };
      const mockComment = {
        id: 'cm1',
        ...data,
        status: CommentStatus.PENDING,
        author: { id: 'u1', name: 'Alice', avatar: null },
      };
      jest.spyOn(prisma.comment, 'create').mockResolvedValue(mockComment as unknown as Comment);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ name: 'Alice' } as never);

      const result = await service.createComment(data);

      expect(prisma.comment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: CommentStatus.PENDING,
            aiRiskScore: 0.8,
            aiFlags: ['spam'],
          }),
        }),
      );
      expect(result).toEqual(mockComment);
    });

    it('should emit event with default name when author not found', async () => {
      jest.spyOn(moderationService, 'moderateContent').mockResolvedValue({
        riskScore: 0,
        flags: [],
        autoApprove: true,
      });
      const data = {
        entityType: 'BlogPost',
        entityId: 'p1',
        authorId: 'u1',
        content: 'Nice post',
        parentId: 'cm0',
      };
      const mockComment = {
        id: 'cm1',
        ...data,
        status: CommentStatus.APPROVED,
        author: { id: 'u1', name: 'Alice', avatar: null },
      };
      jest.spyOn(prisma.comment, 'create').mockResolvedValue(mockComment as unknown as Comment);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null as never);
      const emitSpy = jest.spyOn(eventEmitter, 'emit');

      await service.createComment(data);

      expect(emitSpy).toHaveBeenCalledWith(
        'comment.created',
        expect.objectContaining({
          authorName: '有人',
          parentId: 'cm0',
        }),
      );
    });
  });

  describe('deleteComment', () => {
    it('should delete comment and return success message', async () => {
      jest.spyOn(prisma.comment, 'delete').mockResolvedValue({ id: 'cm1' } as unknown as Comment);

      const result = await service.deleteComment('cm1');

      expect(prisma.comment.delete).toHaveBeenCalledWith({ where: { id: 'cm1' } });
      expect(result).toEqual({ message: 'Deleted successfully' });
    });
  });
});
