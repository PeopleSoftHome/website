import { Injectable } from '@nestjs/common';
import { CmsPageService } from './cms-page.service';
import { CmsContentService } from './cms-content.service';

/**
 * CmsService — Facade
 * 组合 Page / Content 两个子服务，对外保持统一接口
 */
@Injectable()
export class CmsService {
  constructor(
    private pageService: CmsPageService,
    private contentService: CmsContentService,
  ) {}

  // ─── Page (delegate) ───
  findAllPages(page?: number, pageSize?: number) { return this.pageService.findAllPages(page, pageSize); }
  findPageBySlug(slug: string) { return this.pageService.findPageBySlug(slug); }
  createPage(data: Parameters<CmsPageService['createPage']>[0]) { return this.pageService.createPage(data); }
  updatePage(id: string, data: Parameters<CmsPageService['updatePage']>[1]) { return this.pageService.updatePage(id, data); }
  deletePage(id: string) { return this.pageService.deletePage(id); }

  // ─── Section (delegate) ───
  findSectionsByPage(pageId: string) { return this.pageService.findSectionsByPage(pageId); }
  createSection(data: any) { return this.pageService.createSection(data); }
  updateSection(id: string, data: any) { return this.pageService.updateSection(id, data); }
  deleteSection(id: string) { return this.pageService.deleteSection(id); }
  batchUpdateSections(sections: any[]) { return this.pageService.batchUpdateSections(sections); }

  // ─── Navigation (delegate) ───
  findNavigation(key: string) { return this.pageService.findNavigation(key); }
  upsertNavigation(data: Parameters<CmsPageService['upsertNavigation']>[0]) { return this.pageService.upsertNavigation(data); }

  // ─── Translation (delegate) ───
  findTranslations(locale: string, context?: string) { return this.pageService.findTranslations(locale, context); }
  upsertTranslation(data: Parameters<CmsPageService['upsertTranslation']>[0]) { return this.pageService.upsertTranslation(data); }

  // ─── Product (delegate) ───
  findAllProducts() { return this.contentService.findAllProducts(); }
  createProductTab(data: Parameters<CmsContentService['createProductTab']>[0]) { return this.contentService.createProductTab(data); }
  createProduct(data: Parameters<CmsContentService['createProduct']>[0]) { return this.contentService.createProduct(data); }

  // ─── Industry (delegate) ───
  findAllIndustries() { return this.contentService.findAllIndustries(); }
  createIndustry(data: Parameters<CmsContentService['createIndustry']>[0]) { return this.contentService.createIndustry(data); }

  // ─── Testimonial (delegate) ───
  findAllTestimonials() { return this.contentService.findAllTestimonials(); }
  createTestimonial(data: Parameters<CmsContentService['createTestimonial']>[0]) { return this.contentService.createTestimonial(data); }

  // ─── Stats (delegate) ───
  findAllStats() { return this.contentService.findAllStats(); }
  upsertStat(data: Parameters<CmsContentService['upsertStat']>[0]) { return this.contentService.upsertStat(data); }

  // ─── Client Logos (delegate) ───
  findAllLogos() { return this.contentService.findAllLogos(); }
  upsertLogo(data: Parameters<CmsContentService['upsertLogo']>[0]) { return this.contentService.upsertLogo(data); }

  // ─── WhyUs (delegate) ───
  findAllWhyUsTabs() { return this.contentService.findAllWhyUsTabs(); }
  upsertWhyUsTab(data: Parameters<CmsContentService['upsertWhyUsTab']>[0]) { return this.contentService.upsertWhyUsTab(data); }

  // ─── AI Family (delegate) ───
  findAllAiCards() { return this.contentService.findAllAiCards(); }
  upsertAiCard(data: Parameters<CmsContentService['upsertAiCard']>[0]) { return this.contentService.upsertAiCard(data); }

  // ─── Resource (delegate) ───
  findAllResources(page?: number, pageSize?: number, categorySlug?: string) { return this.contentService.findAllResources(page, pageSize, categorySlug); }
  createResourceCategory(data: Parameters<CmsContentService['createResourceCategory']>[0]) { return this.contentService.createResourceCategory(data); }
  createResource(data: Parameters<CmsContentService['createResource']>[0]) { return this.contentService.createResource(data); }
}
