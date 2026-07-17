import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { PostStatus } from '@prisma/client';
import { RolesGuard } from '@shared/guards';
import { Roles } from '@shared/decorators/roles.decorator';
import { Permission } from '@shared/decorators/permission.decorator';
import { Public } from '@shared/decorators/public.decorator';
import { Cacheable, CacheEvict } from '@shared/decorators/cache.decorator';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { UserContext } from '@shared/types';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { CreateBlogTagDto } from './dto/create-blog-tag.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ModerateCommentDto } from './dto/moderate-comment.dto';
import { BatchModerateCommentsDto } from './dto/batch-moderate-comments.dto';
import { FindAdminCommentsDto } from './dto/find-admin-comments.dto';

@ApiTags('博客管理')
@Controller('blogs')
export class BlogController {
  constructor(private blogService: BlogService) {}

  // Categories
  @Get('categories')
  @Public()
  @Cacheable({ key: 'blog:categories', ttl: 300 })
  @ApiOperation({ summary: '文章分类列表' })
  findAllCategories() {
    return this.blogService.findAllCategories();
  }

  @Post('categories')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('blog_category:create')
  @CacheEvict({ keys: ['blog:categories'] })
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建分类' })
  createCategory(@Body() dto: CreateBlogCategoryDto) {
    return this.blogService.createCategory(dto);
  }

  @Patch('categories/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('blog_category:update')
  @CacheEvict({ keys: ['blog:categories'] })
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新分类' })
  updateCategory(@Param('id') id: string, @Body() dto: UpdateBlogCategoryDto) {
    return this.blogService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('blog_category:delete')
  @CacheEvict({ keys: ['blog:categories'] })
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除分类' })
  deleteCategory(@Param('id') id: string) {
    return this.blogService.deleteCategory(id);
  }

  // Posts
  @Get('posts')
  @Public()
  @Cacheable({ key: 'blog:posts', ttl: 300 })
  @ApiOperation({ summary: '文章列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false, enum: PostStatus })
  findAllPosts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('category') category?: string,
    @Query('status') status?: PostStatus,
  ) {
    const p = Math.max(1, Number(page) || 1);
    const ps = Math.max(1, Number(pageSize) || 20);
    return this.blogService.findAllPosts(p, ps, category, status);
  }

  @Get('posts/:slug')
  @Public()
  @Cacheable({ key: 'blog:post', ttl: 300 })
  @ApiOperation({ summary: '文章详情' })
  findPostBySlug(@Param('slug') slug: string) {
    return this.blogService.findPostBySlug(slug);
  }

  @Post('posts')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('blog_post:create')
  @CacheEvict({ keys: ['blog:posts', 'blog:post', 'blog:categories', 'blog:tags'] })
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建文章' })
  createPost(
    @CurrentUser() user: UserContext,
    @Body() dto: CreateBlogPostDto,
  ) {
    return this.blogService.createPost({ ...dto, authorId: user.id, workspaceId: user.workspaceId });
  }

  @Patch('posts/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('blog_post:update')
  @CacheEvict({ keys: ['blog:posts', 'blog:post', 'blog:categories', 'blog:tags'] })
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新文章' })
  updatePost(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
    @Body() dto: UpdateBlogPostDto,
  ) {
    return this.blogService.updatePost(id, dto, user.workspaceId);
  }

  @Delete('posts/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('blog_post:delete')
  @CacheEvict({ keys: ['blog:posts', 'blog:post', 'blog:categories', 'blog:tags'] })
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除文章' })
  deletePost(@Param('id') id: string, @CurrentUser() user: UserContext) {
    return this.blogService.deletePost(id, user.workspaceId);
  }

  // Tags
  @Get('tags')
  @Public()
  @Cacheable({ key: 'blog:tags', ttl: 300 })
  @ApiOperation({ summary: '标签列表' })
  findAllTags() {
    return this.blogService.findAllTags();
  }

  @Post('tags')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('blog_tag:create')
  @CacheEvict({ keys: ['blog:tags'] })
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建标签' })
  createTag(@Body() dto: CreateBlogTagDto) {
    return this.blogService.createTag(dto);
  }

  @Delete('tags/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('blog_tag:delete')
  @CacheEvict({ keys: ['blog:tags'] })
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除标签' })
  deleteTag(@Param('id') id: string) {
    return this.blogService.deleteTag(id);
  }

  // Comments
  @Get('comments')
  @Public()
  @Cacheable({ key: 'blog:comments', ttl: 300 })
  @ApiOperation({ summary: '评论列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  findComments(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const p = Math.max(1, Number(page) || 1);
    const ps = Math.max(1, Number(pageSize) || 20);
    return this.blogService.findComments(entityType, entityId, p, ps);
  }

  @Post('comments')
  @ApiBearerAuth()
  @Permission('comment:create')
  @CacheEvict({ keys: ['blog:comments', 'blog:post'] })
  @ApiOperation({ summary: '发表评论' })
  createComment(
    @CurrentUser('id') authorId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.blogService.createComment({ ...dto, authorId });
  }

  @Patch('comments/:id/moderate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('comment:update')
  @CacheEvict({ keys: ['blog:comments', 'blog:post'] })
  @ApiBearerAuth()
  @ApiOperation({ summary: '审核评论' })
  moderateComment(@Param('id') id: string, @Body() dto: ModerateCommentDto) {
    return this.blogService.moderateComment(id, dto.status);
  }

  @Post('comments/batch-moderate')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('comment:update')
  @CacheEvict({ keys: ['blog:comments', 'blog:post'] })
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量审核评论' })
  batchModerateComments(@Body() dto: BatchModerateCommentsDto) {
    return this.blogService.batchModerateComments(dto.ids, dto.status);
  }

  @Get('admin/comments')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin 评论列表（支持按状态过滤）' })
  findCommentsForAdmin(@Query() query: FindAdminCommentsDto) {
    return this.blogService.findCommentsForAdmin({
      status: query.status,
      entityType: query.entityType,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Delete('comments/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('comment:delete')
  @CacheEvict({ keys: ['blog:comments', 'blog:post'] })
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除评论' })
  deleteComment(@Param('id') id: string) {
    return this.blogService.deleteComment(id);
  }
}
