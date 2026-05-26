import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CmsService } from './cms.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
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
  @ApiOperation({ summary: '页面列表' })
  findAllPages(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.cmsService.findAllPages(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  @Get('pages/:slug')
  @Public()
  @ApiOperation({ summary: '页面详情' })
  findPageBySlug(@Param('slug') slug: string) {
    return this.cmsService.findPageBySlug(slug);
  }

  @Post('pages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建页面' })
  createPage(@Body() dto: { slug: string; title: string; metaTitle?: string; metaDesc?: string }) {
    return this.cmsService.createPage(dto);
  }

  // Products
  @Get('products')
  @Public()
  @ApiOperation({ summary: '产品矩阵' })
  findAllProducts() {
    return this.cmsService.findAllProducts();
  }

  @Post('product-tabs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建产品标签' })
  createProductTab(@Body() dto: { label: string; slug: string; icon?: string; iconColor?: string; iconBg?: string }) {
    return this.cmsService.createProductTab(dto);
  }

  // Industries
  @Get('industries')
  @Public()
  @ApiOperation({ summary: '行业方案列表' })
  findAllIndustries() {
    return this.cmsService.findAllIndustries();
  }

  @Post('industries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建行业方案' })
  createIndustry(@Body() dto: { slug: string; label: string; icon?: string; features?: any[]; screenshot?: any }) {
    return this.cmsService.createIndustry(dto);
  }

  // Testimonials
  @Get('testimonials')
  @Public()
  @ApiOperation({ summary: '客户证言' })
  findAllTestimonials() {
    return this.cmsService.findAllTestimonials();
  }

  @Post('testimonials')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建客户证言' })
  createTestimonial(@Body() dto: { industry: string; product: string; text: string; name: string; title: string; avatar?: string }) {
    return this.cmsService.createTestimonial(dto);
  }

  // Resources
  @Get('resources')
  @Public()
  @ApiOperation({ summary: '资源中心' })
  @ApiQuery({ name: 'category', required: false })
  findAllResources(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('category') category?: string,
  ) {
    return this.cmsService.findAllResources(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      category,
    );
  }

  // Navigation
  @Get('navigations/:key')
  @Public()
  @ApiOperation({ summary: '获取导航' })
  findNavigation(@Param('key') key: string) {
    return this.cmsService.findNavigation(key);
  }

  @Post('navigations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新导航' })
  upsertNavigation(@Body() dto: { key: string; label: string; location?: string; items: any[] }) {
    return this.cmsService.upsertNavigation(dto);
  }

  // Translations
  @Get('translations')
  @Public()
  @ApiOperation({ summary: '获取多语言' })
  @ApiQuery({ name: 'locale', required: true })
  @ApiQuery({ name: 'context', required: false })
  findTranslations(@Query('locale') locale: string, @Query('context') context?: string) {
    return this.cmsService.findTranslations(locale, context);
  }

  @Post('translations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新翻译' })
  upsertTranslation(@Body() dto: { locale: string; key: string; value: string; context?: string }) {
    return this.cmsService.upsertTranslation(dto);
  }
}
