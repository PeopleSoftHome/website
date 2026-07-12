import { Injectable } from '@nestjs/common';
import { ForumTopicService } from './forum-topic.service';
import { ForumPostService } from './forum-post.service';

/**
 * ForumService — Facade
 * 组合 Topic / Post 两个子服务，对外保持统一接口
 */
@Injectable()
export class ForumService {
  constructor(
    private topicService: ForumTopicService,
    private postService: ForumPostService,
  ) {}

  // ─── Categories (delegate) ───
  findAllCategories() { return this.topicService.findAllCategories(); }
  createCategory(data: Parameters<ForumTopicService['createCategory']>[0]) { return this.topicService.createCategory(data); }
  updateCategory(id: string, data: Parameters<ForumTopicService['updateCategory']>[1]) { return this.topicService.updateCategory(id, data); }
  deleteCategory(id: string) { return this.topicService.deleteCategory(id); }

  // ─── Topics (delegate) ───
  findAllTopics(page?: number, pageSize?: number, categoryId?: string) { return this.topicService.findAllTopics(page, pageSize, categoryId); }
  findTopicById(id: string, workspaceId?: string) { return this.topicService.findTopicById(id, workspaceId); }
  createTopic(data: Parameters<ForumTopicService['createTopic']>[0]) { return this.topicService.createTopic(data); }
  updateTopic(id: string, data: Parameters<ForumTopicService['updateTopic']>[1], workspaceId?: string) { return this.topicService.updateTopic(id, data, workspaceId); }
  deleteTopic(id: string, workspaceId?: string) { return this.topicService.deleteTopic(id, workspaceId); }
  togglePin(id: string, isPinned: boolean) { return this.topicService.togglePin(id, isPinned); }
  toggleLock(id: string, isLocked: boolean) { return this.topicService.toggleLock(id, isLocked); }

  // ─── Posts (delegate) ───
  createPost(data: Parameters<ForumPostService['createPost']>[0]) { return this.postService.createPost(data); }
  updatePost(id: string, data: Parameters<ForumPostService['updatePost']>[1], workspaceId?: string) { return this.postService.updatePost(id, data, workspaceId); }
  deletePost(id: string, workspaceId?: string) { return this.postService.deletePost(id, workspaceId); }
  markAsSolution(postId: string) { return this.postService.markAsSolution(postId); }
}
