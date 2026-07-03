import { Test, TestingModule } from '@nestjs/testing';
import { ForumService } from './forum.service';
import { ForumTopicService } from './forum-topic.service';
import { ForumPostService } from './forum-post.service';

describe('ForumService', () => {
  let service: ForumService;
  let topicService: ForumTopicService;
  let postService: ForumPostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForumService,
        {
          provide: ForumTopicService,
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
          },
        },
        {
          provide: ForumPostService,
          useValue: {
            createPost: jest.fn(),
            updatePost: jest.fn(),
            deletePost: jest.fn(),
            markAsSolution: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ForumService>(ForumService);
    topicService = module.get<ForumTopicService>(ForumTopicService);
    postService = module.get<ForumPostService>(ForumPostService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Categories delegation', () => {
    it('findAllCategories delegates to topicService', async () => {
      const expected = [{ id: 'c1' }];
      jest.spyOn(topicService, 'findAllCategories').mockResolvedValue(expected as unknown as ReturnType<ForumTopicService['findAllCategories']>);

      const result = await service.findAllCategories();

      expect(topicService.findAllCategories).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });

    it('createCategory delegates to topicService', async () => {
      const dto = { name: 'General' };
      jest.spyOn(topicService, 'createCategory').mockResolvedValue(dto as unknown as ReturnType<ForumTopicService['createCategory']>);

      const result = await service.createCategory(dto as Parameters<ForumTopicService['createCategory']>[0]);

      expect(topicService.createCategory).toHaveBeenCalledWith(dto);
      expect(result).toEqual(dto);
    });

    it('updateCategory delegates to topicService', async () => {
      const dto = { name: 'General Discussion' };
      jest.spyOn(topicService, 'updateCategory').mockResolvedValue(dto as unknown as ReturnType<ForumTopicService['updateCategory']>);

      const result = await service.updateCategory('c1', dto as Parameters<ForumTopicService['updateCategory']>[1]);

      expect(topicService.updateCategory).toHaveBeenCalledWith('c1', dto);
      expect(result).toEqual(dto);
    });

    it('deleteCategory delegates to topicService', async () => {
      jest.spyOn(topicService, 'deleteCategory').mockResolvedValue({ message: '删除成功' });

      const result = await service.deleteCategory('c1');

      expect(topicService.deleteCategory).toHaveBeenCalledWith('c1');
      expect(result).toEqual({ message: '删除成功' });
    });
  });

  describe('Topics delegation', () => {
    it('findAllTopics forwards all parameters', async () => {
      const expected = { data: [] };
      jest.spyOn(topicService, 'findAllTopics').mockResolvedValue(expected as unknown as ReturnType<ForumTopicService['findAllTopics']>);

      const result = await service.findAllTopics(1, 20, 'c1');

      expect(topicService.findAllTopics).toHaveBeenCalledWith(1, 20, 'c1');
      expect(result).toEqual(expected);
    });

    it('findTopicById forwards workspaceId', async () => {
      const expected = { id: 't1' };
      jest.spyOn(topicService, 'findTopicById').mockResolvedValue(expected as unknown as ReturnType<ForumTopicService['findTopicById']>);

      const result = await service.findTopicById('t1', 'ws1');

      expect(topicService.findTopicById).toHaveBeenCalledWith('t1', 'ws1');
      expect(result).toEqual(expected);
    });

    it('createTopic delegates to topicService', async () => {
      const dto = { categoryId: 'c1', authorId: 'u1', title: 'T', content: 'C' };
      jest.spyOn(topicService, 'createTopic').mockResolvedValue(dto as unknown as ReturnType<ForumTopicService['createTopic']>);

      const result = await service.createTopic(dto as Parameters<ForumTopicService['createTopic']>[0]);

      expect(topicService.createTopic).toHaveBeenCalledWith(dto);
      expect(result).toEqual(dto);
    });

    it('updateTopic forwards workspaceId', async () => {
      const dto = { title: 'Updated' };
      jest.spyOn(topicService, 'updateTopic').mockResolvedValue(dto as unknown as ReturnType<ForumTopicService['updateTopic']>);

      const result = await service.updateTopic('t1', dto, 'ws1');

      expect(topicService.updateTopic).toHaveBeenCalledWith('t1', dto, 'ws1');
      expect(result).toEqual(dto);
    });

    it('deleteTopic forwards workspaceId', async () => {
      jest.spyOn(topicService, 'deleteTopic').mockResolvedValue({ message: '删除成功' });

      const result = await service.deleteTopic('t1', 'ws1');

      expect(topicService.deleteTopic).toHaveBeenCalledWith('t1', 'ws1');
      expect(result).toEqual({ message: '删除成功' });
    });

    it('togglePin delegates to topicService', async () => {
      const expected = { id: 't1', isPinned: true };
      jest.spyOn(topicService, 'togglePin').mockResolvedValue(expected as unknown as ReturnType<ForumTopicService['togglePin']>);

      const result = await service.togglePin('t1', true);

      expect(topicService.togglePin).toHaveBeenCalledWith('t1', true);
      expect(result).toEqual(expected);
    });

    it('toggleLock delegates to topicService', async () => {
      const expected = { id: 't1', isLocked: true };
      jest.spyOn(topicService, 'toggleLock').mockResolvedValue(expected as unknown as ReturnType<ForumTopicService['toggleLock']>);

      const result = await service.toggleLock('t1', true);

      expect(topicService.toggleLock).toHaveBeenCalledWith('t1', true);
      expect(result).toEqual(expected);
    });
  });

  describe('Posts delegation', () => {
    it('createPost delegates to postService', async () => {
      const dto = { topicId: 't1', authorId: 'u1', content: 'Reply' };
      jest.spyOn(postService, 'createPost').mockResolvedValue(dto as unknown as ReturnType<ForumPostService['createPost']>);

      const result = await service.createPost(dto as Parameters<ForumPostService['createPost']>[0]);

      expect(postService.createPost).toHaveBeenCalledWith(dto);
      expect(result).toEqual(dto);
    });

    it('updatePost forwards workspaceId', async () => {
      const dto = { content: 'Updated' };
      jest.spyOn(postService, 'updatePost').mockResolvedValue(dto as unknown as ReturnType<ForumPostService['updatePost']>);

      const result = await service.updatePost('p1', dto, 'ws1');

      expect(postService.updatePost).toHaveBeenCalledWith('p1', dto, 'ws1');
      expect(result).toEqual(dto);
    });

    it('deletePost forwards workspaceId', async () => {
      jest.spyOn(postService, 'deletePost').mockResolvedValue({ message: '删除成功' });

      const result = await service.deletePost('p1', 'ws1');

      expect(postService.deletePost).toHaveBeenCalledWith('p1', 'ws1');
      expect(result).toEqual({ message: '删除成功' });
    });

    it('markAsSolution delegates to postService', async () => {
      const expected = { id: 'p1', isSolution: true };
      jest.spyOn(postService, 'markAsSolution').mockResolvedValue(expected as unknown as ReturnType<ForumPostService['markAsSolution']>);

      const result = await service.markAsSolution('p1');

      expect(postService.markAsSolution).toHaveBeenCalledWith('p1');
      expect(result).toEqual(expected);
    });
  });
});
