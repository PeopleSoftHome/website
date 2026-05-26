import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PostStatus, CommentStatus } from '@prisma/client';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) {}

  // ─── Categories ───
  async findAllCategories() {
    return this.prisma.blogCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { posts: true } } },
    });
  }

  async createCategory(data: { name: string; slug: string; description?: string }) {
    return this.prisma.blogCategory.create({ data });
  }

  async updateCategory(id: string, data: Partial<{ name: string; description?: string; sortOrder: number }>) {
    return this.prisma.blogCategory.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    await this.prisma.blogCategory.delete({ where: { id } });
    return { message: '删除成功' };
  }

  // ─── Posts ───
  async findAllPosts(page = 1, pageSize = 20, categorySlug?: string, status?: PostStatus) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
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
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findPostBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        category: true,
        author: { select: { id: true, name: true, avatar: true } },
        tags: true,
      },
    });
    if (!post) throw new NotFoundException('文章不存在');
    // 增加浏览量
    await this.prisma.blogPost.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
    const comments = await this.prisma.comment.findMany({
      where: { entityType: 'BlogPost', entityId: post.id, status: CommentStatus.APPROVED, parentId: null },
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
  }) {
    const { tagIds, ...rest } = data;
    return this.prisma.blogPost.create({
      data: {
        ...rest,
        status: rest.status || PostStatus.DRAFT,
        tags: tagIds ? { connect: tagIds.map((id) => ({ id })) } : undefined,
      },
      include: { category: true, tags: true },
    });
  }

  async updatePost(id: string, data: Partial<{
    title: string; slug: string; excerpt: string; content: string;
    coverImage: string; categoryId: string; status: PostStatus; tagIds: string[];
  }>) {
    const { tagIds, ...rest } = data;
    return this.prisma.blogPost.update({
      where: { id },
      data: {
        ...rest,
        tags: tagIds ? { set: tagIds.map((id) => ({ id })) } : undefined,
      },
      include: { category: true, tags: true },
    });
  }

  async deletePost(id: string) {
    await this.prisma.blogPost.delete({ where: { id } });
    return { message: '删除成功' };
  }

  // ─── Tags ───
  async findAllTags() {
    return this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { posts: true } } },
    });
  }

  async createTag(data: { name: string; slug: string }) {
    return this.prisma.tag.create({ data });
  }

  async deleteTag(id: string) {
    await this.prisma.tag.delete({ where: { id } });
    return { message: '删除成功' };
  }

  // ─── Comments ───
  async findComments(entityType: string, entityId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
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
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async createComment(data: {
    entityType: string;
    entityId: string;
    authorId: string;
    content: string;
    parentId?: string;
  }) {
    return this.prisma.comment.create({
      data: {
        ...data,
        status: CommentStatus.PENDING,
      },
      include: { author: { select: { id: true, name: true, avatar: true } } },
    });
  }

  async moderateComment(id: string, status: CommentStatus) {
    return this.prisma.comment.update({ where: { id }, data: { status } });
  }

  async deleteComment(id: string) {
    await this.prisma.comment.delete({ where: { id } });
    return { message: '删除成功' };
  }
}
