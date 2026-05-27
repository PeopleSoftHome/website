import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CommentCreatedEvent } from '../events/comment-created.event';
import { SearchIndexEvent } from '../events/search-index.event';

@Injectable()
export class SearchIndexListener {
  constructor(
    @InjectQueue('search-index') private readonly searchIndexQueue: Queue,
  ) {}

  @OnEvent('comment.created')
  async handleCommentCreated(event: CommentCreatedEvent) {
    // 评论创建后，重新索引对应实体
    await this.searchIndexQueue.add('update', {
      entityType: this.mapEntityType(event.entityType),
      entityId: event.entityId,
      action: 'update',
    });
  }

  @OnEvent('search.index')
  async handleSearchIndex(event: SearchIndexEvent) {
    await this.searchIndexQueue.add('index', {
      entityType: event.entityType,
      entityId: event.entityId,
      action: event.action,
      payload: event.payload,
    });
  }

  private mapEntityType(type: string): 'blog_post' | 'forum_topic' {
    if (type === 'blog_post') return 'blog_post';
    if (type === 'forum_topic') return 'forum_topic';
    return 'blog_post';
  }
}
