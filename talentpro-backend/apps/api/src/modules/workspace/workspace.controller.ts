import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkspaceService } from './workspace.service';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { Permission } from '@shared/decorators/permission.decorator';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { InviteMemberDto } from './dto/invite-member.dto';

@ApiTags('工作空间')
@Controller('workspaces')
@ApiBearerAuth()
export class WorkspaceController {
  constructor(private workspaceService: WorkspaceService) {}

  @Get('me')
  @ApiOperation({ summary: '获取当前用户的工作空间' })
  getMine(@CurrentUser('id') userId: string) {
    return this.workspaceService.findMine(userId);
  }

  @Post()
  @Permission('workspace:create')
  @ApiOperation({ summary: '创建工作空间' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateWorkspaceDto) {
    return this.workspaceService.create(userId, dto);
  }

  @Patch(':id')
  @Permission('workspace:update')
  @ApiOperation({ summary: '更新工作空间' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') workspaceId: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspaceService.update(userId, workspaceId, dto);
  }

  @Post(':id/invite')
  @Permission('workspace:invite')
  @ApiOperation({ summary: '邀请成员' })
  invite(
    @CurrentUser('id') userId: string,
    @Param('id') workspaceId: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.workspaceService.inviteMember(userId, workspaceId, dto.email);
  }
}
