import { Test, TestingModule } from '@nestjs/testing';
import { CommentStatus } from '@prisma/client';
import { CommentModerationService } from './comment-moderation.service';
import { AiService } from '@/modules/ai/ai.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { getSkip, buildPaginatedResponse } from '@/common/helpers/pagination.helper';

jest.mock('@/common/helpers/pagination.helper', () => ({
  getSkip: jest.fn((page: number, pageSize: number) => (page - 1) * pageSize),
  buildPaginatedResponse: jest.fn((data, page, pageSize, total) => ({
    data,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  })),
}));

describe('CommentModerationService', () => {
  let service: CommentModerationService;
  let prisma: PrismaService;
  let aiService: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentModerationService,
        {
          provide: PrismaService,
          useValue: {
            sensitiveWord: {
              findMany: jest.fn(),
            },
            comment: {
              findMany: jest.fn(),
              count: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
          },
        },
        {
          provide: AiService,
          useValue: {
            moderateContent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CommentModerationService>(CommentModerationService);
    prisma = module.get<PrismaService>(PrismaService);
    aiService = module.get<AiService>(AiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('moderateContent', () => {
    it('should autoApprove when no rules or ai flags hit', async () => {
      jest.spyOn(prisma.sensitiveWord, 'findMany').mockResolvedValue([]);
      jest.spyOn(aiService, 'moderateContent').mockResolvedValue({ riskScore: 0, flags: [], autoApprove: true });

      const result = await service.moderateContent('Hello world');

      expect(result.autoApprove).toBe(true);
      expect(result.riskScore).toBe(0);
      expect(result.flags).toEqual([]);
    });

    it('should not autoApprove when sensitive word matches', async () => {
      jest.spyOn(prisma.sensitiveWord, 'findMany').mockResolvedValue([
        { word: 'bad', category: 'abuse', severity: 5 },
      ] as never);
      jest.spyOn(aiService, 'moderateContent').mockResolvedValue({ riskScore: 0, flags: [], autoApprove: true });

      const result = await service.moderateContent('This is bad');

      expect(result.autoApprove).toBe(false);
      expect(result.flags).toContain('abuse');
      expect(result.riskScore).toBeGreaterThan(0);
    });

    it('should not autoApprove when spam pattern matches', async () => {
      jest.spyOn(prisma.sensitiveWord, 'findMany').mockResolvedValue([]);
      jest.spyOn(aiService, 'moderateContent').mockResolvedValue({ riskScore: 0, flags: [], autoApprove: true });

      const result = await service.moderateContent('联系我微信：abc123');

      expect(result.autoApprove).toBe(false);
      expect(result.flags).toContain('spam');
    });

    it('should handle ai service rejection gracefully', async () => {
      jest.spyOn(prisma.sensitiveWord, 'findMany').mockResolvedValue([]);
      jest.spyOn(aiService, 'moderateContent').mockRejectedValue(new Error('AI down'));

      const result = await service.moderateContent('Hello');

      expect(result.autoApprove).toBe(true);
      expect(result.aiRiskScore).toBe(0);
    });
  });

  describe('findCommentsForAdmin', () => {
    it('should return paginated comments with filters', async () => {
      const mockComments = [{ id: 'cm1', status: CommentStatus.PENDING }];
      jest.spyOn(prisma.comment, 'findMany').mockResolvedValue(mockComments as never);
      jest.spyOn(prisma.comment, 'count').mockResolvedValue(1);

      const result = await service.findCommentsForAdmin({ status: CommentStatus.PENDING, entityType: 'BlogPost', page: 1, pageSize: 20 });

      expect(getSkip).toHaveBeenCalledWith(1, 20);
      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          where: { status: CommentStatus.PENDING, entityType: 'BlogPost' },
        }),
      );
      expect(buildPaginatedResponse).toHaveBeenCalledWith(mockComments, 1, 20, 1);
      expect(result.data).toEqual(mockComments);
    });
  });

  describe('batchModerateComments', () => {
    it('should update many comments and return count', async () => {
      jest.spyOn(prisma.comment, 'updateMany').mockResolvedValue({ count: 2 } as never);

      const result = await service.batchModerateComments(['cm1', 'cm2'], CommentStatus.APPROVED);

      expect(prisma.comment.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['cm1', 'cm2'] } },
        data: { status: CommentStatus.APPROVED },
      });
      expect(result).toEqual({ updated: 2 });
    });
  });

  describe('moderateComment', () => {
    it('should update single comment status', async () => {
      const expected = { id: 'cm1', status: CommentStatus.APPROVED };
      jest.spyOn(prisma.comment, 'update').mockResolvedValue(expected as never);

      const result = await service.moderateComment('cm1', CommentStatus.APPROVED);

      expect(prisma.comment.update).toHaveBeenCalledWith({
        where: { id: 'cm1' },
        data: { status: CommentStatus.APPROVED },
      });
      expect(result).toEqual(expected);
    });
  });
});
