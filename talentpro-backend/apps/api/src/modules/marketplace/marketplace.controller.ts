import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Cacheable, CacheEvict } from '@shared/decorators/cache.decorator';
import { Public } from '@shared/decorators/public.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@shared/decorators/roles.decorator';
import { Permission } from '@shared/decorators/permission.decorator';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { MarketplaceService } from './marketplace.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateVendorDto, UpdateVendorDto } from './dto/create-vendor.dto';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/create-category.dto';
import { AppStatus, PricingModel, SubscriptionStatus } from '@prisma/client';

@ApiTags('应用市场')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private marketplaceService: MarketplaceService) {}

  @Get('apps')
  @Public()
  @Cacheable({ key: 'marketplace:apps', ttl: 300 })
  @ApiOperation({ summary: '应用列表' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'pricingModel', required: false, enum: PricingModel })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  findAllApps(
    @Query('category') category?: string,
    @Query('pricingModel') pricingModel?: PricingModel,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const p = Math.max(1, Number(page) || 1);
    const ps = Math.max(1, Number(pageSize) || 20);
    return this.marketplaceService.findAllApps({ category, pricingModel, search, sort, page: p, pageSize: ps });
  }

  @Get('apps/featured')
  @Public()
  @Cacheable({ key: 'marketplace:featured', ttl: 300 })
  @ApiOperation({ summary: '精选应用' })
  findFeaturedApps() {
    return this.marketplaceService.findFeaturedApps();
  }

  @Get('apps/:slug')
  @Public()
  @Cacheable({ key: 'marketplace:app', ttl: 300 })
  @ApiOperation({ summary: '应用详情' })
  findAppBySlug(@Param('slug') slug: string) {
    return this.marketplaceService.findAppBySlug(slug);
  }

  @Get('categories')
  @Public()
  @Cacheable({ key: 'marketplace:categories', ttl: 300 })
  @ApiOperation({ summary: '应用分类列表' })
  findCategories() {
    return this.marketplaceService.findCategories();
  }

  @Get('apps/:slug/reviews')
  @Public()
  @ApiOperation({ summary: '应用评价列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  findReviews(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const p = Math.max(1, Number(page) || 1);
    const ps = Math.max(1, Number(pageSize) || 20);
    return this.marketplaceService.findReviews(slug, p, ps);
  }

  @Post('apps/:slug/reviews')
  @ApiBearerAuth()
  @ApiOperation({ summary: '发表应用评价' })
  createReview(
    @Param('slug') slug: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.marketplaceService.createReview(slug, userId, dto);
  }

  @Post('apps/:slug/install')
  @ApiBearerAuth()
  @ApiOperation({ summary: '安装应用（创建试用订阅）' })
  installApp(
    @Param('slug') slug: string,
    @CurrentUser() user: { workspaceId: string; id: string },
  ) {
    return this.marketplaceService.installApp(slug, user.workspaceId, user.id);
  }

  @Get('workspace/apps')
  @ApiBearerAuth()
  @ApiOperation({ summary: '工作空间已安装应用' })
  getWorkspaceApps(@CurrentUser() user: { workspaceId: string }) {
    return this.marketplaceService.getWorkspaceApps(user.workspaceId);
  }

  @Get('workspace/subscriptions')
  @ApiBearerAuth()
  @ApiOperation({ summary: '工作空间订阅列表' })
  getWorkspaceSubscriptions(@CurrentUser() user: { workspaceId: string }) {
    return this.marketplaceService.getWorkspaceSubscriptions(user.workspaceId);
  }
}

@ApiTags('应用市场管理')
@Controller('admin/marketplace')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class MarketplaceAdminController {
  constructor(private marketplaceService: MarketplaceService) {}

  @Get('apps')
  @ApiOperation({ summary: 'Admin 应用列表' })
  @ApiQuery({ name: 'status', required: false, enum: AppStatus })
  @ApiQuery({ name: 'category', required: false })
  findAllAppsForAdmin(
    @Query() pagination: PaginationDto,
    @Query('status') status?: AppStatus,
    @Query('category') category?: string,
  ) {
    return this.marketplaceService.findAllAppsForAdmin({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status,
      category,
    });
  }

  @Patch('apps/:id/status')
  @CacheEvict({ keys: ['marketplace:apps', 'marketplace:featured', 'marketplace:app'] })
  @Permission('marketplace_app:update')
  @ApiOperation({ summary: '更新应用状态' })
  updateAppStatus(
    @Param('id') id: string,
    @Body('status') status: AppStatus,
  ) {
    return this.marketplaceService.updateAppStatus(id, status);
  }

  @Post('apps/:id/feature')
  @CacheEvict({ keys: ['marketplace:apps', 'marketplace:featured', 'marketplace:app'] })
  @Permission('marketplace_app:update')
  @ApiOperation({ summary: '设置应用推荐' })
  featureApp(
    @Param('id') id: string,
    @Body('featured') featured: boolean,
    @Body('sortOrder') sortOrder?: number,
  ) {
    return this.marketplaceService.featureApp(id, featured, sortOrder);
  }

  // ─── Admin Subscriptions ───

  @Get('subscriptions')
  @ApiOperation({ summary: 'Admin 订阅列表' })
  @ApiQuery({ name: 'status', required: false, enum: SubscriptionStatus })
  findAllSubscriptionsForAdmin(
    @Query() pagination: PaginationDto,
    @Query('status') status?: SubscriptionStatus,
  ) {
    return this.marketplaceService.findAllSubscriptionsForAdmin({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status,
    });
  }

  @Patch('subscriptions/:id/status')
  @Permission('marketplace_subscription:update')
  @ApiOperation({ summary: 'Admin 更新订阅状态' })
  updateSubscriptionStatus(
    @Param('id') id: string,
    @Body('status') status: SubscriptionStatus,
  ) {
    return this.marketplaceService.updateSubscriptionStatus(id, status);
  }

  // ─── Admin Vendors ───

  @Get('vendors')
  @ApiOperation({ summary: '厂商列表' })
  findAllVendors(@Query() pagination: PaginationDto) {
    return this.marketplaceService.findAllVendors({ page: pagination.page, pageSize: pagination.pageSize });
  }

  @Post('vendors')
  @Permission('marketplace_vendor:create')
  @ApiOperation({ summary: '创建厂商' })
  createVendor(@Body() dto: CreateVendorDto) {
    return this.marketplaceService.createVendor(dto);
  }

  @Patch('vendors/:id')
  @Permission('marketplace_vendor:update')
  @ApiOperation({ summary: '更新厂商' })
  updateVendor(@Param('id') id: string, @Body() dto: UpdateVendorDto) {
    return this.marketplaceService.updateVendor(id, dto);
  }

  @Delete('vendors/:id')
  @Permission('marketplace_vendor:delete')
  @ApiOperation({ summary: '删除厂商' })
  deleteVendor(@Param('id') id: string) {
    return this.marketplaceService.deleteVendor(id);
  }

  // ─── Admin Categories ───

  @Get('categories')
  @ApiOperation({ summary: '分类列表（Admin）' })
  findAllCategoriesForAdmin(@Query() pagination: PaginationDto) {
    return this.marketplaceService.findAllCategoriesForAdmin({ page: pagination.page, pageSize: pagination.pageSize });
  }

  @Post('categories')
  @Permission('marketplace_category:create')
  @ApiOperation({ summary: '创建分类' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.marketplaceService.createCategory(dto);
  }

  @Patch('categories/:id')
  @Permission('marketplace_category:update')
  @ApiOperation({ summary: '更新分类' })
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.marketplaceService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @Permission('marketplace_category:delete')
  @ApiOperation({ summary: '删除分类' })
  deleteCategory(@Param('id') id: string) {
    return this.marketplaceService.deleteCategory(id);
  }
}
