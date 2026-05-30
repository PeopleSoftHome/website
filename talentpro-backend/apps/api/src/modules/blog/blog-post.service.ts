import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PostStatus } from '@prisma/client';
import { getSkip, buildPaginatedResponse } from '@/common/helpers/pagination.helper';
import { BlogCategoryRepository } from './blog-category.repository';
import { BlogTagRepository } from './blog-tag.repository';
import { SearchIndexEvent } from '@/events/search-index.event';

@Injectable()
export class BlogPostService {
  constructor(
    private prisma: PrismaService,
    private categoryRepo: BlogCategoryRepository,
    private tagRepo: BlogTagRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  // ─── Categories ───
  async findAllCategories() {
    return this.categoryRepo.findAll({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { posts: true } } },
      pageSize: 100,
    });
  }

  async createCategory(data: { name: string; slug: string; description?: string }) {
    return this.categoryRepo.create(data);
  }

  async updateCategory(id: string, data: Partial<{ name: string; description?: string; sortOrder: number }>) {
    return this.categoryRepo.update(id, data);
  }

  async deleteCategory(id: string) {
    return this.categoryRepo.delete(id);
  }

  // ─── Posts ───
  async findAllPosts(page = 1, pageSize = 20, categorySlug?: string, status?: PostStatus) {
    const skip = getSkip(page, pageSize);
    const where: any = { status: 'PUBLISHED' };
    if (categorySlug) where.category = { slug: categorySlug };
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        skip,
        take: pageSize,
        where,
        include: { category: true, author: { select: { id: true, name: true, avatar: true } }, tags: true },
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.blogPost.count({ where }),
    ]);
    return buildPaginatedResponse(data, page, pageSize, total);
  }

  async findPostBySlug(slug: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: {
        category: true,
        author: { select: { id: true, name: true, avatar: true } },
        tags: true,
      },
    });
    if (!post) throw new NotFoundException('文章不存在');
    await this.prisma.blogPost.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
    const comments = await this.prisma.comment.findMany({
      where: { entityType: 'BlogPost', entityId: post.id, status: 'APPROVED', parentId: null },
      include: { author: { select: { id: true, name: true, avatar: true } }, replies: { include: { author: { select: { id: true, name: true, avatar: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    return { ...post, comments };
  }

  async createPost(data: {
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    coverImage?: string;
    authorId: string;
    categoryId: string;
    tagIds?: string[];
    status?: PostStatus;
    workspaceId?: string;
  }) {
    const { tagIds, ...rest } = data;
    const post = await this.prisma.blogPost.create({
      data: {
        ...rest,
        status: rest.status || PostStatus.DRAFT,
        workspaceId: data.workspaceId,
        tags: tagIds ? { connect: tagIds.map((id) => ({ id })) } : undefined,
      },
      include: { category: true, tags: true },
    });
    this.eventEmitter.emit('search.index', new SearchIndexEvent('blog_post', post.id, 'create'));
    return post;
  }

  async updatePost(id: string, data: Partial<{
    title: string; slug: string; excerpt: string; content: string;
    coverImage: string; categoryId: string; status: PostStatus; tagIds: string[];
  }>, workspaceId?: string) {
    if (workspaceId) {
      const existing = await this.prisma.blogPost.findFirst({ where: { id, workspaceId } });
      if (!existing) throw new NotFoundException('文章不存在或无权访问');
    }
    const { tagIds, ...rest } = data;
    const post = await this.prisma.blogPost.update({
      where: { id },
      data: {
        ...rest,
        tags: tagIds ? { set: tagIds.map((id) => ({ id })) } : undefined,
      },
      include: { category: true, tags: true },
    });
    this.eventEmitter.emit('search.index', new SearchIndexEvent('blog_post', id, 'update'));
    return post;
  }

  async deletePost(id: string, workspaceId?: string) {
    if (workspaceId) {
      const existing = await this.prisma.blogPost.findFirst({ where: { id, workspaceId } });
      if (!existing) throw new NotFoundException('文章不存在或无权访问');
    }
    await this.prisma.blogPost.delete({ where: { id } });
    this.eventEmitter.emit('search.index', new SearchIndexEvent('blog_post', id, 'delete'));
    return { message: '删除成功' };
  }

  // ─── Tags ───
  async findAllTags() {
    return this.tagRepo.findAll({
      orderBy: { name: 'asc' },
      include: { _count: { select: { posts: true } } },
      pageSize: 100,
    });
  }

  async createTag(data: { name: string; slug: string }) {
    return this.tagRepo.create(data);
  }

  async deleteTag(id: string) {
    return this.tagRepo.delete(id);
  }
}
