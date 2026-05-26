import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('search')
  @Public()
  @ApiOperation({ summary: '搜索用户（公开，用于 @提及）' })
  @ApiQuery({ name: 'q', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  search(@Query('q') q: string, @Query('limit') limit?: string) {
    return this.userService.search(q, limit ? parseInt(limit, 10) : 10);
  }

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: '用户列表' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.userService.findAll(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: '用户详情' })
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: '创建用户' })
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: '更新用户' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: '删除用户' })
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
