import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CmsContentService } from './cms-content.service';
import { CmsContentRepository } from './cms-content.repository';
import { PrismaService } from '@/common/prisma/prisma.service';
import { SearchIndexEvent } from '@/events/search-index.event';

describe('CmsContentService', () => {
  let service: CmsContentService;
  let cmsRepo: CmsContentRepository;
  let eventEmitter: EventEmitter2;

  const createRepoMock = () => ({
    findAll: jest.fn(),
    findBySlug: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
  });

  const repoMockMap: Record<string, ReturnType<typeof createRepoMock>> = {
    productTab: createRepoMock(),
    product: createRepoMock(),
    industry: createRepoMock(),
    testimonial: createRepoMock(),
    stat: createRepoMock(),
    clientLogo: createRepoMock(),
    whyUsTab: createRepoMock(),
    aiCard: createRepoMock(),
    resource: createRepoMock(),
    resourceCategory: createRepoMock(),
  };

  beforeEach(async () => {
    Object.values(repoMockMap).forEach((repo) => {
      repo.findAll.mockReset();
      repo.findBySlug.mockReset();
      repo.create.mockReset();
      repo.upsert.mockReset();
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CmsContentService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: CmsContentRepository,
          useValue: {
            forModel: jest.fn().mockImplementation((modelName: string) => repoMockMap[modelName]),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CmsContentService>(CmsContentService);
    cmsRepo = module.get<CmsContentRepository>(CmsContentRepository);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Product', () => {
    it('findAllProducts should use productTab repository with nested include', async () => {
      const result = { data: [], meta: { total: 0 } };
      repoMockMap.productTab.findAll.mockResolvedValue(result);

      await expect(service.findAllProducts()).resolves.toEqual(result);
      expect(cmsRepo.forModel).toHaveBeenCalledWith('productTab');
      expect(repoMockMap.productTab.findAll).toHaveBeenCalledWith({
        orderBy: { sortOrder: 'asc' },
        include: { products: { orderBy: { sortOrder: 'asc' } } },
        pageSize: 100,
      });
    });

    it('findProductBySlug should use product repository', async () => {
      const product = { id: 'p1', slug: 'ats' };
      repoMockMap.product.findBySlug.mockResolvedValue(product);

      const result = await service.findProductBySlug('ats');

      expect(cmsRepo.forModel).toHaveBeenCalledWith('product');
      expect(repoMockMap.product.findBySlug).toHaveBeenCalledWith('ats');
      expect(result).toEqual(product);
    });

    it('createProductTab should create with productTab repository', async () => {
      const dto = { label: 'Core', slug: 'core', icon: 'icon' };
      const created = { id: 't1', ...dto };
      repoMockMap.productTab.create.mockResolvedValue(created);

      const result = await service.createProductTab(dto);

      expect(cmsRepo.forModel).toHaveBeenCalledWith('productTab');
      expect(repoMockMap.productTab.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });

    it('createProduct should default features to empty array and emit event', async () => {
      const dto = { tabId: 't1', slug: 'ats', name: 'ATS', tagline: 'tag' };
      const created = { id: 'p1', ...dto, features: [] };
      repoMockMap.product.create.mockResolvedValue(created);

      const result = await service.createProduct(dto);

      expect(repoMockMap.product.create).toHaveBeenCalledWith({
        ...dto,
        features: [],
      });
      expect(eventEmitter.emit).toHaveBeenCalledWith('search.index', new SearchIndexEvent('product', 'p1', 'create'));
      expect(result).toEqual(created);
    });

    it('createProduct should preserve provided features', async () => {
      const features = [{ title: 'F1' }];
      const dto = { tabId: 't1', slug: 'ats', name: 'ATS', tagline: 'tag', features };
      const created = { id: 'p1', ...dto };
      repoMockMap.product.create.mockResolvedValue(created);

      await service.createProduct(dto);

      expect(repoMockMap.product.create).toHaveBeenCalledWith({
        ...dto,
        features,
      });
    });
  });

  describe('Industry', () => {
    it('findAllIndustries should filter published and order by sortOrder', async () => {
      const result = { data: [], meta: { total: 0 } };
      repoMockMap.industry.findAll.mockResolvedValue(result);

      await expect(service.findAllIndustries()).resolves.toEqual(result);
      expect(repoMockMap.industry.findAll).toHaveBeenCalledWith({
        where: { isPublished: true },
        orderBy: { sortOrder: 'asc' },
        pageSize: 100,
      });
    });

    it('findIndustryBySlug should use industry repository', async () => {
      const industry = { id: 'i1', slug: 'finance' };
      repoMockMap.industry.findBySlug.mockResolvedValue(industry);

      const result = await service.findIndustryBySlug('finance');

      expect(repoMockMap.industry.findBySlug).toHaveBeenCalledWith('finance');
      expect(result).toEqual(industry);
    });

    it('createIndustry should default features and screenshot', async () => {
      const dto = { slug: 'finance', label: 'Finance' };
      const created = { id: 'i1', ...dto, features: [], screenshot: {} };
      repoMockMap.industry.create.mockResolvedValue(created);

      const result = await service.createIndustry(dto);

      expect(repoMockMap.industry.create).toHaveBeenCalledWith({
        ...dto,
        features: [],
        screenshot: {},
      });
      expect(result).toEqual(created);
    });

    it('createIndustry should preserve provided features and screenshot', async () => {
      const features = [{ title: 'F1' }];
      const screenshot = { url: 's.png' };
      const dto = { slug: 'finance', label: 'Finance', features, screenshot };
      const created = { id: 'i1', ...dto };
      repoMockMap.industry.create.mockResolvedValue(created);

      await service.createIndustry(dto);

      expect(repoMockMap.industry.create).toHaveBeenCalledWith({
        ...dto,
        features,
        screenshot,
      });
    });
  });

  describe('Testimonial', () => {
    it('findAllTestimonials should filter active and order by sortOrder', async () => {
      const result = { data: [], meta: { total: 0 } };
      repoMockMap.testimonial.findAll.mockResolvedValue(result);

      await expect(service.findAllTestimonials()).resolves.toEqual(result);
      expect(repoMockMap.testimonial.findAll).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        pageSize: 100,
      });
    });

    it('createTestimonial should create with testimonial repository', async () => {
      const dto = { industry: 'tech', product: 'ats', text: 'great', name: 'A', title: 'CEO' };
      const created = { id: 'tm1', ...dto };
      repoMockMap.testimonial.create.mockResolvedValue(created);

      const result = await service.createTestimonial(dto);

      expect(repoMockMap.testimonial.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('Stats', () => {
    it('findAllStats should filter active and order by sortOrder', async () => {
      const result = { data: [], meta: { total: 0 } };
      repoMockMap.stat.findAll.mockResolvedValue(result);

      await expect(service.findAllStats()).resolves.toEqual(result);
      expect(repoMockMap.stat.findAll).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        pageSize: 100,
      });
    });

    it('upsertStat should upsert with key', async () => {
      const dto = { key: 'users', label: 'Users', value: '100', suffix: '+', prefix: '~', sortOrder: 1 };
      const upserted = { id: 's1', ...dto };
      repoMockMap.stat.upsert.mockResolvedValue(upserted);

      const result = await service.upsertStat(dto);

      expect(repoMockMap.stat.upsert).toHaveBeenCalledWith(
        { key: dto.key },
        { label: dto.label, value: dto.value, suffix: dto.suffix, prefix: dto.prefix, sortOrder: dto.sortOrder },
        dto,
      );
      expect(result).toEqual(upserted);
    });
  });

  describe('Client Logos', () => {
    it('findAllLogos should filter active and order by sortOrder', async () => {
      const result = { data: [], meta: { total: 0 } };
      repoMockMap.clientLogo.findAll.mockResolvedValue(result);

      await expect(service.findAllLogos()).resolves.toEqual(result);
      expect(repoMockMap.clientLogo.findAll).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        pageSize: 100,
      });
    });

    it('upsertLogo should create with clientLogo repository', async () => {
      const dto = { name: 'Logo', logo: 'l.png' };
      const created = { id: 'l1', ...dto };
      repoMockMap.clientLogo.create.mockResolvedValue(created);

      const result = await service.upsertLogo(dto);

      expect(repoMockMap.clientLogo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('WhyUs', () => {
    it('findAllWhyUsTabs should filter active and order by sortOrder', async () => {
      const result = { data: [], meta: { total: 0 } };
      repoMockMap.whyUsTab.findAll.mockResolvedValue(result);

      await expect(service.findAllWhyUsTabs()).resolves.toEqual(result);
      expect(repoMockMap.whyUsTab.findAll).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        pageSize: 100,
      });
    });

    it('upsertWhyUsTab should upsert with slug', async () => {
      const dto = { slug: 'efficiency', label: 'Efficiency', icon: 'icon', metrics: [{ value: 1 }], sortOrder: 1 };
      const upserted = { id: 'w1', ...dto };
      repoMockMap.whyUsTab.upsert.mockResolvedValue(upserted);

      const result = await service.upsertWhyUsTab(dto);

      expect(repoMockMap.whyUsTab.upsert).toHaveBeenCalledWith(
        { slug: dto.slug },
        { label: dto.label, icon: dto.icon, metrics: dto.metrics, sortOrder: dto.sortOrder },
        dto,
      );
      expect(result).toEqual(upserted);
    });
  });

  describe('AI Family', () => {
    it('findAllAiCards should filter active and order by sortOrder', async () => {
      const result = { data: [], meta: { total: 0 } };
      repoMockMap.aiCard.findAll.mockResolvedValue(result);

      await expect(service.findAllAiCards()).resolves.toEqual(result);
      expect(repoMockMap.aiCard.findAll).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        pageSize: 100,
      });
    });

    it('upsertAiCard should upsert with slug', async () => {
      const dto = { slug: 'resume', name: 'Resume', tagline: 'tag', description: 'desc', icon: 'icon', features: [{ title: 'F1' }], color: 'blue', sortOrder: 1 };
      const upserted = { id: 'a1', ...dto };
      repoMockMap.aiCard.upsert.mockResolvedValue(upserted);

      const result = await service.upsertAiCard(dto);

      expect(repoMockMap.aiCard.upsert).toHaveBeenCalledWith(
        { slug: dto.slug },
        { name: dto.name, tagline: dto.tagline, description: dto.description, icon: dto.icon, features: dto.features, color: dto.color, sortOrder: dto.sortOrder },
        dto,
      );
      expect(result).toEqual(upserted);
    });
  });

  describe('Resource', () => {
    it('findAllResources should use defaults and filter published', async () => {
      const result = { data: [], meta: { total: 0 } };
      repoMockMap.resource.findAll.mockResolvedValue(result);

      await expect(service.findAllResources()).resolves.toEqual(result);
      expect(repoMockMap.resource.findAll).toHaveBeenCalledWith({
        page: 1,
        pageSize: 20,
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        include: { category: true },
      });
    });

    it('findAllResources should filter by categorySlug when provided', async () => {
      const result = { data: [], meta: { total: 0 } };
      repoMockMap.resource.findAll.mockResolvedValue(result);

      await service.findAllResources(2, 10, 'whitepaper');

      expect(repoMockMap.resource.findAll).toHaveBeenCalledWith({
        page: 2,
        pageSize: 10,
        where: { status: 'PUBLISHED', category: { slug: 'whitepaper' } },
        orderBy: { publishedAt: 'desc' },
        include: { category: true },
      });
    });

    it('createResourceCategory should create with resourceCategory repository', async () => {
      const dto = { name: 'Whitepapers', slug: 'whitepaper' };
      const created = { id: 'c1', ...dto };
      repoMockMap.resourceCategory.create.mockResolvedValue(created);

      const result = await service.createResourceCategory(dto);

      expect(repoMockMap.resourceCategory.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });

    it('createResource should create with resource repository', async () => {
      const dto = { categoryId: 'c1', slug: 'wp-1', title: 'WP 1' };
      const created = { id: 'r1', ...dto };
      repoMockMap.resource.create.mockResolvedValue(created);

      const result = await service.createResource(dto);

      expect(repoMockMap.resource.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });
});
