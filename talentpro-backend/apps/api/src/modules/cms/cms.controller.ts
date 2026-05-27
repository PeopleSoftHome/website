import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { Cacheable, CacheEvict } from '@/common/decorators/cache.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('CMS内容管理')
@Controller('cms')
export class CmsController {
  constructor(private cmsService: CmsService) {}

  // Pages
  @Get('pages')
  @Public()
  @Cacheable({ key: 'cms:pages', ttl: 300 })
  @ApiOperation({ summary: '页面列表' })
  findAllPages(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.cmsService.findAllPages(page ? parseInt(page, 10) : 1, pageSize ? parseInt(pageSize, 10) : 20);
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
  @ApiBearerAuth()
  @CacheEvict({ key: 'cms:pages' })
  @ApiOperation({ summary: '创建页面' })
  createPage(@Body() dto: { slug: string; title: string; metaTitle?: string; metaDesc?: string }) {
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

  @Post('product-tabs')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @CacheEvict({ key: 'cms:products' })
  @ApiOperation({ summary: '创建产品标签' })
  createProductTab(@Body() dto: { label: string; slug: string; icon?: string; iconColor?: string; iconBg?: string }) {
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

  @Post('industries')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @CacheEvict({ key: 'cms:industries' })
  @ApiOperation({ summary: '创建行业方案' })
  createIndustry(@Body() dto: { slug: string; label: string; icon?: string; features?: any[]; screenshot?: any }) {
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
  @ApiBearerAuth()
  @CacheEvict({ key: 'cms:stats' })
  @ApiOperation({ summary: '创建/更新统计项' })
  upsertStat(@Body() dto: { key: string; label: string; value: string; suffix?: string; prefix?: string; sortOrder?: number }) {
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
  @ApiBearerAuth()
  @CacheEvict({ key: 'cms:logos' })
  @ApiOperation({ summary: '创建Logo' })
  createLogo(@Body() dto: { name: string; logo: string; industry?: string; sortOrder?: number }) {
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
  @ApiBearerAuth()
  @CacheEvict({ key: 'cms:why-us' })
  @ApiOperation({ summary: '创建/更新WhyUs Tab' })
  upsertWhyUsTab(@Body() dto: { slug: string; label: string; icon?: string; metrics?: any[]; sortOrder?: number }) {
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
  @ApiBearerAuth()
  @CacheEvict({ key: 'cms:ai-cards' })
  @ApiOperation({ summary: '创建/更新AI卡片' })
  upsertAiCard(@Body() dto: { slug: string; name: string; tagline: string; description?: string; icon?: string; features?: any[]; color?: string; sortOrder?: number }) {
    return this.cmsService.upsertAiCard(dto);
  }

  // Resources
  @Get('resources')
  @Public()
  @Cacheable({ key: 'cms:resources', ttl: 300 })
  @ApiOperation({ summary: '资源中心' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'categorySlug', required: false })
  findAllResources(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('categorySlug') categorySlug?: string,
  ) {
    return this.cmsService.findAllResources(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      categorySlug,
    );
  }

  @Post('resources')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @CacheEvict({ key: 'cms:resources' })
  @ApiOperation({ summary: '创建资源' })
  createResource(@Body() dto: { categoryId: string; slug: string; title: string; description?: string; type?: string; coverImage?: string; fileUrl?: string; requiresLeadInfo?: boolean }) {
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
}
