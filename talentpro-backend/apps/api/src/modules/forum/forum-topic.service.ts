import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@shared/prisma/prisma.service';
import { ForumCategoryRepository } from './forum-category.repository';
import { ForumTopicRepository } from './forum-topic.repository';
import { SearchIndexEvent } from '@/events/search-index.event';

@Injectable()
export class ForumTopicService {
  constructor(
    private prisma: PrismaService,
    private categoryRepo: ForumCategoryRepository,
    private topicRepo: ForumTopicRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  // ─── Categories ───
  async findAllCategories() {
    return this.categoryRepo.findAll({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { topics: true } } },
      pageSize: 100,
    });
  }

  async createCategory(data: { name: string; description?: string; sortOrder?: number }) {
    return this.categoryRepo.create(data);
  }

  async updateCategory(id: string, data: Partial<{ name: string; description?: string; sortOrder: number }>) {
    return this.categoryRepo.update(id, data);
  }

  async deleteCategory(id: string) {
    return this.categoryRepo.delete(id);
  }

  // ─── Topics ───
  async findAllTopics(page = 1, pageSize = 20, categoryId?: string) {
    const where: Prisma.ForumTopicWhereInput = {};
    if (categoryId) where.categoryId = categoryId;
    return this.topicRepo.findAll({
      page,
      pageSize,
      where,
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
      include: {
        category: true,
        author: { select: { id: true, name: true, avatar: true } },
        _count: { select: { posts: true } },
      },
    });
  }

  async findTopicById(id: string, workspaceId?: string) {
    const where: Prisma.ForumTopicWhereInput = { id };
    if (workspaceId) where.workspaceId = workspaceId;
    const topic = await this.prisma.forumTopic.findFirst({
      where,
      include: {
        category: true,
        author: { select: { id: true, name: true, avatar: true } },
        posts: {
          include: { author: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!topic) throw new NotFoundException('Topic not found');
    await this.prisma.forumTopic.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return topic;
  }

  async createTopic(data: { categoryId: string; authorId: string; title: string; content: string; workspaceId?: string }) {
    const topic = await this.topicRepo.create(
      {
        categoryId: data.categoryId,
        authorId: data.authorId,
        title: data.title,
        content: data.content,
        workspaceId: data.workspaceId,
        replyCount: 0,
      },
      {
        category: true,
        author: { select: { id: true, name: true, avatar: true } },
      },
    );
    this.eventEmitter.emit('search.index', new SearchIndexEvent('forum_topic', topic.id, 'create'));
    return topic;
  }

  async updateTopic(id: string, data: Partial<{ title: string; content: string; categoryId: string }>, workspaceId?: string) {
    if (workspaceId) {
      const existing = await this.prisma.forumTopic.findFirst({ where: { id, workspaceId } });
      if (!existing) throw new NotFoundException('Topic not found or no access');
    }
    const topic = await this.topicRepo.update(id, data);
    this.eventEmitter.emit('search.index', new SearchIndexEvent('forum_topic', id, 'update'));
    return topic;
  }

  async deleteTopic(id: string, workspaceId?: string) {
    if (workspaceId) {
      const existing = await this.prisma.forumTopic.findFirst({ where: { id, workspaceId } });
      if (!existing) throw new NotFoundException('Topic not found or no access');
    }
    await this.topicRepo.delete(id);
    this.eventEmitter.emit('search.index', new SearchIndexEvent('forum_topic', id, 'delete'));
    return { message: 'Deleted successfully' };
  }

  async togglePin(id: string, isPinned: boolean) {
    return this.topicRepo.update(id, { isPinned });
  }

  async toggleLock(id: string, isLocked: boolean) {
    return this.topicRepo.update(id, { isLocked });
  }
}
