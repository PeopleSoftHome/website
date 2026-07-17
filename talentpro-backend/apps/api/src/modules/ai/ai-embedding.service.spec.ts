/* eslint-disable @typescript-eslint/no-explicit-any */
import { AiEmbeddingService } from './ai-embedding.service';

describe('AiEmbeddingService', () => {
  let service: AiEmbeddingService;
  let config: { get: jest.Mock };
  let prisma: {
    $executeRaw: jest.Mock;
    $queryRaw: jest.Mock;
    product: { findMany: jest.Mock };
    industry: { findMany: jest.Mock };
    blogPost: { findMany: jest.Mock };
    caseStudy: { findMany: jest.Mock };
    news: { findMany: jest.Mock };
  };
  const fetchMock = jest.fn();

  const enabledConfig = (enabled: boolean, key = 'sk-test') => (name: string) => {
    if (name === 'AI_EMBEDDING_ENABLED') return enabled ? 'true' : 'false';
    if (name === 'OPENAI_API_KEY') return key;
    if (name === 'AI_EMBEDDING_MODEL') return undefined;
    return undefined;
  };

  beforeEach(() => {
    config = { get: jest.fn(enabledConfig(true)) };
    prisma = {
      $executeRaw: jest.fn().mockResolvedValue(1),
      $queryRaw: jest.fn().mockResolvedValue([]),
      product: { findMany: jest.fn().mockResolvedValue([]) },
      industry: { findMany: jest.fn().mockResolvedValue([]) },
      blogPost: { findMany: jest.fn().mockResolvedValue([]) },
      caseStudy: { findMany: jest.fn().mockResolvedValue([]) },
      news: { findMany: jest.fn().mockResolvedValue([]) },
    };
    service = new AiEmbeddingService(config as any, prisma as any);
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  describe('isEnabled', () => {
    it('开关开启且有 API key 时为 true', () => {
      expect(service.isEnabled()).toBe(true);
    });

    it('开关关闭或缺 key 时为 false', () => {
      config.get.mockImplementation(enabledConfig(false));
      expect(service.isEnabled()).toBe(false);
      config.get.mockImplementation(enabledConfig(true, ''));
      expect(service.isEnabled()).toBe(false);
    });
  });

  describe('embed', () => {
    it('按 index 排序返回向量，默认模型 text-embedding-3-small', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ data: [{ embedding: [0.2], index: 1 }, { embedding: [0.1], index: 0 }] }),
      });
      const vectors = await service.embed(['a', 'b']);

      expect(vectors).toEqual([[0.1], [0.2]]);
      const body = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(body.model).toBe('text-embedding-3-small');
      expect(body.input).toEqual(['a', 'b']);
    });

    it('API 非 200 时抛错（由调用方降级）', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 429, text: async () => 'rate limited' });
      await expect(service.embed(['x'])).rejects.toThrow('429');
    });
  });

  describe('indexContent', () => {
    it('嵌入并执行 upsert（含 vector 字面量）', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ data: [{ embedding: [0.1, 0.2], index: 0 }] }),
      });
      await service.indexContent('product', 'p1', 'recruit', '招聘系统', '全流程数字化招聘');

      expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
      const [, ...params] = prisma.$executeRaw.mock.calls[0];
      expect(params).toContain('product');
      expect(params).toContain('p1');
      expect(params.some((p: unknown) => typeof p === 'string' && (p as string).startsWith('[0.1'))).toBe(true);
    });
  });

  describe('search', () => {
    it('余弦距离映射为相似度得分（1 - distance）', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ data: [{ embedding: [0.1], index: 0 }] }),
      });
      prisma.$queryRaw.mockResolvedValue([
        { refType: 'product', refId: 'p1', slug: 'recruit', title: '招聘系统', content: 'desc', distance: 0.15 },
      ]);

      const hits = await service.search('招聘', 6);
      expect(hits).toHaveLength(1);
      expect(hits[0].score).toBeCloseTo(0.85);
      expect(hits[0].refType).toBe('product');
    });
  });

  describe('reindexAll', () => {
    it('未启用时不查库、直接返回空', async () => {
      config.get.mockImplementation(enabledConfig(false));
      const counts = await service.reindexAll();
      expect(counts).toEqual({});
      expect(prisma.product.findMany).not.toHaveBeenCalled();
    });

    it('只索引已发布内容并计数', async () => {
      prisma.product.findMany.mockResolvedValue([{ id: 'p1', slug: 'recruit', name: '招聘', tagline: 't', description: 'd' }]);
      prisma.blogPost.findMany.mockResolvedValue([
        { id: 'b1', slug: 's', title: 'T', excerpt: 'e', content: 'c' },
        { id: 'b2', slug: 's2', title: 'T2', excerpt: null, content: 'c2' },
      ]);
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ data: [{ embedding: [0.1], index: 0 }] }),
      });

      const counts = await service.reindexAll();
      expect(prisma.blogPost.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { status: 'PUBLISHED', deletedAt: null } }));
      expect(counts).toEqual({ product: 1, blog_post: 2 });
    });

    it('单条失败不中断整体（跳过并继续）', async () => {
      prisma.product.findMany.mockResolvedValue([
        { id: 'p1', slug: 'a', name: 'A', tagline: 't', description: null },
        { id: 'p2', slug: 'b', name: 'B', tagline: 't', description: null },
      ]);
      fetchMock
        .mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'err' })
        .mockResolvedValue({ ok: true, json: async () => ({ data: [{ embedding: [0.1], index: 0 }] }) });

      const counts = await service.reindexAll();
      expect(counts).toEqual({ product: 1 });
    });
  });
});
