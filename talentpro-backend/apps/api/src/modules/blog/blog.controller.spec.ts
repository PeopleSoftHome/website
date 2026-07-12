import { Test, TestingModule } from '@nestjs/testing';
import { PostStatus, CommentStatus } from '@prisma/client';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { UserContext } from '@shared/types';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { CreateBlogTagDto } from './dto/create-blog-tag.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ModerateCommentDto } from './dto/moderate-comment.dto';
import { BatchModerateCommentsDto } from './dto/batch-moderate-comments.dto';
import { FindAdminCommentsDto } from './dto/find-admin-comments.dto';

describe('BlogController', () => {
  let controller: BlogController;
  let blogService: BlogService;

  const mockUser: UserContext = { id: 'u1', workspaceId: 'ws1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogController],
      providers: [
        {
          provide: BlogService,
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
            findComments: jest.fn(),
            createComment: jest.fn(),
            moderateComment: jest.fn(),
            batchModerateComments: jest.fn(),
            findCommentsForAdmin: jest.fn(),
            deleteComment: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BlogController>(BlogController);
    blogService = module.get<BlogService>(BlogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Categories', () => {
    it('findAllCategories should delegate to service', async () => {
      const expected = [{ id: 'c1', name: 'Tech' }];
      jest.spyOn(blogService, 'findAllCategories').mockResolvedValue(expected as unknown as ReturnType<BlogService['findAllCategories']>);

      const result = await controller.findAllCategories();

      expect(blogService.findAllCategories).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });

    it('createCategory should delegate to service', async () => {
      const dto: CreateBlogCategoryDto = { name: 'Tech', slug: 'tech', description: 'Technology' };
      const expected = { id: 'c1', ...dto };
      jest.spyOn(blogService, 'createCategory').mockResolvedValue(expected as unknown as ReturnType<BlogService['createCategory']>);

      const result = await controller.createCategory(dto);

      expect(blogService.createCategory).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });

    it('updateCategory should delegate to service', async () => {
      const dto: UpdateBlogCategoryDto = { name: 'Technology' };
      const expected = { id: 'c1', ...dto };
      jest.spyOn(blogService, 'updateCategory').mockResolvedValue(expected as unknown as ReturnType<BlogService['updateCategory']>);

      const result = await controller.updateCategory('c1', dto);

      expect(blogService.updateCategory).toHaveBeenCalledWith('c1', dto);
      expect(result).toEqual(expected);
    });

    it('deleteCategory should delegate to service', async () => {
      jest.spyOn(blogService, 'deleteCategory').mockResolvedValue({ message: 'Deleted successfully' });

      const result = await controller.deleteCategory('c1');

      expect(blogService.deleteCategory).toHaveBeenCalledWith('c1');
      expect(result).toEqual({ message: 'Deleted successfully' });
    });
  });

  describe('Posts', () => {
    it('findAllPosts should normalize pagination params and delegate', async () => {
      const expected = { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
      jest.spyOn(blogService, 'findAllPosts').mockResolvedValue(expected as unknown as ReturnType<BlogService['findAllPosts']>);

      const result = await controller.findAllPosts('1', '20', 'tech', PostStatus.PUBLISHED);

      expect(blogService.findAllPosts).toHaveBeenCalledWith(1, 20, 'tech', PostStatus.PUBLISHED);
      expect(result).toEqual(expected);
    });

    it('findAllPosts should coerce invalid page/pageSize to at least 1', async () => {
      jest.spyOn(blogService, 'findAllPosts').mockResolvedValue({} as unknown as ReturnType<BlogService['findAllPosts']>);

      await controller.findAllPosts('0', '-5', undefined, undefined);

      expect(blogService.findAllPosts).toHaveBeenCalledWith(1, 1, undefined, undefined);
    });

    it('findPostBySlug should delegate to service', async () => {
      const expected = { id: 'p1', title: 'Hello' };
      jest.spyOn(blogService, 'findPostBySlug').mockResolvedValue(expected as unknown as ReturnType<BlogService['findPostBySlug']>);

      const result = await controller.findPostBySlug('hello');

      expect(blogService.findPostBySlug).toHaveBeenCalledWith('hello');
      expect(result).toEqual(expected);
    });

    it('createPost should append authorId and workspaceId from current user', async () => {
      const dto: CreateBlogPostDto = {
        title: 'New Post',
        slug: 'new-post',
        content: 'Content',
        categoryId: 'c1',
      };
      const expected = { id: 'p1', ...dto, authorId: mockUser.id, workspaceId: mockUser.workspaceId };
      jest.spyOn(blogService, 'createPost').mockResolvedValue(expected as unknown as ReturnType<BlogService['createPost']>);

      const result = await controller.createPost(mockUser, dto);

      expect(blogService.createPost).toHaveBeenCalledWith({ ...dto, authorId: mockUser.id, workspaceId: mockUser.workspaceId });
      expect(result).toEqual(expected);
    });

    it('updatePost should delegate with id, dto and workspaceId', async () => {
      const dto: UpdateBlogPostDto = { title: 'Updated' };
      const expected = { id: 'p1', ...dto };
      jest.spyOn(blogService, 'updatePost').mockResolvedValue(expected as unknown as ReturnType<BlogService['updatePost']>);

      const result = await controller.updatePost('p1', mockUser, dto);

      expect(blogService.updatePost).toHaveBeenCalledWith('p1', dto, mockUser.workspaceId);
      expect(result).toEqual(expected);
    });

    it('deletePost should delegate with id and workspaceId', async () => {
      jest.spyOn(blogService, 'deletePost').mockResolvedValue({ message: 'Deleted successfully' });

      const result = await controller.deletePost('p1', mockUser);

      expect(blogService.deletePost).toHaveBeenCalledWith('p1', mockUser.workspaceId);
      expect(result).toEqual({ message: 'Deleted successfully' });
    });
  });

  describe('Tags', () => {
    it('findAllTags should delegate to service', async () => {
      const expected = [{ id: 't1', name: 'Vue' }];
      jest.spyOn(blogService, 'findAllTags').mockResolvedValue(expected as unknown as ReturnType<BlogService['findAllTags']>);

      const result = await controller.findAllTags();

      expect(blogService.findAllTags).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });

    it('createTag should delegate to service', async () => {
      const dto: CreateBlogTagDto = { name: 'Vue', slug: 'vue' };
      const expected = { id: 't1', ...dto };
      jest.spyOn(blogService, 'createTag').mockResolvedValue(expected as unknown as ReturnType<BlogService['createTag']>);

      const result = await controller.createTag(dto);

      expect(blogService.createTag).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });

    it('deleteTag should delegate to service', async () => {
      jest.spyOn(blogService, 'deleteTag').mockResolvedValue({ message: 'Deleted successfully' });

      const result = await controller.deleteTag('t1');

      expect(blogService.deleteTag).toHaveBeenCalledWith('t1');
      expect(result).toEqual({ message: 'Deleted successfully' });
    });
  });

  describe('Comments', () => {
    it('findComments should normalize pagination and delegate', async () => {
      const expected = { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
      jest.spyOn(blogService, 'findComments').mockResolvedValue(expected as unknown as ReturnType<BlogService['findComments']>);

      const result = await controller.findComments('BlogPost', 'p1', '2', '10');

      expect(blogService.findComments).toHaveBeenCalledWith('BlogPost', 'p1', 2, 10);
      expect(result).toEqual(expected);
    });

    it('createComment should append authorId from current user', async () => {
      const dto: CreateCommentDto = { entityType: 'BlogPost', entityId: 'p1', content: 'Nice' };
      const expected = { id: 'cm1', ...dto, authorId: mockUser.id };
      jest.spyOn(blogService, 'createComment').mockResolvedValue(expected as unknown as ReturnType<BlogService['createComment']>);

      const result = await controller.createComment(mockUser.id, dto);

      expect(blogService.createComment).toHaveBeenCalledWith({ ...dto, authorId: mockUser.id });
      expect(result).toEqual(expected);
    });

    it('moderateComment should delegate to service', async () => {
      const dto: ModerateCommentDto = { status: CommentStatus.APPROVED };
      const expected = { id: 'cm1', status: CommentStatus.APPROVED };
      jest.spyOn(blogService, 'moderateComment').mockResolvedValue(expected as unknown as ReturnType<BlogService['moderateComment']>);

      const result = await controller.moderateComment('cm1', dto);

      expect(blogService.moderateComment).toHaveBeenCalledWith('cm1', CommentStatus.APPROVED);
      expect(result).toEqual(expected);
    });

    it('batchModerateComments should delegate to service', async () => {
      const dto: BatchModerateCommentsDto = { ids: ['cm1', 'cm2'], status: CommentStatus.REJECTED };
      const expected = { updated: 2 };
      jest.spyOn(blogService, 'batchModerateComments').mockResolvedValue(expected as unknown as ReturnType<BlogService['batchModerateComments']>);

      const result = await controller.batchModerateComments(dto);

      expect(blogService.batchModerateComments).toHaveBeenCalledWith(dto.ids, CommentStatus.REJECTED);
      expect(result).toEqual(expected);
    });

    it('findCommentsForAdmin should forward query filters', async () => {
      const query: FindAdminCommentsDto = { status: CommentStatus.PENDING, entityType: 'BlogPost', page: 1, pageSize: 20 };
      const expected = { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
      jest.spyOn(blogService, 'findCommentsForAdmin').mockResolvedValue(expected as unknown as ReturnType<BlogService['findCommentsForAdmin']>);

      const result = await controller.findCommentsForAdmin(query);

      expect(blogService.findCommentsForAdmin).toHaveBeenCalledWith({
        status: query.status,
        entityType: query.entityType,
        page: query.page,
        pageSize: query.pageSize,
      });
      expect(result).toEqual(expected);
    });

    it('deleteComment should delegate to service', async () => {
      jest.spyOn(blogService, 'deleteComment').mockResolvedValue({ message: 'Deleted successfully' });

      const result = await controller.deleteComment('cm1');

      expect(blogService.deleteComment).toHaveBeenCalledWith('cm1');
      expect(result).toEqual({ message: 'Deleted successfully' });
    });
  });
});
