import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CommentCreatedEvent } from '../../events/comment-created.event';

@Injectable()
export class ForumPostService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async createPost(data: { topicId: string; authorId: string; content: string; workspaceId?: string }) {
    const topic = await this.prisma.forumTopic.findUnique({ where: { id: data.topicId } });
    if (!topic) throw new NotFoundException('话题不存在');
    if (topic.isLocked) throw new BadRequestException('话题已锁定，无法回复');

    const post = await this.prisma.forumPost.create({
      data: {
        topicId: data.topicId,
        authorId: data.authorId,
        content: data.content,
        workspaceId: data.workspaceId,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });

    await this.prisma.forumTopic.update({
      where: { id: data.topicId },
      data: { replyCount: { increment: 1 } },
    });

    const author = await this.prisma.user.findUnique({
      where: { id: data.authorId },
      select: { name: true },
    });
    this.eventEmitter.emit(
      'comment.created',
      new CommentCreatedEvent(
        post.id,
        data.authorId,
        author?.name || '有人',
        data.content,
        null,
        'forum_topic',
        data.topicId,
      ),
    );

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

  async markAsSolution(postId: string) {
    const post = await this.prisma.forumPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('回复不存在');
    await this.prisma.forumPost.updateMany({
      where: { topicId: post.topicId },
      data: { isSolution: false },
    });
    return this.prisma.forumPost.update({ where: { id: postId }, data: { isSolution: true } });
  }
}
