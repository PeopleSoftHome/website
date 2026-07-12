import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ForumService } from './forum.service';
import { RolesGuard } from '@shared/guards';
import { Roles } from '@shared/decorators/roles.decorator';
import { Permission } from '@shared/decorators/permission.decorator';
import { Public } from '@shared/decorators/public.decorator';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { UserContext } from '@shared/types';

import { CreateForumTopicDto } from './dto/create-forum-topic.dto';
import { UpdateForumTopicDto } from './dto/update-forum-topic.dto';
import { CreateForumPostDto } from './dto/create-forum-post.dto';
import { UpdateForumPostDto } from './dto/update-forum-post.dto';
import { CreateForumCategoryDto } from './dto/create-forum-category.dto';
import { UpdateForumCategoryDto } from './dto/update-forum-category.dto';
import { TogglePinDto } from './dto/toggle-pin.dto';
import { ToggleLockDto } from './dto/toggle-lock.dto';

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
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('forum_category:create')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建分类' })
  createCategory(@Body() dto: CreateForumCategoryDto) {
    return this.forumService.createCategory(dto);
  }

  @Patch('categories/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('forum_category:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新分类' })
  updateCategory(@Param('id') id: string, @Body() dto: UpdateForumCategoryDto) {
    return this.forumService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('forum_category:delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除分类' })
  deleteCategory(@Param('id') id: string) {
    return this.forumService.deleteCategory(id);
  }

  // Topics
  @Get('topics')
  @Public()
  @ApiOperation({ summary: '话题列表' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  findAllTopics(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const p = Math.max(1, Number(page) || 1);
    const ps = Math.max(1, Number(pageSize) || 20);
    return this.forumService.findAllTopics(p, ps, categoryId);
  }

  @Get('topics/:id')
  @Public()
  @ApiOperation({ summary: '话题详情' })
  findTopicById(@Param('id') id: string, @CurrentUser() user?: UserContext) {
    return this.forumService.findTopicById(id, user?.workspaceId);
  }

  @Post('topics')
  @ApiBearerAuth()
  @Permission('forum_topic:create')
  @ApiOperation({ summary: '发布话题' })
  createTopic(
    @CurrentUser() user: UserContext,
    @Body() dto: CreateForumTopicDto,
  ) {
    return this.forumService.createTopic({ ...dto, authorId: user.id, workspaceId: user.workspaceId });
  }

  @Patch('topics/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('forum_topic:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新话题' })
  updateTopic(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
    @Body() dto: UpdateForumTopicDto,
  ) {
    return this.forumService.updateTopic(id, dto, user.workspaceId);
  }

  @Delete('topics/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('forum_topic:delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除话题' })
  deleteTopic(@Param('id') id: string, @CurrentUser() user: UserContext) {
    return this.forumService.deleteTopic(id, user.workspaceId);
  }

  @Patch('topics/:id/pin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('forum_topic:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: '置顶/取消置顶' })
  togglePin(@Param('id') id: string, @Body() dto: TogglePinDto) {
    return this.forumService.togglePin(id, dto.isPinned);
  }

  @Patch('topics/:id/lock')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('forum_topic:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: '锁定/解锁话题' })
  toggleLock(@Param('id') id: string, @Body() dto: ToggleLockDto) {
    return this.forumService.toggleLock(id, dto.isLocked);
  }

  // Posts (Replies)
  @Post('posts')
  @ApiBearerAuth()
  @Permission('forum_post:create')
  @ApiOperation({ summary: '回复话题' })
  createPost(
    @CurrentUser() user: UserContext,
    @Body() dto: CreateForumPostDto,
  ) {
    return this.forumService.createPost({ ...dto, authorId: user.id, workspaceId: user.workspaceId });
  }

  @Patch('posts/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('forum_post:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新回复' })
  updatePost(
    @Param('id') id: string,
    @CurrentUser() user: UserContext,
    @Body() dto: UpdateForumPostDto,
  ) {
    return this.forumService.updatePost(id, dto, user.workspaceId);
  }

  @Delete('posts/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('forum_post:delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除回复' })
  deletePost(@Param('id') id: string, @CurrentUser() user: UserContext) {
    return this.forumService.deletePost(id, user.workspaceId);
  }

  @Patch('posts/:id/solution')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('forum_post:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: '标记为解决方案' })
  markAsSolution(@Param('id') id: string) {
    return this.forumService.markAsSolution(id);
  }
}
