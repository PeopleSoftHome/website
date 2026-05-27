import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { PostStatus, CommentStatus } from '@prisma/client';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('博客管理')
@Controller('blogs')
export class BlogController {
  constructor(private blogService: BlogService) {}

  // Categories
  @Get('categories')
  @Public()
  @ApiOperation({ summary: '文章分类列表' })
  findAllCategories() {
    return this.blogService.findAllCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建分类' })
  createCategory(@Body() dto: { name: string; slug: string; description?: string }) {
    return this.blogService.createCategory(dto);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新分类' })
  updateCategory(@Param('id') id: string, @Body() dto: { name?: string; description?: string; sortOrder?: number }) {
    return this.blogService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除分类' })
  deleteCategory(@Param('id') id: string) {
    return this.blogService.deleteCategory(id);
  }

  // Posts
  @Get('posts')
  @Public()
  @ApiOperation({ summary: '文章列表' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false, enum: PostStatus })
  findAllPosts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('category') category?: string,
    @Query('status') status?: PostStatus,
  ) {
    return this.blogService.findAllPosts(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      category,
      status,
    );
  }

  @Get('posts/:slug')
  @Public()
  @ApiOperation({ summary: '文章详情' })
  findPostBySlug(@Param('slug') slug: string) {
    return this.blogService.findPostBySlug(slug);
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建文章' })
  createPost(
    @CurrentUser() user: any,
    @Body() dto: {
      title: string;
      slug: string;
      excerpt?: string;
      content: string;
      coverImage?: string;
      authorId: string;
      categoryId: string;
      tagIds?: string[];
      status?: PostStatus;
    },
  ) {
    return this.blogService.createPost({ ...dto, workspaceId: user.workspaceId });
  }

  @Patch('posts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新文章' })
  updatePost(@Param('id') id: string, @Body() dto: {
    title?: string; slug?: string; excerpt?: string; content?: string;
    coverImage?: string; categoryId?: string; status?: PostStatus; tagIds?: string[];
  }) {
    return this.blogService.updatePost(id, dto);
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除文章' })
  deletePost(@Param('id') id: string) {
    return this.blogService.deletePost(id);
  }

  // Tags
  @Get('tags')
  @Public()
  @ApiOperation({ summary: '标签列表' })
  findAllTags() {
    return this.blogService.findAllTags();
  }

  @Post('tags')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建标签' })
  createTag(@Body() dto: { name: string; slug: string }) {
    return this.blogService.createTag(dto);
  }

  @Delete('tags/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除标签' })
  deleteTag(@Param('id') id: string) {
    return this.blogService.deleteTag(id);
  }

  // Comments
  @Get('comments')
  @Public()
  @ApiOperation({ summary: '评论列表' })
  findComments(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.blogService.findComments(entityType, entityId, page ? parseInt(page, 10) : 1, pageSize ? parseInt(pageSize, 10) : 20);
  }

  @Post('comments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '发表评论' })
  createComment(
    @CurrentUser('id') authorId: string,
    @Body() dto: {
      entityType: string;
      entityId: string;
      content: string;
      parentId?: string;
      workspaceId?: string;
    },
  ) {
    return this.blogService.createComment({ ...dto, authorId });
  }

  @Patch('comments/:id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '审核评论' })
  moderateComment(@Param('id') id: string, @Body() dto: { status: CommentStatus }) {
    return this.blogService.moderateComment(id, dto.status);
  }

  @Post('comments/batch-moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '批量审核评论' })
  batchModerateComments(@Body() dto: { ids: string[]; status: CommentStatus }) {
    return this.blogService.batchModerateComments(dto.ids, dto.status);
  }

  @Get('admin/comments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin 评论列表（支持按状态过滤）' })
  findCommentsForAdmin(
    @Query('status') status?: CommentStatus,
    @Query('entityType') entityType?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.blogService.findCommentsForAdmin({
      status,
      entityType,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    });
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除评论' })
  deleteComment(@Param('id') id: string) {
    return this.blogService.deleteComment(id);
  }
}
