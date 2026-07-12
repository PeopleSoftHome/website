import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { RolesGuard } from '@shared/guards';
import { Roles } from '@shared/decorators/roles.decorator';
import { Permission } from '@shared/decorators/permission.decorator';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@ApiTags('角色权限')
@Controller('roles')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: '角色列表' })
  findAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: '角色详情' })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Post()
  @Roles('SUPER_ADMIN')
  @Permission('role:create')
  @ApiOperation({ summary: '创建角色' })
  create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  @Permission('role:update')
  @ApiOperation({ summary: '更新角色' })
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @Permission('role:delete')
  @ApiOperation({ summary: '删除角色' })
  remove(@Param('id') id: string) {
    return this.roleService.remove(id);
  }
}
