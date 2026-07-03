import { Test, TestingModule } from '@nestjs/testing';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

describe('NewsController', () => {
  let controller: NewsController;
  let newsService: NewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [
        {
          provide: NewsService,
          useValue: {
            findAll: jest.fn(),
            findCategories: jest.fn(),
            findBySlug: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<NewsController>(NewsController);
    newsService = module.get<NewsService>(NewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /news', () => {
    it('should call newsService.findAll with parsed params', async () => {
      const mockResult = { data: [{ id: 'n1', title: 'News A' }], meta: { page: 2, pageSize: 10, total: 1, totalPages: 1 } };
      jest.spyOn(newsService, 'findAll').mockResolvedValue(mockResult as unknown as ReturnType<NewsService['findAll']>);

      const result = await controller.findAll('product', '2', '10');

      expect(newsService.findAll).toHaveBeenCalledWith('product', 2, 10);
      expect(result).toEqual(mockResult);
    });

    it('should use default pagination when query omitted', async () => {
      jest.spyOn(newsService, 'findAll').mockResolvedValue({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } } as unknown as ReturnType<NewsService['findAll']>);

      await controller.findAll();

      expect(newsService.findAll).toHaveBeenCalledWith(undefined, 1, 20);
    });
  });

  describe('GET /news/categories', () => {
    it('should call newsService.findCategories', async () => {
      const mockCategories = [{ name: 'company', count: 4 }];
      jest.spyOn(newsService, 'findCategories').mockResolvedValue(mockCategories as unknown as ReturnType<NewsService['findCategories']>);

      const result = await controller.findCategories();

      expect(newsService.findCategories).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });
  });

  describe('GET /news/:slug', () => {
    it('should call newsService.findBySlug', async () => {
      const mockNewsItem = { id: 'n1', slug: 'news-a', title: 'News A' };
      jest.spyOn(newsService, 'findBySlug').mockResolvedValue(mockNewsItem as unknown as ReturnType<NewsService['findBySlug']>);

      const result = await controller.findBySlug('news-a');

      expect(newsService.findBySlug).toHaveBeenCalledWith('news-a');
      expect(result).toEqual(mockNewsItem);
    });
  });
});
