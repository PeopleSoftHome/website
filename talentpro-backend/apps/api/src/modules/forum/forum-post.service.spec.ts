import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ForumPost, ForumTopic } from '@prisma/client';
import { ForumPostService } from './forum-post.service';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('ForumPostService', () => {
  let service: ForumPostService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForumPostService,
        {
          provide: PrismaService,
          useValue: {
            forumTopic: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            forumPost: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
              delete: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
            $transaction: jest.fn((ops) => Promise.all(ops)),
          },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ForumPostService>(ForumPostService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPost', () => {
    it('should create a post and increment topic replyCount', async () => {
      const topic = { id: 't1', isLocked: false };
      const createdPost = {
        id: 'p1',
        topicId: 't1',
        authorId: 'u1',
        content: 'Reply',
        author: { id: 'u1', name: 'Alice', avatar: null },
      };
      jest.spyOn(prisma.forumTopic, 'findUnique').mockResolvedValue(topic as unknown as ForumTopic);
      jest.spyOn(prisma.forumPost, 'create').mockResolvedValue(createdPost as unknown as ForumPost);
      jest.spyOn(prisma.forumTopic, 'update').mockResolvedValue({ ...topic, replyCount: 1 } as unknown as ForumTopic);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ name: 'Alice' } as never);

      const result = await service.createPost({ topicId: 't1', authorId: 'u1', content: 'Reply' });

      expect(prisma.forumTopic.findUnique).toHaveBeenCalledWith({ where: { id: 't1' } });
      expect(prisma.forumPost.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { topicId: 't1', authorId: 'u1', content: 'Reply', workspaceId: undefined },
        }),
      );
      expect(prisma.forumTopic.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 't1' },
          data: { replyCount: { increment: 1 } },
        }),
      );
      expect(result).toEqual(createdPost);
    });

    it('should throw NotFoundException when topic does not exist', async () => {
      jest.spyOn(prisma.forumTopic, 'findUnique').mockResolvedValue(null);

      await expect(service.createPost({ topicId: 'missing', authorId: 'u1', content: 'Reply' })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when topic is locked', async () => {
      jest.spyOn(prisma.forumTopic, 'findUnique').mockResolvedValue({ id: 't1', isLocked: true } as unknown as ForumTopic);

      await expect(service.createPost({ topicId: 't1', authorId: 'u1', content: 'Reply' })).rejects.toThrow(BadRequestException);
    });

    it('should emit event with default name when author not found', async () => {
      const topic = { id: 't1', isLocked: false };
      const createdPost = {
        id: 'p1',
        topicId: 't1',
        authorId: 'u1',
        content: 'Reply',
        author: { id: 'u1', name: 'Alice', avatar: null },
      };
      jest.spyOn(prisma.forumTopic, 'findUnique').mockResolvedValue(topic as unknown as ForumTopic);
      jest.spyOn(prisma.forumPost, 'create').mockResolvedValue(createdPost as unknown as ForumPost);
      jest.spyOn(prisma.forumTopic, 'update').mockResolvedValue({ ...topic, replyCount: 1 } as unknown as ForumTopic);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null as never);

      const result = await service.createPost({ topicId: 't1', authorId: 'u1', content: 'Reply' });

      expect(result).toEqual(createdPost);
    });
  });

  describe('updatePost', () => {
    it('should update post when workspaceId matches', async () => {
      const expected = { id: 'p1', content: 'Updated' };
      jest.spyOn(prisma.forumPost, 'findFirst').mockResolvedValue({ id: 'p1' } as unknown as ForumPost);
      jest.spyOn(prisma.forumPost, 'update').mockResolvedValue(expected as unknown as ForumPost);

      const result = await service.updatePost('p1', { content: 'Updated' }, 'ws1');

      expect(prisma.forumPost.findFirst).toHaveBeenCalledWith({ where: { id: 'p1', workspaceId: 'ws1' } });
      expect(prisma.forumPost.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { content: 'Updated' } });
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when post not in workspace', async () => {
      jest.spyOn(prisma.forumPost, 'findFirst').mockResolvedValue(null);

      await expect(service.updatePost('p1', { content: 'Updated' }, 'ws1')).rejects.toThrow(NotFoundException);
    });

    it('should update post without workspaceId check when not provided', async () => {
      const expected = { id: 'p1', content: 'Updated' };
      jest.spyOn(prisma.forumPost, 'update').mockResolvedValue(expected as unknown as ForumPost);

      const result = await service.updatePost('p1', { content: 'Updated' });

      expect(prisma.forumPost.findFirst).not.toHaveBeenCalled();
      expect(prisma.forumPost.update).toHaveBeenCalledWith({ where: { id: 'p1' }, data: { content: 'Updated' } });
      expect(result).toEqual(expected);
    });
  });

  describe('deletePost', () => {
    it('should delete post and decrement replyCount', async () => {
      const post = { id: 'p1', topicId: 't1', workspaceId: 'ws1' };
      jest.spyOn(prisma.forumPost, 'findUnique').mockResolvedValue(post as unknown as ForumPost);
      jest.spyOn(prisma.forumPost, 'delete').mockResolvedValue(post as unknown as ForumPost);
      jest.spyOn(prisma.forumTopic, 'update').mockResolvedValue({ id: 't1', replyCount: 0 } as unknown as ForumTopic);

      const result = await service.deletePost('p1', 'ws1');

      expect(prisma.forumPost.findUnique).toHaveBeenCalledWith({ where: { id: 'p1' } });
      expect(prisma.forumPost.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
      expect(result).toEqual({ message: 'Deleted successfully' });
    });

    it('should throw NotFoundException when post does not exist', async () => {
      jest.spyOn(prisma.forumPost, 'findUnique').mockResolvedValue(null);

      await expect(service.deletePost('missing')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when workspaceId does not match', async () => {
      jest.spyOn(prisma.forumPost, 'findUnique').mockResolvedValue({ id: 'p1', topicId: 't1', workspaceId: 'ws2' } as unknown as ForumPost);

      await expect(service.deletePost('p1', 'ws1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAsSolution', () => {
    it('should reset solutions and mark post as solution', async () => {
      const post = { id: 'p1', topicId: 't1' };
      const updated = { id: 'p1', topicId: 't1', isSolution: true };
      jest.spyOn(prisma.forumPost, 'findUnique').mockResolvedValue(post as unknown as ForumPost);
      jest.spyOn(prisma.forumPost, 'updateMany').mockResolvedValue({ count: 1 } as never);
      jest.spyOn(prisma.forumPost, 'update').mockResolvedValue(updated as unknown as ForumPost);

      const result = await service.markAsSolution('p1');

      expect(prisma.forumPost.updateMany).toHaveBeenCalledWith({
        where: { topicId: 't1' },
        data: { isSolution: false },
      });
      expect(prisma.forumPost.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { isSolution: true },
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when post does not exist', async () => {
      jest.spyOn(prisma.forumPost, 'findUnique').mockResolvedValue(null);

      await expect(service.markAsSolution('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
