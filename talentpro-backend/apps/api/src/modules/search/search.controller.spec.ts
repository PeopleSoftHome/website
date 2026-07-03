import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

describe('SearchController', () => {
  let controller: SearchController;
  let service: SearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: {
            search: jest.fn(),
            suggest: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    service = module.get<SearchService>(SearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /search', () => {
    it('should search and wrap results with meta', async () => {
      const results = [{ type: 'post', id: '1', title: 'Hello' }];
      jest.spyOn(service, 'search').mockResolvedValue(results as any);

      const result = await controller.search('hello', 'post', '10');

      expect(service.search).toHaveBeenCalledWith('hello', { type: 'post', limit: 10 });
      expect(result).toEqual({ data: results, meta: { query: 'hello', count: 1 } });
    });

    it('should default limit to 20', async () => {
      jest.spyOn(service, 'search').mockResolvedValue([] as any);

      await controller.search('hello', undefined, undefined);

      expect(service.search).toHaveBeenCalledWith('hello', { type: undefined, limit: 20 });
    });
  });

  describe('GET /search/suggestions', () => {
    it('should return suggestions', async () => {
      jest.spyOn(service, 'suggest').mockResolvedValue(['hello', 'world']);

      const result = await controller.getSuggestions('hello');

      expect(service.suggest).toHaveBeenCalledWith('hello');
      expect(result).toEqual({ data: ['hello', 'world'] });
    });
  });
});
