import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CommentStatus } from '@prisma/client';
import { CommentCreatedEvent } from '../../events/comment-created.event';
import { CommentModerationService } from './comment-moderation.service';
import { getSkip, buildPaginatedResponse } from '@/common/helpers/pagination.helper';

@Injectable()
export class BlogCommentService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private moderationService: CommentModerationService,
  ) {}

  async findComments(entityType: string, entityId: string, page = 1, pageSize = 20) {
    const skip = getSkip(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        skip,
        take: pageSize,
        where: { entityType, entityId, status: CommentStatus.APPROVED },
        include: { author: { select: { id: true, name: true, avatar: true } }, replies: { include: { author: { select: { id: true, name: true, avatar: true } } } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.comment.count({ where: { entityType, entityId, status: CommentStatus.APPROVED } }),
    ]);
    return buildPaginatedResponse(data, page, pageSize, total);
  }

  async createComment(data: {
    entityType: string;
    entityId: string;
    authorId: string;
    content: string;
    parentId?: string;
    workspaceId?: string;
  }) {
    const moderation = await this.moderationService.moderateContent(data.content);

    const comment = await this.prisma.comment.create({
      data: {
        ...data,
        status: moderation.autoApprove ? CommentStatus.APPROVED : CommentStatus.PENDING,
        aiRiskScore: moderation.riskScore,
        aiFlags: moderation.flags,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    const author = await this.prisma.user.findUnique({
      where: { id: data.authorId },
      select: { name: true },
    });
    this.eventEmitter.emit(
      'comment.created',
      new CommentCreatedEvent(
        comment.id,
        data.authorId,
        author?.name || '有人',
        data.content,
        data.parentId || null,
        data.entityType,
        data.entityId,
      ),
    );

    return comment;
  }

  async deleteComment(id: string) {
    await this.prisma.comment.delete({ where: { id } });
    return { message: 'Deleted successfully' };
  }
}
