import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, ValidationPipe,
  NotFoundException,
} from '@nestjs/common';
import { Cacheable, CacheEvict } from '@shared/decorators/cache.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { CmsGenericService } from './cms-generic.service';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@shared/decorators/roles.decorator';
import { Permission } from '@shared/decorators/permission.decorator';
import { Public } from '@shared/decorators/public.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { CreatePageDto } from './dto/create-page.dto';
import { CreateProductTabDto } from './dto/create-product-tab.dto';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpsertStatDto } from './dto/upsert-stat.dto';
import { CreateLogoDto } from './dto/create-logo.dto';
import { UpsertWhyUsTabDto } from './dto/upsert-why-us-tab.dto';
import { UpsertAiCardDto } from './dto/upsert-ai-card.dto';
import { CreateResourceDto } from './dto/create-resource.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { BatchUpdateSectionsDto } from './dto/batch-update-sections.dto';
import { FindCmsContentDto } from './dto/find-cms-content.dto';
import { FindTranslationListDto } from './dto/find-translation-list.dto';
import { UpsertTranslationDto } from './dto/upsert-translation.dto';
import { UpdateTranslationDto } from './dto/update-translation.dto';

@ApiTags('CMS内容管理')
@Controller('cms')
export class CmsController {
  constructor(
    private cmsService: CmsService,
    private cmsGenericService: CmsGenericService,
  ) {}

  // URL 类型标识 → Prisma 模型名映射（支持 kebab / 复数 / 单数别名）
  private readonly contentTypeMap: Record<string, string> = {
    'product-tabs': 'productTab',
    'product-tab': 'productTab',
    productTab: 'productTab',
    products: 'product',
    product: 'product',
    industries: 'industry',
    industry: 'industry',
    testimonials: 'testimonial',
    testimonial: 'testimonial',
    stats: 'stat',
    stat: 'stat',
    logos: 'clientLogo',
    logo: 'clientLogo',
    clientLogo: 'clientLogo',
    'why-us': 'whyUsTab',
    whyUs: 'whyUsTab',
    whyUsTab: 'whyUsTab',
    'ai-cards': 'aiCard',
    'ai-card': 'aiCard',
    aiCard: 'aiCard',
    'resource-categories': 'resourceCategory',
    'resource-category': 'resourceCategory',
    resourceCategory: 'resourceCategory',
    resources: 'resource',
    resource: 'resource',
    'case-studies': 'caseStudy',
    'case-study': 'caseStudy',
    caseStudy: 'caseStudy',
    jobs: 'job',
    job: 'job',
  };

  private resolveContentType(type: string): string {
    const model = this.contentTypeMap[type];
    if (!model) throw new NotFoundException(`CMS content type "${type}" not found`);
    return model;
  }

  // Pages
  @Get('pages')
  @Public()
  @Cacheable({ key: 'cms:pages', ttl: 300 })
  @ApiOperation({ summary: '页面列表' })
  findAllPages(@Query() pagination: PaginationDto) {
    return this.cmsService.findAllPages(pagination.page, pagination.pageSize);
  }

  @Get('pages/:slug')
  @Public()
  @Cacheable({ key: 'cms:page', ttl: 300 })
  @ApiOperation({ summary: '页面详情' })
  findPageBySlug(@Param('slug') slug: string) {
    return this.cmsService.findPageBySlug(slug);
  }

  @Post('pages')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:create')
  @ApiBearerAuth()
  @CacheEvict({ key: 'cms:pages' })
  @ApiOperation({ summary: '创建页面' })
  createPage(@Body() dto: CreatePageDto) {
    return this.cmsService.createPage(dto);
  }

  // Products
  @Get('products')
  @Public()
  @Cacheable({ key: 'cms:products', ttl: 300 })
  @ApiOperation({ summary: '产品矩阵' })
  findAllProducts() {
    return this.cmsService.findAllProducts();
  }

  @Get('products/:slug')
  @Public()
  @Cacheable({ key: 'cms:product', ttl: 300 })
  @ApiOperation({ summary: '产品详情' })
  findProductBySlug(@Param('slug') slug: string) {
    return this.cmsService.findProductBySlug(slug);
  }

  @Post('product-tabs')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:create')
  @ApiBearerAuth()
  @CacheEvict({ key: 'cms:products' })
  @ApiOperation({ summary: '创建产品标签' })
  createProductTab(@Body() dto: CreateProductTabDto) {
    return this.cmsService.createProductTab(dto);
  }

  // Industries
  @Get('industries')
  @Public()
  @Cacheable({ key: 'cms:industries', ttl: 300 })
  @ApiOperation({ summary: '行业方案列表' })
  findAllIndustries() {
    return this.cmsService.findAllIndustries();
  }

  @Get('industries/:slug')
  @Public()
  @Cacheable({ key: 'cms:industry', ttl: 300 })
  @ApiOperation({ summary: '行业方案详情' })
  findIndustryBySlug(@Param('slug') slug: string) {
    return this.cmsService.findIndustryBySlug(slug);
  }

  @Post('industries')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:create')
  @ApiBearerAuth()
  @CacheEvict({ key: 'cms:industries' })
  @ApiOperation({ summary: '创建行业方案' })
  createIndustry(@Body() dto: CreateIndustryDto) {
    return this.cmsService.createIndustry(dto);
  }

  // Testimonials
  @Get('testimonials')
  @Public()
  @Cacheable({ key: 'cms:testimonials', ttl: 300 })
  @ApiOperation({ summary: '客户证言' })
  findAllTestimonials() {
    return this.cmsService.findAllTestimonials();
  }

  // Stats
  @Get('stats')
  @Public()
  @Cacheable({ key: 'cms:stats', ttl: 300 })
  @ApiOperation({ summary: '统计数据' })
  findAllStats() {
    return this.cmsService.findAllStats();
  }

  @Post('stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:update')
  @ApiBearerAuth()
  @CacheEvict({ key: 'cms:stats' })
  @ApiOperation({ summary: '创建/更新统计项' })
  upsertStat(@Body() dto: UpsertStatDto) {
    return this.cmsService.upsertStat(dto);
  }

  // Logos
  @Get('logos')
  @Public()
  @Cacheable({ key: 'cms:logos', ttl: 300 })
  @ApiOperation({ summary: '客户Logo墙' })
  findAllLogos() {
    return this.cmsService.findAllLogos();
  }

  @Post('logos')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:update')
  @ApiBearerAuth()
  @CacheEvict({ key: 'cms:logos' })
  @ApiOperation({ summary: '创建Logo' })
  createLogo(@Body() dto: CreateLogoDto) {
    return this.cmsService.upsertLogo(dto);
  }

  // WhyUs
  @Get('why-us')
  @Public()
  @Cacheable({ key: 'cms:why-us', ttl: 300 })
  @ApiOperation({ summary: '为什么选我们' })
  findAllWhyUsTabs() {
    return this.cmsService.findAllWhyUsTabs();
  }

  @Post('why-us')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:update')
  @ApiBearerAuth()
  @CacheEvict({ key: 'cms:why-us' })
  @ApiOperation({ summary: '创建/更新WhyUs Tab' })
  upsertWhyUsTab(@Body() dto: UpsertWhyUsTabDto) {
    return this.cmsService.upsertWhyUsTab(dto);
  }

  // AI Family
  @Get('ai-cards')
  @Public()
  @Cacheable({ key: 'cms:ai-cards', ttl: 300 })
  @ApiOperation({ summary: 'AI Family 卡片' })
  findAllAiCards() {
    return this.cmsService.findAllAiCards();
  }

  @Post('ai-cards')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:update')
  @ApiBearerAuth()
  @CacheEvict({ key: 'cms:ai-cards' })
  @ApiOperation({ summary: '创建/更新AI卡片' })
  upsertAiCard(@Body() dto: UpsertAiCardDto) {
    return this.cmsService.upsertAiCard(dto);
  }

  // Resources
  @Get('resources')
  @Public()
  @Cacheable({ key: 'cms:resources', ttl: 300 })
  @ApiOperation({ summary: '资源中心' })
  @ApiQuery({ name: 'categorySlug', required: false })
  findAllResources(
    @Query() pagination: PaginationDto,
    @Query('categorySlug') categorySlug?: string,
  ) {
    return this.cmsService.findAllResources(
      pagination.page,
      pagination.pageSize,
      categorySlug,
    );
  }

  @Post('resources')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:create')
  @ApiBearerAuth()
  @CacheEvict({ key: 'cms:resources' })
  @ApiOperation({ summary: '创建资源' })
  createResource(@Body() dto: CreateResourceDto) {
    return this.cmsService.createResource(dto);
  }

  // Navigation
  @Get('navigations/:key')
  @Public()
  @Cacheable({ key: 'cms:navigations', ttl: 300 })
  @ApiOperation({ summary: '导航菜单' })
  findNavigation(@Param('key') key: string) {
    return this.cmsService.findNavigation(key);
  }

  // Translations
  @Get('translations')
  @Public()
  @Cacheable({ key: 'cms:translations', ttl: 300 })
  @ApiOperation({ summary: '多语言翻译' })
  findTranslations(@Query('locale') locale: string, @Query('context') context?: string) {
    return this.cmsService.findTranslations(locale, context);
  }

  @Get('translations/list')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:read')
  @ApiBearerAuth()
  @Cacheable({ key: 'cms:translations:list', ttl: 60 })
  @ApiOperation({ summary: '翻译列表（管理后台）' })
  findAllTranslations(@Query() query: FindTranslationListDto) {
    return this.cmsService.findAllTranslations(
      query.page,
      query.pageSize,
      query.locale,
      query.context,
    );
  }

  @Post('translations')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:create')
  @ApiBearerAuth()
  @CacheEvict({ keys: ['cms:translations', 'cms:translations:list'] })
  @ApiOperation({ summary: '创建/覆盖翻译' })
  upsertTranslation(@Body() dto: UpsertTranslationDto) {
    return this.cmsService.upsertTranslation(dto);
  }

  @Patch('translations/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:update')
  @ApiBearerAuth()
  @CacheEvict({ keys: ['cms:translations', 'cms:translations:list'] })
  @ApiOperation({ summary: '更新翻译' })
  updateTranslation(@Param('id') id: string, @Body() dto: UpdateTranslationDto) {
    return this.cmsService.updateTranslation(id, dto);
  }

  @Delete('translations/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:delete')
  @ApiBearerAuth()
  @CacheEvict({ keys: ['cms:translations', 'cms:translations:list'] })
  @ApiOperation({ summary: '删除翻译' })
  deleteTranslation(@Param('id') id: string) {
    return this.cmsService.deleteTranslation(id);
  }

  // Sections
  @Get('pages/:pageId/sections')
  @Public()
  @Cacheable({ key: 'cms:sections', ttl: 300 })
  @ApiOperation({ summary: '查询页面所有 Section' })
  findSectionsByPage(@Param('pageId') pageId: string) {
    return this.cmsService.findSectionsByPage(pageId);
  }

  @Post('sections')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:create')
  @ApiBearerAuth()
  @CacheEvict({ keys: ['cms:sections', 'cms:page'] })
  @ApiOperation({ summary: '创建 Section' })
  createSection(@Body() dto: CreateSectionDto) {
    return this.cmsService.createSection(dto);
  }

  @Patch('sections/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:update')
  @ApiBearerAuth()
  @CacheEvict({ keys: ['cms:sections', 'cms:page'] })
  @ApiOperation({ summary: '更新 Section' })
  updateSection(@Param('id') id: string, @Body() dto: UpdateSectionDto) {
    return this.cmsService.updateSection(id, dto);
  }

  @Delete('sections/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:delete')
  @ApiBearerAuth()
  @CacheEvict({ keys: ['cms:sections', 'cms:page'] })
  @ApiOperation({ summary: '删除 Section' })
  deleteSection(@Param('id') id: string) {
    return this.cmsService.deleteSection(id);
  }

  @Post('sections/batch')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:update')
  @ApiBearerAuth()
  @CacheEvict({ keys: ['cms:sections', 'cms:page'] })
  @ApiOperation({ summary: '批量更新 Section 排序与启用状态' })
  batchUpdateSections(@Body() dto: BatchUpdateSectionsDto) {
    return this.cmsService.batchUpdateSections(dto.sections);
  }

  // ─── 通用内容类型 CRUD（新增内容类型免写独立端点）───

  @Get('content/:type')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:read')
  @ApiBearerAuth()
  @Cacheable({ key: 'cms:content', ttl: 300 })
  @ApiOperation({ summary: '通用内容类型列表' })
  findAllContent(
    @Param('type') type: string,
    @Query() pagination: FindCmsContentDto,
  ) {
    const model = this.resolveContentType(type);
    return this.cmsGenericService.findAll(model, pagination.page, pagination.pageSize, {
      status: pagination.status,
    });
  }

  @Get('content/:type/:slug')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:read')
  @ApiBearerAuth()
  @Cacheable({ key: 'cms:content', ttl: 300 })
  @ApiOperation({ summary: '通用内容类型详情' })
  findContentBySlug(@Param('type') type: string, @Param('slug') slug: string) {
    const model = this.resolveContentType(type);
    return this.cmsGenericService.findBySlug(model, slug);
  }

  @Post('content/:type')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:create')
  @ApiBearerAuth()
  @CacheEvict({ key: 'cms:content' })
  @ApiOperation({ summary: '创建通用内容类型' })
  createContent(
    @Param('type') type: string,
    @Body(new ValidationPipe({ whitelist: false, transform: true })) data: Record<string, unknown>,
  ) {
    const model = this.resolveContentType(type);
    return this.cmsGenericService.create(model, data);
  }

  @Patch('content/:type/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:update')
  @ApiBearerAuth()
  @CacheEvict({ key: 'cms:content' })
  @ApiOperation({ summary: '更新通用内容类型' })
  updateContent(
    @Param('type') type: string,
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: false, transform: true })) data: Record<string, unknown>,
  ) {
    const model = this.resolveContentType(type);
    return this.cmsGenericService.update(model, id, data);
  }

  @Delete('content/:type/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('cms:delete')
  @ApiBearerAuth()
  @CacheEvict({ key: 'cms:content' })
  @ApiOperation({ summary: '删除通用内容类型' })
  deleteContent(@Param('type') type: string, @Param('id') id: string) {
    const model = this.resolveContentType(type);
    return this.cmsGenericService.delete(model, id);
  }
}
