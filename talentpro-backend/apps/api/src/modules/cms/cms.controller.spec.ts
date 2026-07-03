import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { CmsGenericService } from './cms-generic.service';

describe('CmsController', () => {
  let controller: CmsController;
  let cmsService: CmsService;
  let cmsGenericService: CmsGenericService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CmsController],
      providers: [
        {
          provide: CmsService,
          useValue: {
            findAllPages: jest.fn(),
            findPageBySlug: jest.fn(),
            createPage: jest.fn(),
            findAllProducts: jest.fn(),
            findProductBySlug: jest.fn(),
            createProductTab: jest.fn(),
            findAllIndustries: jest.fn(),
            findIndustryBySlug: jest.fn(),
            createIndustry: jest.fn(),
            findAllTestimonials: jest.fn(),
            findAllStats: jest.fn(),
            upsertStat: jest.fn(),
            findAllLogos: jest.fn(),
            upsertLogo: jest.fn(),
            findAllWhyUsTabs: jest.fn(),
            upsertWhyUsTab: jest.fn(),
            findAllAiCards: jest.fn(),
            upsertAiCard: jest.fn(),
            findAllResources: jest.fn(),
            createResource: jest.fn(),
            findNavigation: jest.fn(),
            findTranslations: jest.fn(),
            findAllTranslations: jest.fn(),
            upsertTranslation: jest.fn(),
            updateTranslation: jest.fn(),
            deleteTranslation: jest.fn(),
            findSectionsByPage: jest.fn(),
            createSection: jest.fn(),
            updateSection: jest.fn(),
            deleteSection: jest.fn(),
            batchUpdateSections: jest.fn(),
          },
        },
        {
          provide: CmsGenericService,
          useValue: {
            findAll: jest.fn(),
            findBySlug: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CmsController>(CmsController);
    cmsService = module.get<CmsService>(CmsService);
    cmsGenericService = module.get<CmsGenericService>(CmsGenericService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('resolveContentType', () => {
    it.each([
      ['product-tabs', 'productTab'],
      ['product-tab', 'productTab'],
      ['productTab', 'productTab'],
      ['products', 'product'],
      ['product', 'product'],
      ['industries', 'industry'],
      ['industry', 'industry'],
      ['testimonials', 'testimonial'],
      ['testimonial', 'testimonial'],
      ['stats', 'stat'],
      ['stat', 'stat'],
      ['logos', 'clientLogo'],
      ['logo', 'clientLogo'],
      ['clientLogo', 'clientLogo'],
      ['why-us', 'whyUsTab'],
      ['whyUs', 'whyUsTab'],
      ['whyUsTab', 'whyUsTab'],
      ['ai-cards', 'aiCard'],
      ['ai-card', 'aiCard'],
      ['aiCard', 'aiCard'],
      ['resource-categories', 'resourceCategory'],
      ['resource-category', 'resourceCategory'],
      ['resourceCategory', 'resourceCategory'],
      ['resources', 'resource'],
      ['resource', 'resource'],
      ['case-studies', 'caseStudy'],
      ['case-study', 'caseStudy'],
      ['caseStudy', 'caseStudy'],
      ['jobs', 'job'],
      ['job', 'job'],
    ])('should resolve %s to %s', (input, expected) => {
      expect((controller as any).resolveContentType(input)).toBe(expected);
    });

    it('should throw NotFoundException for unknown type', () => {
      expect(() => (controller as any).resolveContentType('unknown')).toThrow(NotFoundException);
    });
  });

  describe('Pages', () => {
    it('findAllPages should call service with pagination', async () => {
      const pagination = { page: 2, pageSize: 10 };
      const result = { data: [], meta: { total: 0 } };
      (cmsService.findAllPages as jest.Mock).mockResolvedValue(result);

      await expect(controller.findAllPages(pagination as any)).resolves.toEqual(result);
      expect(cmsService.findAllPages).toHaveBeenCalledWith(2, 10);
    });

    it('findPageBySlug should call service with slug', async () => {
      await controller.findPageBySlug('home');
      expect(cmsService.findPageBySlug).toHaveBeenCalledWith('home');
    });

    it('createPage should call service with dto', async () => {
      const dto = { slug: 'home', title: 'Home' };
      await controller.createPage(dto as any);
      expect(cmsService.createPage).toHaveBeenCalledWith(dto);
    });
  });

  describe('Products', () => {
    it('findAllProducts should call service', async () => {
      await controller.findAllProducts();
      expect(cmsService.findAllProducts).toHaveBeenCalledWith();
    });

    it('findProductBySlug should call service', async () => {
      await controller.findProductBySlug('ats');
      expect(cmsService.findProductBySlug).toHaveBeenCalledWith('ats');
    });

    it('createProductTab should call service', async () => {
      const dto = { label: 'Core', slug: 'core' };
      await controller.createProductTab(dto as any);
      expect(cmsService.createProductTab).toHaveBeenCalledWith(dto);
    });
  });

  describe('Industries', () => {
    it('findAllIndustries should call service', async () => {
      await controller.findAllIndustries();
      expect(cmsService.findAllIndustries).toHaveBeenCalledWith();
    });

    it('findIndustryBySlug should call service', async () => {
      await controller.findIndustryBySlug('finance');
      expect(cmsService.findIndustryBySlug).toHaveBeenCalledWith('finance');
    });

    it('createIndustry should call service', async () => {
      const dto = { slug: 'finance', label: 'Finance' };
      await controller.createIndustry(dto as any);
      expect(cmsService.createIndustry).toHaveBeenCalledWith(dto);
    });
  });

  describe('Testimonials & Stats & Logos & WhyUs & AI', () => {
    it('findAllTestimonials should call service', async () => {
      await controller.findAllTestimonials();
      expect(cmsService.findAllTestimonials).toHaveBeenCalledWith();
    });

    it('findAllStats should call service', async () => {
      await controller.findAllStats();
      expect(cmsService.findAllStats).toHaveBeenCalledWith();
    });

    it('upsertStat should call service', async () => {
      const dto = { key: 'users', label: 'Users', value: '100' };
      await controller.upsertStat(dto as any);
      expect(cmsService.upsertStat).toHaveBeenCalledWith(dto);
    });

    it('findAllLogos should call service', async () => {
      await controller.findAllLogos();
      expect(cmsService.findAllLogos).toHaveBeenCalledWith();
    });

    it('createLogo should call service', async () => {
      const dto = { name: 'Logo', logo: 'l.png' };
      await controller.createLogo(dto as any);
      expect(cmsService.upsertLogo).toHaveBeenCalledWith(dto);
    });

    it('findAllWhyUsTabs should call service', async () => {
      await controller.findAllWhyUsTabs();
      expect(cmsService.findAllWhyUsTabs).toHaveBeenCalledWith();
    });

    it('upsertWhyUsTab should call service', async () => {
      const dto = { slug: 'efficiency', label: 'Efficiency' };
      await controller.upsertWhyUsTab(dto as any);
      expect(cmsService.upsertWhyUsTab).toHaveBeenCalledWith(dto);
    });

    it('findAllAiCards should call service', async () => {
      await controller.findAllAiCards();
      expect(cmsService.findAllAiCards).toHaveBeenCalledWith();
    });

    it('upsertAiCard should call service', async () => {
      const dto = { slug: 'resume', name: 'Resume', tagline: 'tag' };
      await controller.upsertAiCard(dto as any);
      expect(cmsService.upsertAiCard).toHaveBeenCalledWith(dto);
    });
  });

  describe('Resources', () => {
    it('findAllResources should call service with pagination and categorySlug', async () => {
      const pagination = { page: 1, pageSize: 20 };
      await controller.findAllResources(pagination as any, 'whitepaper');
      expect(cmsService.findAllResources).toHaveBeenCalledWith(1, 20, 'whitepaper');
    });

    it('findAllResources should pass undefined categorySlug when omitted', async () => {
      const pagination = { page: 1, pageSize: 20 };
      await controller.findAllResources(pagination as any, undefined);
      expect(cmsService.findAllResources).toHaveBeenCalledWith(1, 20, undefined);
    });

    it('createResource should call service', async () => {
      const dto = { categoryId: 'c1', slug: 'wp-1', title: 'WP 1' };
      await controller.createResource(dto as any);
      expect(cmsService.createResource).toHaveBeenCalledWith(dto);
    });
  });

  describe('Navigation & Translations', () => {
    it('findNavigation should call service', async () => {
      await controller.findNavigation('main');
      expect(cmsService.findNavigation).toHaveBeenCalledWith('main');
    });

    it('findTranslations should call service with locale and context', async () => {
      await controller.findTranslations('zh', 'cms');
      expect(cmsService.findTranslations).toHaveBeenCalledWith('zh', 'cms');
    });

    it('findTranslations should call service with undefined context', async () => {
      await controller.findTranslations('zh', undefined);
      expect(cmsService.findTranslations).toHaveBeenCalledWith('zh', undefined);
    });

    it('findAllTranslations should call service with query', async () => {
      const query = { page: 2, pageSize: 10, locale: 'zh', context: 'cms' };
      await controller.findAllTranslations(query as any);
      expect(cmsService.findAllTranslations).toHaveBeenCalledWith(2, 10, 'zh', 'cms');
    });

    it('upsertTranslation should call service', async () => {
      const dto = { locale: 'zh', key: 'a', value: 'A' };
      await controller.upsertTranslation(dto as any);
      expect(cmsService.upsertTranslation).toHaveBeenCalledWith(dto);
    });

    it('updateTranslation should call service', async () => {
      const dto = { value: 'B' };
      await controller.updateTranslation('1', dto as any);
      expect(cmsService.updateTranslation).toHaveBeenCalledWith('1', dto);
    });

    it('deleteTranslation should call service', async () => {
      await controller.deleteTranslation('1');
      expect(cmsService.deleteTranslation).toHaveBeenCalledWith('1');
    });
  });

  describe('Sections', () => {
    it('findSectionsByPage should call service', async () => {
      await controller.findSectionsByPage('p1');
      expect(cmsService.findSectionsByPage).toHaveBeenCalledWith('p1');
    });

    it('createSection should call service', async () => {
      const dto = { pageId: 'p1', type: 'hero' };
      await controller.createSection(dto as any);
      expect(cmsService.createSection).toHaveBeenCalledWith(dto);
    });

    it('updateSection should call service', async () => {
      const dto = { type: 'features' };
      await controller.updateSection('s1', dto as any);
      expect(cmsService.updateSection).toHaveBeenCalledWith('s1', dto);
    });

    it('deleteSection should call service', async () => {
      await controller.deleteSection('s1');
      expect(cmsService.deleteSection).toHaveBeenCalledWith('s1');
    });

    it('batchUpdateSections should call service', async () => {
      const dto = { sections: [{ id: 's1', sortOrder: 1, isActive: true }] };
      await controller.batchUpdateSections(dto as any);
      expect(cmsService.batchUpdateSections).toHaveBeenCalledWith(dto.sections);
    });
  });

  describe('Generic content CRUD', () => {
    it('findAllContent should resolve type and call generic service', async () => {
      const pagination = { page: 1, pageSize: 20, status: 'PUBLISHED' };
      const result = { data: [], meta: { total: 0 } };
      (cmsGenericService.findAll as jest.Mock).mockResolvedValue(result);

      await expect(controller.findAllContent('products', pagination as any)).resolves.toEqual(result);
      expect(cmsGenericService.findAll).toHaveBeenCalledWith('product', 1, 20, { status: 'PUBLISHED' });
    });

    it('findAllContent should pass status all', async () => {
      const pagination = { page: 1, pageSize: 20, status: 'all' };
      (cmsGenericService.findAll as jest.Mock).mockResolvedValue({ data: [], meta: { total: 0 } });

      await controller.findAllContent('products', pagination as any);
      expect(cmsGenericService.findAll).toHaveBeenCalledWith('product', 1, 20, { status: 'all' });
    });

    it('findAllContent should throw for unknown type', async () => {
      const pagination = { page: 1, pageSize: 20 };
      expect(() => controller.findAllContent('unknown', pagination as any)).toThrow(NotFoundException);
    });

    it('findContentBySlug should resolve type and call generic service', async () => {
      const item = { id: '1', slug: 'home' };
      (cmsGenericService.findBySlug as jest.Mock).mockResolvedValue(item);

      const result = await controller.findContentBySlug('case-studies', 'home');
      expect(cmsGenericService.findBySlug).toHaveBeenCalledWith('caseStudy', 'home');
      expect(result).toEqual(item);
    });

    it('createContent should resolve type and call generic service', async () => {
      const data = { slug: 'new' };
      const created = { id: '1', ...data };
      (cmsGenericService.create as jest.Mock).mockResolvedValue(created);

      const result = await controller.createContent('resources', data);
      expect(cmsGenericService.create).toHaveBeenCalledWith('resource', data);
      expect(result).toEqual(created);
    });

    it('updateContent should resolve type and call generic service', async () => {
      const data = { title: 'updated' };
      const updated = { id: '1', ...data };
      (cmsGenericService.update as jest.Mock).mockResolvedValue(updated);

      const result = await controller.updateContent('why-us', '1', data);
      expect(cmsGenericService.update).toHaveBeenCalledWith('whyUsTab', '1', data);
      expect(result).toEqual(updated);
    });

    it('deleteContent should resolve type and call generic service', async () => {
      (cmsGenericService.delete as jest.Mock).mockResolvedValue({ message: '删除成功' });

      const result = await controller.deleteContent('ai-cards', '1');
      expect(cmsGenericService.delete).toHaveBeenCalledWith('aiCard', '1');
      expect(result).toEqual({ message: '删除成功' });
    });
  });
});
