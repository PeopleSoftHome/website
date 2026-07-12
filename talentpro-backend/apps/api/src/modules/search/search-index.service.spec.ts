import { Test, TestingModule } from '@nestjs/testing';
import { SearchIndexService } from './search-index.service';
import { PrismaService } from '@shared/prisma/prisma.service';
import { MEILISEARCH_CLIENT } from '../meilisearch/meilisearch.module';

describe('SearchIndexService', () => {
  let service: SearchIndexService;
  let prisma: PrismaService;
  let meili: any;

  beforeEach(async () => {
    meili = {
      index: jest.fn().mockReturnValue({
        addDocuments: jest.fn().mockResolvedValue(undefined),
        updateDocuments: jest.fn().mockResolvedValue(undefined),
        deleteDocument: jest.fn().mockResolvedValue(undefined),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchIndexService,
        {
          provide: PrismaService,
          useValue: {
            blogPost: { findMany: jest.fn(), findUnique: jest.fn() },
            forumTopic: { findMany: jest.fn(), findUnique: jest.fn() },
            product: { findMany: jest.fn(), findUnique: jest.fn() },
          },
        },
        {
          provide: MEILISEARCH_CLIENT,
          useValue: meili,
        },
      ],
    }).compile();

    service = module.get<SearchIndexService>(SearchIndexService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('indexDocument', () => {
    it('should add document for known type', async () => {
      await service.indexDocument('blog_post', { id: '1', title: 'T' });
      expect(meili.index('blog_posts').addDocuments).toHaveBeenCalledWith([{ id: '1', title: 'T' }]);
    });

    it('should ignore unknown type', async () => {
      await service.indexDocument('unknown', { id: '1' });
      expect(meili.index).not.toHaveBeenCalled();
    });
  });

  describe('updateDocument', () => {
    it('should update with provided payload', async () => {
      await service.updateDocument('blog_post', '1', { title: 'Updated' });
      expect(meili.index('blog_posts').updateDocuments).toHaveBeenCalledWith([
        { id: '1', title: 'Updated' },
      ]);
    });

    it('should fetch and update from prisma when no payload', async () => {
      const post = {
        id: '1',
        title: 'T',
        excerpt: 'E',
        content: 'C',
        slug: 's',
        category: { name: 'Cat' },
        author: { name: 'A' },
        publishedAt: new Date('2024-01-01'),
      };
      jest.spyOn(prisma.blogPost, 'findUnique').mockResolvedValue(post as any);

      await service.updateDocument('blog_post', '1');

      expect(prisma.blogPost.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { category: true, author: { select: { name: true } } },
      });
      expect(meili.index('blog_posts').updateDocuments).toHaveBeenCalled();
    });

    it('should do nothing when fetch returns null', async () => {
      jest.spyOn(prisma.product, 'findUnique').mockResolvedValue(null);

      await service.updateDocument('product', '1');

      expect(meili.index('products').updateDocuments).not.toHaveBeenCalled();
    });
  });

  describe('deleteDocument', () => {
    it('should delete document', async () => {
      await service.deleteDocument('forum_topic', '1');
      expect(meili.index('forum_topics').deleteDocument).toHaveBeenCalledWith('1');
    });

    it('should ignore unknown type', async () => {
      await service.deleteDocument('unknown', '1');
      expect(meili.index).not.toHaveBeenCalled();
    });
  });

  describe('batchIndex', () => {
    it('should batch index blog posts', async () => {
      const posts = [
        {
          id: '1',
          title: 'T',
          excerpt: 'E',
          content: 'C',
          slug: 's',
          category: { name: 'Cat' },
          author: { name: 'A' },
          publishedAt: new Date('2024-01-01'),
        },
      ];
      jest.spyOn(prisma.blogPost, 'findMany').mockResolvedValue(posts as any);

      await service.batchIndex('blog_post');

      expect(meili.index('blog_posts').addDocuments).toHaveBeenCalled();
    });

    it('should batch index forum topics', async () => {
      const topics = [
        {
          id: '1',
          title: 'T',
          content: 'C',
          category: { name: 'Cat' },
          author: { name: 'A' },
          createdAt: new Date('2024-01-01'),
        },
      ];
      jest.spyOn(prisma.forumTopic, 'findMany').mockResolvedValue(topics as any);

      await service.batchIndex('forum_topic');

      expect(meili.index('forum_topics').addDocuments).toHaveBeenCalled();
    });

    it('should batch index products', async () => {
      const products = [
        {
          id: '1',
          name: 'P',
          tagline: 'T',
          description: 'D',
          slug: 's',
          tab: { label: 'Tab' },
        },
      ];
      jest.spyOn(prisma.product, 'findMany').mockResolvedValue(products as any);

      await service.batchIndex('product');

      expect(meili.index('products').addDocuments).toHaveBeenCalled();
    });

    it('should throw when Meilisearch addDocuments fails', async () => {
      jest.spyOn(prisma.forumTopic, 'findMany').mockResolvedValue([{ id: '1' }] as any);
      meili.index('forum_topics').addDocuments.mockRejectedValueOnce(new Error('fail'));

      await expect(service.batchIndex('forum_topic')).rejects.toThrow('MeiliSearch indexing failed');
    });
  });
});
