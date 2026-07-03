import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { SearchMeilisearchService } from './search-meilisearch.service';
import { SearchPrismaService } from './search-prisma.service';
import { SearchIndexService } from './search-index.service';

describe('SearchService', () => {
  let service: SearchService;
  let meiliService: SearchMeilisearchService;
  let prismaService: SearchPrismaService;
  let indexService: SearchIndexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: SearchMeilisearchService,
          useValue: {
            search: jest.fn(),
            suggest: jest.fn(),
            getSuggestions: jest.fn(),
          },
        },
        {
          provide: SearchPrismaService,
          useValue: {
            search: jest.fn(),
            getSuggestions: jest.fn(),
          },
        },
        {
          provide: SearchIndexService,
          useValue: {
            indexDocument: jest.fn(),
            updateDocument: jest.fn(),
            deleteDocument: jest.fn(),
            batchIndex: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    meiliService = module.get<SearchMeilisearchService>(SearchMeilisearchService);
    prismaService = module.get<SearchPrismaService>(SearchPrismaService);
    indexService = module.get<SearchIndexService>(SearchIndexService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should return Meilisearch results', async () => {
      const results = [{ type: 'post', id: '1', title: 'Hello' }];
      jest.spyOn(meiliService, 'search').mockResolvedValue(results as any);

      const res = await service.search('hello', { type: 'post', limit: 10 });

      expect(meiliService.search).toHaveBeenCalledWith('hello', 'post', 10);
      expect(res).toEqual(results);
    });

    it('should fallback to Prisma when Meilisearch fails', async () => {
      const fallback = [{ type: 'product', id: '2', title: 'Product' }];
      jest.spyOn(meiliService, 'search').mockRejectedValue(new Error('meili down'));
      jest.spyOn(prismaService, 'search').mockResolvedValue(fallback as any);

      const res = await service.search('product', { limit: 5 });

      expect(prismaService.search).toHaveBeenCalledWith('product', undefined, 5);
      expect(res).toEqual(fallback);
    });

    it('should return empty array for empty query', async () => {
      const res = await service.search('   ');
      expect(res).toEqual([]);
      expect(meiliService.search).not.toHaveBeenCalled();
    });
  });

  describe('suggest', () => {
    it('should return Meilisearch suggestions', async () => {
      jest.spyOn(meiliService, 'suggest').mockResolvedValue(['hello world']);

      const res = await service.suggest('hello', 5);

      expect(meiliService.suggest).toHaveBeenCalledWith('hello', 5);
      expect(res).toEqual(['hello world']);
    });

    it('should return empty array when query is too short', async () => {
      const res = await service.suggest('h', 5);
      expect(res).toEqual([]);
      expect(meiliService.suggest).not.toHaveBeenCalled();
    });

    it('should swallow errors and return empty array', async () => {
      jest.spyOn(meiliService, 'suggest').mockRejectedValue(new Error('fail'));

      const res = await service.suggest('hello', 5);

      expect(res).toEqual([]);
    });
  });

  describe('getSuggestions', () => {
    it('should return Meilisearch suggestions', async () => {
      jest.spyOn(meiliService, 'getSuggestions').mockResolvedValue(['a', 'b']);

      const res = await service.getSuggestions('query', 5);

      expect(meiliService.getSuggestions).toHaveBeenCalledWith('query', 5);
      expect(res).toEqual(['a', 'b']);
    });

    it('should fallback to Prisma when Meilisearch fails', async () => {
      jest.spyOn(meiliService, 'getSuggestions').mockRejectedValue(new Error('fail'));
      jest.spyOn(prismaService, 'getSuggestions').mockResolvedValue(['c']);

      const res = await service.getSuggestions('query', 5);

      expect(prismaService.getSuggestions).toHaveBeenCalledWith('query', 5);
      expect(res).toEqual(['c']);
    });
  });

  describe('index operation delegates', () => {
    it('indexDocument delegates to index service', async () => {
      jest.spyOn(indexService, 'indexDocument').mockResolvedValue(undefined);
      await service.indexDocument('blog_post', { id: '1' });
      expect(indexService.indexDocument).toHaveBeenCalledWith('blog_post', { id: '1' });
    });

    it('updateDocument delegates to index service', async () => {
      jest.spyOn(indexService, 'updateDocument').mockResolvedValue(undefined);
      await service.updateDocument('blog_post', '1', { title: 'T' });
      expect(indexService.updateDocument).toHaveBeenCalledWith('blog_post', '1', { title: 'T' });
    });

    it('deleteDocument delegates to index service', async () => {
      jest.spyOn(indexService, 'deleteDocument').mockResolvedValue(undefined);
      await service.deleteDocument('blog_post', '1');
      expect(indexService.deleteDocument).toHaveBeenCalledWith('blog_post', '1');
    });

    it('batchIndex delegates to index service', async () => {
      jest.spyOn(indexService, 'batchIndex').mockResolvedValue(undefined);
      await service.batchIndex('product');
      expect(indexService.batchIndex).toHaveBeenCalledWith('product');
    });
  });
});
