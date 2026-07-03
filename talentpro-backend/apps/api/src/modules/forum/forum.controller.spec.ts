import { Test, TestingModule } from '@nestjs/testing';
import { ForumController } from './forum.controller';
import { ForumService } from './forum.service';
import { UserContext } from '@/common/types';
import { CreateForumTopicDto } from './dto/create-forum-topic.dto';
import { UpdateForumTopicDto } from './dto/update-forum-topic.dto';
import { CreateForumPostDto } from './dto/create-forum-post.dto';
import { UpdateForumPostDto } from './dto/update-forum-post.dto';
import { CreateForumCategoryDto } from './dto/create-forum-category.dto';
import { UpdateForumCategoryDto } from './dto/update-forum-category.dto';
import { TogglePinDto } from './dto/toggle-pin.dto';
import { ToggleLockDto } from './dto/toggle-lock.dto';

describe('ForumController', () => {
  let controller: ForumController;
  let forumService: ForumService;

  const mockUser: UserContext = { id: 'u1', workspaceId: 'ws1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumController],
      providers: [
        {
          provide: ForumService,
          useValue: {
            findAllCategories: jest.fn(),
            createCategory: jest.fn(),
            updateCategory: jest.fn(),
            deleteCategory: jest.fn(),
            findAllTopics: jest.fn(),
            findTopicById: jest.fn(),
            createTopic: jest.fn(),
            updateTopic: jest.fn(),
            deleteTopic: jest.fn(),
            togglePin: jest.fn(),
            toggleLock: jest.fn(),
            createPost: jest.fn(),
            updatePost: jest.fn(),
            deletePost: jest.fn(),
            markAsSolution: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ForumController>(ForumController);
    forumService = module.get<ForumService>(ForumService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Categories', () => {
    it('findAllCategories should delegate to service', async () => {
      const expected = [{ id: 'c1', name: 'General' }];
      jest.spyOn(forumService, 'findAllCategories').mockResolvedValue(expected as unknown as ReturnType<ForumService['findAllCategories']>);

      const result = await controller.findAllCategories();

      expect(forumService.findAllCategories).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });

    it('createCategory should delegate to service', async () => {
      const dto: CreateForumCategoryDto = { name: 'General', description: 'General discussion', sortOrder: 1 };
      const expected = { id: 'c1', ...dto };
      jest.spyOn(forumService, 'createCategory').mockResolvedValue(expected as unknown as ReturnType<ForumService['createCategory']>);

      const result = await controller.createCategory(dto);

      expect(forumService.createCategory).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });

    it('updateCategory should delegate to service', async () => {
      const dto: UpdateForumCategoryDto = { name: 'General Discussion' };
      const expected = { id: 'c1', ...dto };
      jest.spyOn(forumService, 'updateCategory').mockResolvedValue(expected as unknown as ReturnType<ForumService['updateCategory']>);

      const result = await controller.updateCategory('c1', dto);

      expect(forumService.updateCategory).toHaveBeenCalledWith('c1', dto);
      expect(result).toEqual(expected);
    });

    it('deleteCategory should delegate to service', async () => {
      jest.spyOn(forumService, 'deleteCategory').mockResolvedValue({ message: '删除成功' });

      const result = await controller.deleteCategory('c1');

      expect(forumService.deleteCategory).toHaveBeenCalledWith('c1');
      expect(result).toEqual({ message: '删除成功' });
    });
  });

  describe('Topics', () => {
    it('findAllTopics should normalize pagination and delegate', async () => {
      const expected = { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
      jest.spyOn(forumService, 'findAllTopics').mockResolvedValue(expected as unknown as ReturnType<ForumService['findAllTopics']>);

      const result = await controller.findAllTopics('1', '20', 'c1');

      expect(forumService.findAllTopics).toHaveBeenCalledWith(1, 20, 'c1');
      expect(result).toEqual(expected);
    });

    it('findAllTopics should coerce invalid page to at least 1 and use default pageSize when 0', async () => {
      jest.spyOn(forumService, 'findAllTopics').mockResolvedValue({} as unknown as ReturnType<ForumService['findAllTopics']>);

      await controller.findAllTopics('-1', '0', undefined);

      expect(forumService.findAllTopics).toHaveBeenCalledWith(1, 20, undefined);
    });

    it('findTopicById should delegate with workspaceId when user present', async () => {
      const expected = { id: 't1', title: 'Welcome' };
      jest.spyOn(forumService, 'findTopicById').mockResolvedValue(expected as unknown as ReturnType<ForumService['findTopicById']>);

      const result = await controller.findTopicById('t1', mockUser);

      expect(forumService.findTopicById).toHaveBeenCalledWith('t1', mockUser.workspaceId);
      expect(result).toEqual(expected);
    });

    it('findTopicById should delegate without workspaceId when user absent', async () => {
      const expected = { id: 't1', title: 'Welcome' };
      jest.spyOn(forumService, 'findTopicById').mockResolvedValue(expected as unknown as ReturnType<ForumService['findTopicById']>);

      const result = await controller.findTopicById('t1', undefined);

      expect(forumService.findTopicById).toHaveBeenCalledWith('t1', undefined);
      expect(result).toEqual(expected);
    });

    it('createTopic should append authorId and workspaceId from current user', async () => {
      const dto: CreateForumTopicDto = { categoryId: 'c1', title: 'Hello', content: 'World' };
      const expected = { id: 't1', ...dto, authorId: mockUser.id, workspaceId: mockUser.workspaceId };
      jest.spyOn(forumService, 'createTopic').mockResolvedValue(expected as unknown as ReturnType<ForumService['createTopic']>);

      const result = await controller.createTopic(mockUser, dto);

      expect(forumService.createTopic).toHaveBeenCalledWith({ ...dto, authorId: mockUser.id, workspaceId: mockUser.workspaceId });
      expect(result).toEqual(expected);
    });

    it('updateTopic should delegate with id, dto and workspaceId', async () => {
      const dto: UpdateForumTopicDto = { title: 'Updated' };
      const expected = { id: 't1', ...dto };
      jest.spyOn(forumService, 'updateTopic').mockResolvedValue(expected as unknown as ReturnType<ForumService['updateTopic']>);

      const result = await controller.updateTopic('t1', mockUser, dto);

      expect(forumService.updateTopic).toHaveBeenCalledWith('t1', dto, mockUser.workspaceId);
      expect(result).toEqual(expected);
    });

    it('deleteTopic should delegate with id and workspaceId', async () => {
      jest.spyOn(forumService, 'deleteTopic').mockResolvedValue({ message: '删除成功' });

      const result = await controller.deleteTopic('t1', mockUser);

      expect(forumService.deleteTopic).toHaveBeenCalledWith('t1', mockUser.workspaceId);
      expect(result).toEqual({ message: '删除成功' });
    });

    it('togglePin should delegate to service', async () => {
      const dto: TogglePinDto = { isPinned: true };
      const expected = { id: 't1', isPinned: true };
      jest.spyOn(forumService, 'togglePin').mockResolvedValue(expected as unknown as ReturnType<ForumService['togglePin']>);

      const result = await controller.togglePin('t1', dto);

      expect(forumService.togglePin).toHaveBeenCalledWith('t1', true);
      expect(result).toEqual(expected);
    });

    it('toggleLock should delegate to service', async () => {
      const dto: ToggleLockDto = { isLocked: true };
      const expected = { id: 't1', isLocked: true };
      jest.spyOn(forumService, 'toggleLock').mockResolvedValue(expected as unknown as ReturnType<ForumService['toggleLock']>);

      const result = await controller.toggleLock('t1', dto);

      expect(forumService.toggleLock).toHaveBeenCalledWith('t1', true);
      expect(result).toEqual(expected);
    });
  });

  describe('Posts', () => {
    it('createPost should append authorId and workspaceId from current user', async () => {
      const dto: CreateForumPostDto = { topicId: 't1', content: 'Reply' };
      const expected = { id: 'p1', ...dto, authorId: mockUser.id, workspaceId: mockUser.workspaceId };
      jest.spyOn(forumService, 'createPost').mockResolvedValue(expected as unknown as ReturnType<ForumService['createPost']>);

      const result = await controller.createPost(mockUser, dto);

      expect(forumService.createPost).toHaveBeenCalledWith({ ...dto, authorId: mockUser.id, workspaceId: mockUser.workspaceId });
      expect(result).toEqual(expected);
    });

    it('updatePost should delegate with id, dto and workspaceId', async () => {
      const dto: UpdateForumPostDto = { content: 'Updated reply' };
      const expected = { id: 'p1', ...dto };
      jest.spyOn(forumService, 'updatePost').mockResolvedValue(expected as unknown as ReturnType<ForumService['updatePost']>);

      const result = await controller.updatePost('p1', mockUser, dto);

      expect(forumService.updatePost).toHaveBeenCalledWith('p1', dto, mockUser.workspaceId);
      expect(result).toEqual(expected);
    });

    it('deletePost should delegate with id and workspaceId', async () => {
      jest.spyOn(forumService, 'deletePost').mockResolvedValue({ message: '删除成功' });

      const result = await controller.deletePost('p1', mockUser);

      expect(forumService.deletePost).toHaveBeenCalledWith('p1', mockUser.workspaceId);
      expect(result).toEqual({ message: '删除成功' });
    });

    it('markAsSolution should delegate to service', async () => {
      const expected = { id: 'p1', isSolution: true };
      jest.spyOn(forumService, 'markAsSolution').mockResolvedValue(expected as unknown as ReturnType<ForumService['markAsSolution']>);

      const result = await controller.markAsSolution('p1');

      expect(forumService.markAsSolution).toHaveBeenCalledWith('p1');
      expect(result).toEqual(expected);
    });
  });
});
