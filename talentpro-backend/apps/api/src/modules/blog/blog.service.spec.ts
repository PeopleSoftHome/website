import { Test, TestingModule } from '@nestjs/testing';
import { PostStatus, CommentStatus } from '@prisma/client';
import { BlogService } from './blog.service';
import { BlogPostService } from './blog-post.service';
import { BlogCommentService } from './blog-comment.service';
import { CommentModerationService } from './comment-moderation.service';

describe('BlogService', () => {
  let service: BlogService;
  let postService: BlogPostService;
  let commentService: BlogCommentService;
  let moderationService: CommentModerationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: BlogPostService,
          useValue: {
            findAllCategories: jest.fn(),
            createCategory: jest.fn(),
            updateCategory: jest.fn(),
            deleteCategory: jest.fn(),
            findAllPosts: jest.fn(),
            findPostBySlug: jest.fn(),
            createPost: jest.fn(),
            updatePost: jest.fn(),
            deletePost: jest.fn(),
            findAllTags: jest.fn(),
            createTag: jest.fn(),
            deleteTag: jest.fn(),
          },
        },
        {
          provide: BlogCommentService,
          useValue: {
            findComments: jest.fn(),
            createComment: jest.fn(),
            deleteComment: jest.fn(),
          },
        },
        {
          provide: CommentModerationService,
          useValue: {
            moderateComment: jest.fn(),
            batchModerateComments: jest.fn(),
            findCommentsForAdmin: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    postService = module.get<BlogPostService>(BlogPostService);
    commentService = module.get<BlogCommentService>(BlogCommentService);
    moderationService = module.get<CommentModerationService>(CommentModerationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Categories delegation', () => {
    it('findAllCategories delegates to postService', async () => {
      const expected = [{ id: 'c1' }];
      jest.spyOn(postService, 'findAllCategories').mockResolvedValue(expected as unknown as ReturnType<BlogPostService['findAllCategories']>);

      const result = await service.findAllCategories();

      expect(postService.findAllCategories).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });

    it('createCategory delegates to postService', async () => {
      const dto = { name: 'Tech', slug: 'tech' };
      jest.spyOn(postService, 'createCategory').mockResolvedValue(dto as unknown as ReturnType<BlogPostService['createCategory']>);

      const result = await service.createCategory(dto);

      expect(postService.createCategory).toHaveBeenCalledWith(dto);
      expect(result).toEqual(dto);
    });

    it('updateCategory delegates to postService', async () => {
      const dto = { name: 'Technology' };
      jest.spyOn(postService, 'updateCategory').mockResolvedValue(dto as unknown as ReturnType<BlogPostService['updateCategory']>);

      const result = await service.updateCategory('c1', dto);

      expect(postService.updateCategory).toHaveBeenCalledWith('c1', dto);
      expect(result).toEqual(dto);
    });

    it('deleteCategory delegates to postService', async () => {
      jest.spyOn(postService, 'deleteCategory').mockResolvedValue({ message: 'Deleted successfully' });

      const result = await service.deleteCategory('c1');

      expect(postService.deleteCategory).toHaveBeenCalledWith('c1');
      expect(result).toEqual({ message: 'Deleted successfully' });
    });
  });

  describe('Posts delegation', () => {
    it('findAllPosts forwards all parameters', async () => {
      const expected = { data: [] };
      jest.spyOn(postService, 'findAllPosts').mockResolvedValue(expected as unknown as ReturnType<BlogPostService['findAllPosts']>);

      const result = await service.findAllPosts(1, 10, 'tech', PostStatus.PUBLISHED);

      expect(postService.findAllPosts).toHaveBeenCalledWith(1, 10, 'tech', PostStatus.PUBLISHED);
      expect(result).toEqual(expected);
    });

    it('findPostBySlug delegates to postService', async () => {
      const expected = { id: 'p1' };
      jest.spyOn(postService, 'findPostBySlug').mockResolvedValue(expected as unknown as ReturnType<BlogPostService['findPostBySlug']>);

      const result = await service.findPostBySlug('slug');

      expect(postService.findPostBySlug).toHaveBeenCalledWith('slug');
      expect(result).toEqual(expected);
    });

    it('createPost delegates to postService', async () => {
      const dto = { title: 'T', slug: 't', content: 'c', authorId: 'u1', categoryId: 'c1' };
      jest.spyOn(postService, 'createPost').mockResolvedValue(dto as unknown as ReturnType<BlogPostService['createPost']>);

      const result = await service.createPost(dto as Parameters<BlogPostService['createPost']>[0]);

      expect(postService.createPost).toHaveBeenCalledWith(dto);
      expect(result).toEqual(dto);
    });

    it('updatePost delegates to postService with workspaceId', async () => {
      const dto = { title: 'Updated' };
      jest.spyOn(postService, 'updatePost').mockResolvedValue(dto as unknown as ReturnType<BlogPostService['updatePost']>);

      const result = await service.updatePost('p1', dto, 'ws1');

      expect(postService.updatePost).toHaveBeenCalledWith('p1', dto, 'ws1');
      expect(result).toEqual(dto);
    });

    it('deletePost delegates to postService with workspaceId', async () => {
      jest.spyOn(postService, 'deletePost').mockResolvedValue({ message: 'Deleted successfully' });

      const result = await service.deletePost('p1', 'ws1');

      expect(postService.deletePost).toHaveBeenCalledWith('p1', 'ws1');
      expect(result).toEqual({ message: 'Deleted successfully' });
    });
  });

  describe('Tags delegation', () => {
    it('findAllTags delegates to postService', async () => {
      const expected = [{ id: 't1' }];
      jest.spyOn(postService, 'findAllTags').mockResolvedValue(expected as unknown as ReturnType<BlogPostService['findAllTags']>);

      const result = await service.findAllTags();

      expect(postService.findAllTags).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });

    it('createTag delegates to postService', async () => {
      const dto = { name: 'Vue', slug: 'vue' };
      jest.spyOn(postService, 'createTag').mockResolvedValue(dto as unknown as ReturnType<BlogPostService['createTag']>);

      const result = await service.createTag(dto);

      expect(postService.createTag).toHaveBeenCalledWith(dto);
      expect(result).toEqual(dto);
    });

    it('deleteTag delegates to postService', async () => {
      jest.spyOn(postService, 'deleteTag').mockResolvedValue({ message: 'Deleted successfully' });

      const result = await service.deleteTag('t1');

      expect(postService.deleteTag).toHaveBeenCalledWith('t1');
      expect(result).toEqual({ message: 'Deleted successfully' });
    });
  });

  describe('Comments delegation', () => {
    it('findComments delegates to commentService', async () => {
      const expected = { data: [] };
      jest.spyOn(commentService, 'findComments').mockResolvedValue(expected as unknown as ReturnType<BlogCommentService['findComments']>);

      const result = await service.findComments('BlogPost', 'p1', 1, 20);

      expect(commentService.findComments).toHaveBeenCalledWith('BlogPost', 'p1', 1, 20);
      expect(result).toEqual(expected);
    });

    it('createComment delegates to commentService', async () => {
      const dto = { entityType: 'BlogPost', entityId: 'p1', content: 'Nice', authorId: 'u1' };
      jest.spyOn(commentService, 'createComment').mockResolvedValue(dto as unknown as ReturnType<BlogCommentService['createComment']>);

      const result = await service.createComment(dto as Parameters<BlogCommentService['createComment']>[0]);

      expect(commentService.createComment).toHaveBeenCalledWith(dto);
      expect(result).toEqual(dto);
    });

    it('deleteComment delegates to commentService', async () => {
      jest.spyOn(commentService, 'deleteComment').mockResolvedValue({ message: 'Deleted successfully' });

      const result = await service.deleteComment('cm1');

      expect(commentService.deleteComment).toHaveBeenCalledWith('cm1');
      expect(result).toEqual({ message: 'Deleted successfully' });
    });
  });

  describe('Moderation delegation', () => {
    it('moderateComment delegates to moderationService', async () => {
      const expected = { id: 'cm1', status: CommentStatus.APPROVED };
      jest.spyOn(moderationService, 'moderateComment').mockResolvedValue(expected as unknown as ReturnType<CommentModerationService['moderateComment']>);

      const result = await service.moderateComment('cm1', CommentStatus.APPROVED);

      expect(moderationService.moderateComment).toHaveBeenCalledWith('cm1', CommentStatus.APPROVED);
      expect(result).toEqual(expected);
    });

    it('batchModerateComments delegates to moderationService', async () => {
      const expected = { updated: 2 };
      jest.spyOn(moderationService, 'batchModerateComments').mockResolvedValue(expected as unknown as ReturnType<CommentModerationService['batchModerateComments']>);

      const result = await service.batchModerateComments(['cm1', 'cm2'], CommentStatus.REJECTED);

      expect(moderationService.batchModerateComments).toHaveBeenCalledWith(['cm1', 'cm2'], CommentStatus.REJECTED);
      expect(result).toEqual(expected);
    });

    it('findCommentsForAdmin delegates to moderationService', async () => {
      const expected = { data: [] };
      const filters = { status: CommentStatus.PENDING, entityType: 'BlogPost', page: 1, pageSize: 20 };
      jest.spyOn(moderationService, 'findCommentsForAdmin').mockResolvedValue(expected as unknown as ReturnType<CommentModerationService['findCommentsForAdmin']>);

      const result = await service.findCommentsForAdmin(filters);

      expect(moderationService.findCommentsForAdmin).toHaveBeenCalledWith(filters);
      expect(result).toEqual(expected);
    });
  });
});
