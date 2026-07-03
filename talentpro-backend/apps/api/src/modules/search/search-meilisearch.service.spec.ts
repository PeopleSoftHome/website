import { Test, TestingModule } from '@nestjs/testing';
import { SearchMeilisearchService } from './search-meilisearch.service';
import { MEILISEARCH_CLIENT } from '../meilisearch/meilisearch.module';

describe('SearchMeilisearchService', () => {
  let service: SearchMeilisearchService;
  let meili: any;

  beforeEach(async () => {
    meili = {
      createIndex: jest.fn().mockResolvedValue(undefined),
      index: jest.fn().mockReturnValue({
        updateSearchableAttributes: jest.fn().mockResolvedValue(undefined),
        search: jest.fn().mockResolvedValue({ hits: [] }),
      }),
      multiSearch: jest.fn().mockResolvedValue({ results: [] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchMeilisearchService,
        {
          provide: MEILISEARCH_CLIENT,
          useValue: meili,
        },
      ],
    }).compile();

    service = module.get<SearchMeilisearchService>(SearchMeilisearchService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should create indexes and update searchable attributes', async () => {
      await service.onModuleInit();

      expect(meili.createIndex).toHaveBeenCalledTimes(3);
      expect(meili.index).toHaveBeenCalledWith('blog_posts');
      expect(meili.index('blog_posts').updateSearchableAttributes).toHaveBeenCalled();
    });

    it('should ignore index_already_exists error', async () => {
      meili.createIndex.mockRejectedValue({ code: 'index_already_exists', message: 'exists' });

      await expect(service.onModuleInit()).resolves.not.toThrow();
      expect(meili.createIndex).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should return mapped results for all types', async () => {
      meili.multiSearch.mockResolvedValue({
        results: [
          {
            indexUid: 'blog_posts',
            hits: [{ id: '1', title: 'Post', excerpt: 'E', slug: 'post', categoryName: 'C', publishedAt: '2024-01-01' }],
          },
          {
            indexUid: 'forum_topics',
            hits: [{ id: '2', title: 'Topic', categoryName: 'F', createdAt: '2024-01-01' }],
          },
          {
            indexUid: 'products',
            hits: [{ id: '3', name: 'Product', tagline: 'T', slug: 'product', tabName: 'Tab' }],
          },
        ],
      });

      const result = await service.search('query');

      expect(meili.multiSearch).toHaveBeenCalled();
      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({ type: 'post', url: '/blog/post' });
      expect(result[1]).toMatchObject({ type: 'forum_topic', url: '/forum/topic/2' });
      expect(result[2]).toMatchObject({ type: 'product', url: '/products/product' });
    });

    it('should filter results by type', async () => {
      meili.multiSearch.mockResolvedValue({
        results: [
          {
            indexUid: 'products',
            hits: [{ id: '3', name: 'Product', tagline: 'T', slug: 'product', tabName: 'Tab' }],
          },
        ],
      });

      const result = await service.search('query', 'product');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('product');
    });

    it('should return empty array for unknown type', async () => {
      const result = await service.search('query', 'unknown' as any);
      expect(result).toEqual([]);
      expect(meili.multiSearch).not.toHaveBeenCalled();
    });
  });

  describe('suggest', () => {
    it('should return deduplicated titles', async () => {
      meili.multiSearch.mockResolvedValue({
        results: [
          { hits: [{ title: 'A' }, { title: 'B' }] },
          { hits: [{ title: 'A' }, { title: 'C' }] },
          { hits: [{ title: 'D' }] },
        ],
      });

      const result = await service.suggest('query', 5);

      expect(result).toEqual(['A', 'B', 'C', 'D']);
    });
  });

  describe('getSuggestions', () => {
    it('should return blog post titles', async () => {
      meili.index('blog_posts').search.mockResolvedValue({ hits: [{ title: 'Alpha' }, { title: 'Beta' }] });

      const result = await service.getSuggestions('query', 5);

      expect(meili.index('blog_posts').search).toHaveBeenCalledWith(
        'query',
        expect.objectContaining({ limit: 5, attributesToRetrieve: ['title'] }),
      );
      expect(result).toEqual(['Alpha', 'Beta']);
    });
  });
});
