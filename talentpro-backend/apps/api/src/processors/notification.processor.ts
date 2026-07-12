import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@shared/prisma/prisma.service';
import { NotificationService } from '../modules/notification/notification.service';
import { NotificationSseService } from '../modules/notification/notification-sse.service';

interface NotificationJobData {
  type: 'COMMENT_REPLY' | 'MENTION' | string;
  parentId?: string;
  authorId?: string;
  authorName?: string;
  commentId?: string;
  entityType?: string;
  entityId?: string;
  mentionedName?: string;
  [key: string]: unknown;
}

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
    private readonly notificationSseService: NotificationSseService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    try {
      switch (job.name) {
        case 'create':
          await this.handleCreate(job.data);
          break;
        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      this.logger.error(`Job ${job.id} failed: ${message}`, stack);
      throw err; // 重新抛出以触发 BullMQ 重试
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(
      `Job ${job.id} permanently failed after ${job.attemptsMade} attempts: ${err.message}`,
      {
        deadLetter: {
          queue: 'notification',
          jobId: job.id,
          name: job.name,
          data: job.data,
          error: err.message,
          stack: err.stack,
        },
      },
    );
  }

  private async handleCreate(data: NotificationJobData) {
    if (data.type === 'COMMENT_REPLY' && data.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: data.parentId },
        select: { authorId: true },
      });
      if (parent && parent.authorId !== data.authorId) {
        const notif = await this.notificationService.create({
          userId: parent.authorId,
          type: 'COMMENT_REPLY',
          title: '收到新回复',
          content: `${data.authorName} 回复了你的评论`,
          data: {
            commentId: data.commentId,
            entityType: data.entityType,
            entityId: data.entityId,
          },
        });
        await this.notificationSseService.broadcast(parent.authorId, notif);
      }
    }

    if (data.type === 'MENTION' && data.mentionedName) {
      const user = await this.prisma.user.findFirst({
        where: { name: data.mentionedName, status: 'ACTIVE' },
        select: { id: true },
      });
      if (user && user.id !== data.authorId) {
        const notif = await this.notificationService.create({
          userId: user.id,
          type: 'MENTION',
          title: '有人提到了你',
          content: `${data.authorName} 在评论中提到了你`,
          data: {
            commentId: data.commentId,
            entityType: data.entityType,
            entityId: data.entityId,
          },
        });
        await this.notificationSseService.broadcast(user.id, notif);
      }
    }
  }
}
