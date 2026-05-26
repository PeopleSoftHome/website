import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ForumService } from './forum.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('社区论坛')
@Controller('forums')
export class ForumController {
  constructor(private forumService: ForumService) {}

  // Categories
  @Get('categories')
  @Public()
  @ApiOperation({ summary: '论坛分类列表' })
  findAllCategories() {
    return this.forumService.findAllCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建分类' })
  createCategory(@Body() dto: { name: string; description?: string; sortOrder?: number }) {
    return this.forumService.createCategory(dto);
  }

  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新分类' })
  updateCategory(@Param('id') id: string, @Body() dto: { name?: string; description?: string; sortOrder?: number }) {
    return this.forumService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除分类' })
  deleteCategory(@Param('id') id: string) {
    return this.forumService.deleteCategory(id);
  }

  // Topics
  @Get('topics')
  @Public()
  @ApiOperation({ summary: '话题列表' })
  @ApiQuery({ name: 'categoryId', required: false })
  findAllTopics(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.forumService.findAllTopics(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      categoryId,
    );
  }

  @Get('topics/:id')
  @Public()
  @ApiOperation({ summary: '话题详情' })
  findTopicById(@Param('id') id: string) {
    return this.forumService.findTopicById(id);
  }

  @Post('topics')
  @Public()
  @ApiOperation({ summary: '发布话题' })
  createTopic(@Body() dto: { categoryId: string; authorId: string; title: string; content: string }) {
    return this.forumService.createTopic(dto);
  }

  @Patch('topics/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新话题' })
  updateTopic(@Param('id') id: string, @Body() dto: { title?: string; content?: string; categoryId?: string }) {
    return this.forumService.updateTopic(id, dto);
  }

  @Delete('topics/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除话题' })
  deleteTopic(@Param('id') id: string) {
    return this.forumService.deleteTopic(id);
  }

  @Patch('topics/:id/pin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '置顶/取消置顶' })
  togglePin(@Param('id') id: string, @Body() dto: { isPinned: boolean }) {
    return this.forumService.togglePin(id, dto.isPinned);
  }

  @Patch('topics/:id/lock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '锁定/解锁话题' })
  toggleLock(@Param('id') id: string, @Body() dto: { isLocked: boolean }) {
    return this.forumService.toggleLock(id, dto.isLocked);
  }

  // Posts (Replies)
  @Post('posts')
  @Public()
  @ApiOperation({ summary: '回复话题' })
  createPost(@Body() dto: { topicId: string; authorId: string; content: string }) {
    return this.forumService.createPost(dto);
  }

  @Patch('posts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新回复' })
  updatePost(@Param('id') id: string, @Body() dto: { content: string }) {
    return this.forumService.updatePost(id, dto);
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除回复' })
  deletePost(@Param('id') id: string) {
    return this.forumService.deletePost(id);
  }

  @Patch('posts/:id/solution')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '标记为解决方案' })
  markAsSolution(@Param('id') id: string) {
    return this.forumService.markAsSolution(id);
  }
}
