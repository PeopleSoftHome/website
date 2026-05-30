import { Injectable } from '@nestjs/common';
import { BlogPostService } from './blog-post.service';
import { BlogCommentService } from './blog-comment.service';
import { CommentModerationService } from './comment-moderation.service';
import { PostStatus, CommentStatus } from '@prisma/client';

/**
 * BlogService — Facade
 * 组合 Post / Comment / Moderation 三个子服务，对外保持统一接口
 */
@Injectable()
export class BlogService {
  constructor(
    private postService: BlogPostService,
    private commentService: BlogCommentService,
    private moderationService: CommentModerationService,
  ) {}

  // ─── Categories (delegate to PostService) ───
  findAllCategories() { return this.postService.findAllCategories(); }
  createCategory(data: { name: string; slug: string; description?: string }) { return this.postService.createCategory(data); }
  updateCategory(id: string, data: Partial<{ name: string; description?: string; sortOrder: number }>) { return this.postService.updateCategory(id, data); }
  deleteCategory(id: string) { return this.postService.deleteCategory(id); }

  // ─── Posts (delegate to PostService) ───
  findAllPosts(page?: number, pageSize?: number, categorySlug?: string, status?: PostStatus) {
    return this.postService.findAllPosts(page, pageSize, categorySlug, status);
  }
  findPostBySlug(slug: string) { return this.postService.findPostBySlug(slug); }
  createPost(data: Parameters<BlogPostService['createPost']>[0]) { return this.postService.createPost(data); }
  updatePost(id: string, data: Parameters<BlogPostService['updatePost']>[1], workspaceId?: string) { return this.postService.updatePost(id, data, workspaceId); }
  deletePost(id: string, workspaceId?: string) { return this.postService.deletePost(id, workspaceId); }

  // ─── Tags (delegate to PostService) ───
  findAllTags() { return this.postService.findAllTags(); }
  createTag(data: { name: string; slug: string }) { return this.postService.createTag(data); }
  deleteTag(id: string) { return this.postService.deleteTag(id); }

  // ─── Comments (delegate to CommentService) ───
  findComments(entityType: string, entityId: string, page?: number, pageSize?: number) {
    return this.commentService.findComments(entityType, entityId, page, pageSize);
  }
  createComment(data: Parameters<BlogCommentService['createComment']>[0]) { return this.commentService.createComment(data); }
  deleteComment(id: string) { return this.commentService.deleteComment(id); }

  // ─── Moderation (delegate to ModerationService) ───
  moderateComment(id: string, status: CommentStatus) { return this.moderationService.moderateComment(id, status); }
  batchModerateComments(ids: string[], status: CommentStatus) { return this.moderationService.batchModerateComments(ids, status); }
  findCommentsForAdmin(filters: Parameters<CommentModerationService['findCommentsForAdmin']>[0]) {
    return this.moderationService.findCommentsForAdmin(filters);
  }
}
