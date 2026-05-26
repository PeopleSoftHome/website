import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ForumService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  // ─── Categories ───
  async findAllCategories() {
    return this.prisma.forumCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { topics: true } } },
    });
  }

  async createCategory(data: { name: string; description?: string; sortOrder?: number }) {
    return this.prisma.forumCategory.create({ data });
  }

  async updateCategory(id: string, data: Partial<{ name: string; description?: string; sortOrder: number }>) {
    return this.prisma.forumCategory.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    await this.prisma.forumCategory.delete({ where: { id } });
    return { message: '删除成功' };
  }

  // ─── Topics ───
  async findAllTopics(page = 1, pageSize = 20, categoryId?: string) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    const [data, total] = await Promise.all([
      this.prisma.forumTopic.findMany({
        skip,
        take: pageSize,
        where,
        include: {
          category: true,
          author: { select: { id: true, name: true, avatar: true } },
          _count: { select: { posts: true } },
        },
        orderBy: [
          { isPinned: 'desc' },
          { updatedAt: 'desc' },
        ],
      }),
      this.prisma.forumTopic.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findTopicById(id: string) {
    const topic = await this.prisma.forumTopic.findUnique({
      where: { id },
      include: {
        category: true,
        author: { select: { id: true, name: true, avatar: true } },
        posts: {
          include: { author: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!topic) throw new NotFoundException('话题不存在');
    // 增加浏览量
    await this.prisma.forumTopic.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return topic;
  }

  async createTopic(data: { categoryId: string; authorId: string; title: string; content: string }) {
    const topic = await this.prisma.forumTopic.create({
      data: {
        categoryId: data.categoryId,
        authorId: data.authorId,
        title: data.title,
        content: data.content,
        replyCount: 0,
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, avatar: true } },
      },
    });
    return topic;
  }

  async updateTopic(id: string, data: Partial<{ title: string; content: string; categoryId: string }>) {
    return this.prisma.forumTopic.update({ where: { id }, data });
  }

  async deleteTopic(id: string) {
    await this.prisma.forumTopic.delete({ where: { id } });
    return { message: '删除成功' };
  }

  async togglePin(id: string, isPinned: boolean) {
    return this.prisma.forumTopic.update({ where: { id }, data: { isPinned } });
  }

  async toggleLock(id: string, isLocked: boolean) {
    return this.prisma.forumTopic.update({ where: { id }, data: { isLocked } });
  }

  // ─── Posts (Replies) ───
  async createPost(data: { topicId: string; authorId: string; content: string }) {
    const topic = await this.prisma.forumTopic.findUnique({ where: { id: data.topicId } });
    if (!topic) throw new NotFoundException('话题不存在');
    if (topic.isLocked) throw new BadRequestException('话题已锁定，无法回复');

    const post = await this.prisma.forumPost.create({
      data: {
        topicId: data.topicId,
        authorId: data.authorId,
        content: data.content,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    await this.prisma.forumTopic.update({
      where: { id: data.topicId },
      data: { replyCount: { increment: 1 } },
    });

    // 异步发送通知
    this.sendNotifications(data, post, topic).catch(() => {});

    return post;
  }

  async updatePost(id: string, data: { content: string }) {
    return this.prisma.forumPost.update({ where: { id }, data });
  }

  async deletePost(id: string) {
    const post = await this.prisma.forumPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('回复不存在');
    await this.prisma.forumPost.delete({ where: { id } });
    await this.prisma.forumTopic.update({
      where: { id: post.topicId },
      data: { replyCount: { decrement: 1 } },
    });
    return { message: '删除成功' };
  }

  private async sendNotifications(
    data: { topicId: string; authorId: string; content: string },
    post: any,
    topic: any,
  ) {
    const author = await this.prisma.user.findUnique({ where: { id: data.authorId }, select: { name: true } });
    const authorName = author?.name || '有人';

    // 1. 回复话题通知：给话题作者
    if (topic.authorId && topic.authorId !== data.authorId) {
      await this.notificationService.create({
        userId: topic.authorId,
        type: 'COMMENT_REPLY',
        title: '话题收到新回复',
        content: `${authorName} 回复了你的话题《${topic.title}》`,
        data: { postId: post.id, topicId: data.topicId },
      });
    }

    // 2. @mention 通知
    const mentions = data.content.match(/@([\u4e00-\u9fa5a-zA-Z0-9_]+)/g) || [];
    const uniqueNames = [...new Set(mentions.map((m) => m.slice(1)))];
    for (const name of uniqueNames) {
      const user = await this.prisma.user.findFirst({
        where: { name, status: 'ACTIVE' },
        select: { id: true },
      });
      if (user && user.id !== data.authorId) {
        await this.notificationService.create({
          userId: user.id,
          type: 'MENTION',
          title: '有人提到了你',
          content: `${authorName} 在回复中提到了你`,
          data: { postId: post.id, topicId: data.topicId },
        });
      }
    }
  }

  async markAsSolution(postId: string) {
    const post = await this.prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('回复不存在');
    // 先将同话题下其他回复取消标记
    await this.prisma.forumPost.updateMany({
      where: { topicId: post.topicId },
      data: { isSolution: false },
    });
    return this.prisma.forumPost.update({ where: { id: postId }, data: { isSolution: true } });
  }
}
