import { Test, TestingModule } from '@nestjs/testing';
import { CmsService } from './cms.service';
import { CmsPageService } from './cms-page.service';
import { CmsContentService } from './cms-content.service';

describe('CmsService', () => {
  let service: CmsService;
  let pageService: CmsPageService;
  let contentService: CmsContentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CmsService,
        {
          provide: CmsPageService,
          useValue: {
            findAllPages: jest.fn().mockResolvedValue([]),
            findPageBySlug: jest.fn().mockResolvedValue(null),
            createPage: jest.fn().mockResolvedValue({}),
            updatePage: jest.fn().mockResolvedValue({}),
            deletePage: jest.fn().mockResolvedValue({}),
            findSectionsByPage: jest.fn().mockResolvedValue([]),
            createSection: jest.fn().mockResolvedValue({}),
            updateSection: jest.fn().mockResolvedValue({}),
            deleteSection: jest.fn().mockResolvedValue({}),
            batchUpdateSections: jest.fn().mockResolvedValue([]),
            findNavigation: jest.fn().mockResolvedValue(null),
            upsertNavigation: jest.fn().mockResolvedValue({}),
            findTranslations: jest.fn().mockResolvedValue([]),
            upsertTranslation: jest.fn().mockResolvedValue({}),
            findAllTranslations: jest.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
            updateTranslation: jest.fn().mockResolvedValue({}),
            deleteTranslation: jest.fn().mockResolvedValue({ message: '删除成功' }),
          },
        },
        {
          provide: CmsContentService,
          useValue: {
            findAllProducts: jest.fn().mockResolvedValue([]),
            createProductTab: jest.fn().mockResolvedValue({}),
            createProduct: jest.fn().mockResolvedValue({}),
            findAllIndustries: jest.fn().mockResolvedValue([]),
            createIndustry: jest.fn().mockResolvedValue({}),
            findAllTestimonials: jest.fn().mockResolvedValue([]),
            createTestimonial: jest.fn().mockResolvedValue({}),
            findAllStats: jest.fn().mockResolvedValue([]),
            upsertStat: jest.fn().mockResolvedValue({}),
            findAllLogos: jest.fn().mockResolvedValue([]),
            upsertLogo: jest.fn().mockResolvedValue({}),
            findAllWhyUsTabs: jest.fn().mockResolvedValue([]),
            upsertWhyUsTab: jest.fn().mockResolvedValue({}),
            findAllAiCards: jest.fn().mockResolvedValue([]),
            upsertAiCard: jest.fn().mockResolvedValue({}),
            findAllResources: jest.fn().mockResolvedValue([]),
            createResourceCategory: jest.fn().mockResolvedValue({}),
            createResource: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<CmsService>(CmsService);
    pageService = module.get<CmsPageService>(CmsPageService);
    contentService = module.get<CmsContentService>(CmsContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Page delegation', () => {
    it('findAllPages delegates to pageService', async () => {
      await service.findAllPages(1, 10);
      expect(pageService.findAllPages).toHaveBeenCalledWith(1, 10);
    });

    it('findPageBySlug delegates to pageService', async () => {
      await service.findPageBySlug('home');
      expect(pageService.findPageBySlug).toHaveBeenCalledWith('home');
    });

    it('createPage delegates to pageService', async () => {
      const dto = { title: 'Home', slug: 'home' };
      await service.createPage(dto as unknown as Parameters<CmsService['createPage']>[0]);
      expect(pageService.createPage).toHaveBeenCalledWith(dto);
    });

    it('updatePage delegates to pageService', async () => {
      const dto = { title: 'Updated' };
      await service.updatePage('p1', dto as unknown as Parameters<CmsService['updatePage']>[1]);
      expect(pageService.updatePage).toHaveBeenCalledWith('p1', dto);
    });

    it('deletePage delegates to pageService', async () => {
      await service.deletePage('p1');
      expect(pageService.deletePage).toHaveBeenCalledWith('p1');
    });
  });

  describe('Section delegation', () => {
    it('findSectionsByPage delegates to pageService', async () => {
      await service.findSectionsByPage('p1');
      expect(pageService.findSectionsByPage).toHaveBeenCalledWith('p1');
    });

    it('batchUpdateSections delegates to pageService', async () => {
      const sections = [{ id: 's1', sortOrder: 1, isActive: true }];
      await service.batchUpdateSections(sections);
      expect(pageService.batchUpdateSections).toHaveBeenCalledWith(sections);
    });
  });

  describe('Navigation delegation', () => {
    it('findNavigation delegates to pageService', async () => {
      await service.findNavigation('main');
      expect(pageService.findNavigation).toHaveBeenCalledWith('main');
    });
  });

  describe('Content delegation', () => {
    it('findAllProducts delegates to contentService', async () => {
      await service.findAllProducts();
      expect(contentService.findAllProducts).toHaveBeenCalledWith();
    });

    it('findAllIndustries delegates to contentService', async () => {
      await service.findAllIndustries();
      expect(contentService.findAllIndustries).toHaveBeenCalledWith();
    });

    it('findAllTestimonials delegates to contentService', async () => {
      await service.findAllTestimonials();
      expect(contentService.findAllTestimonials).toHaveBeenCalledWith();
    });

    it('findAllStats delegates to contentService', async () => {
      await service.findAllStats();
      expect(contentService.findAllStats).toHaveBeenCalledWith();
    });

    it('findAllLogos delegates to contentService', async () => {
      await service.findAllLogos();
      expect(contentService.findAllLogos).toHaveBeenCalledWith();
    });

    it('findAllWhyUsTabs delegates to contentService', async () => {
      await service.findAllWhyUsTabs();
      expect(contentService.findAllWhyUsTabs).toHaveBeenCalledWith();
    });

    it('findAllAiCards delegates to contentService', async () => {
      await service.findAllAiCards();
      expect(contentService.findAllAiCards).toHaveBeenCalledWith();
    });

    it('findAllResources delegates to contentService', async () => {
      await service.findAllResources(1, 20, 'whitepaper');
      expect(contentService.findAllResources).toHaveBeenCalledWith(1, 20, 'whitepaper');
    });
  });
});
