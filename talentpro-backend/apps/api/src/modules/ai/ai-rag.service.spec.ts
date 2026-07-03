import { Test, TestingModule } from '@nestjs/testing';
import { AiRagService } from './ai-rag.service';
import { MEILISEARCH_CLIENT } from '../meilisearch/meilisearch.module';

describe('AiRagService', () => {
  let service: AiRagService;
  const searchMocks = new Map<string, jest.Mock>();

  const meiliClient = {
    index: jest.fn((name: string) => ({
      search: searchMocks.get(name) ?? jest.fn().mockResolvedValue({ hits: [] }),
    })),
  };

  beforeEach(async () => {
    searchMocks.clear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiRagService,
        {
          provide: MEILISEARCH_CLIENT,
          useValue: meiliClient,
        },
      ],
    }).compile();

    service = module.get<AiRagService>(AiRagService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return formatted contexts from all indexes', async () => {
    searchMocks.set('products', jest.fn().mockResolvedValue({
      hits: [{ name: 'Product A', slug: 'product-a', tagline: 'tagline', description: 'description' }],
    }));

    const result = await service.retrieveContext('query');

    expect(meiliClient.index).toHaveBeenCalledWith('products');
    expect(searchMocks.get('products')).toHaveBeenCalledWith('query', expect.objectContaining({ limit: 3 }));
    expect(result[0]).toContain('【产品】Product A');
  });

  it('should skip indexes that throw errors', async () => {
    searchMocks.set('products', jest.fn().mockRejectedValue(new Error('products down')));
    searchMocks.set('news', jest.fn().mockResolvedValue({ hits: [{ title: 'News', slug: 'news', summary: 'summary' }] }));

    const result = await service.retrieveContext('query');

    expect(result.some((ctx) => ctx.includes('News'))).toBe(true);
    expect(result.some((ctx) => ctx.includes('Product'))).toBe(false);
  });

  it('should handle empty hits', async () => {
    const result = await service.retrieveContext('query');

    expect(result).toEqual([]);
  });

  it('should format industries with missing description', async () => {
    searchMocks.set('industries', jest.fn().mockResolvedValue({ hits: [{ label: 'Industry', slug: 'industry' }] }));

    const result = await service.retrieveContext('query');

    expect(result[0]).toBe('【行业方案】Industry（industry）：');
  });

  it('should format resources with excerpt fallback', async () => {
    searchMocks.set('resources', jest.fn().mockResolvedValue({ hits: [{ title: 'Resource', slug: 'resource', description: 'desc' }] }));

    const result = await service.retrieveContext('query');

    expect(result[0]).toBe('【资源】Resource（resource）：desc');
  });

  it('should format resources with excerpt', async () => {
    searchMocks.set('resources', jest.fn().mockResolvedValue({ hits: [{ title: 'Resource', slug: 'resource', excerpt: 'excerpt text' }] }));

    const result = await service.retrieveContext('query');

    expect(result[0]).toBe('【资源】Resource（resource）：excerpt text');
  });

  it('should format ai cards with description', async () => {
    searchMocks.set('ai_cards', jest.fn().mockResolvedValue({ hits: [{ title: 'AI Card', slug: 'ai-card', description: 'ai desc' }] }));

    const result = await service.retrieveContext('query');

    expect(result[0]).toBe('【AI 能力】AI Card（ai-card）：ai desc');
  });

  it('should format case studies with excerpt', async () => {
    searchMocks.set('case_studies', jest.fn().mockResolvedValue({ hits: [{ title: 'Case', slug: 'case', excerpt: 'case excerpt' }] }));

    const result = await service.retrieveContext('query');

    expect(result[0]).toBe('【客户案例】Case（case）：case excerpt');
  });

  it('should format news with summary', async () => {
    searchMocks.set('news', jest.fn().mockResolvedValue({ hits: [{ title: 'News', slug: 'news', summary: 'news summary' }] }));

    const result = await service.retrieveContext('query');

    expect(result[0]).toBe('【新闻】News（news）：news summary');
  });

  it('should format industries with description', async () => {
    searchMocks.set('industries', jest.fn().mockResolvedValue({ hits: [{ label: 'Industry', slug: 'industry', description: 'industry description' }] }));

    const result = await service.retrieveContext('query');

    expect(result[0]).toBe('【行业方案】Industry（industry）：industry description');
  });

  it('should format products without description', async () => {
    searchMocks.set('products', jest.fn().mockResolvedValue({ hits: [{ name: 'Product', slug: 'product', tagline: 'tagline' }] }));

    const result = await service.retrieveContext('query');

    expect(result[0]).toBe('【产品】Product（product）：tagline');
  });

  it('should format products with description', async () => {
    searchMocks.set('products', jest.fn().mockResolvedValue({ hits: [{ name: 'Product', slug: 'product', tagline: 'tagline', description: 'desc' }] }));

    const result = await service.retrieveContext('query');

    expect(result[0]).toBe('【产品】Product（product）：tagline — desc');
  });

  it('should format pages without description', async () => {
    searchMocks.set('pages', jest.fn().mockResolvedValue({ hits: [{ title: 'Page', slug: 'page' }] }));

    const result = await service.retrieveContext('query');

    expect(result[0]).toBe('【页面】Page（page）');
  });

  it('should format blog posts with excerpt', async () => {
    searchMocks.set('blog_posts', jest.fn().mockResolvedValue({ hits: [{ title: 'Blog', slug: 'blog', excerpt: 'blog excerpt' }] }));

    const result = await service.retrieveContext('query');

    expect(result[0]).toBe('【博客】Blog（blog）：blog excerpt');
  });

  it('should format blog posts with content fallback', async () => {
    searchMocks.set('blog_posts', jest.fn().mockResolvedValue({ hits: [{ title: 'Blog', slug: 'blog', content: 'body' }] }));

    const result = await service.retrieveContext('query');

    expect(result[0]).toBe('【博客】Blog（blog）：body');
  });
});
