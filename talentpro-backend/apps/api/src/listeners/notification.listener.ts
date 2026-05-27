import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CommentCreatedEvent } from '../events/comment-created.event';

@Injectable()
export class NotificationListener {
  constructor(
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  @OnEvent('comment.created')
  async handleCommentCreated(event: CommentCreatedEvent) {
    // 1. 回复通知
    if (event.parentId) {
      await this.notificationQueue.add('create', {
        type: 'COMMENT_REPLY',
        commentId: event.commentId,
        authorId: event.authorId,
        authorName: event.authorName,
        parentId: event.parentId,
        entityType: event.entityType,
        entityId: event.entityId,
      });
    }

    // 2. @mention 通知
    const mentions = event.content.match(/@([\u4e00-\u9fa5a-zA-Z0-9_]+)/g) || [];
    const uniqueNames = [...new Set(mentions.map((m) => m.slice(1)))];

    for (const name of uniqueNames) {
      await this.notificationQueue.add('create', {
        type: 'MENTION',
        commentId: event.commentId,
        authorId: event.authorId,
        authorName: event.authorName,
        mentionedName: name,
        entityType: event.entityType,
        entityId: event.entityId,
      });
    }
  }
}
