import { Controller, Get, Post, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { WorkspaceService } from './workspace.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

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
  @ApiOperation({ summary: '创建工作空间' })
  create(@CurrentUser('id') userId: string, @Body() dto: { name: string }) {
    return this.workspaceService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新工作空间' })
  update(
    @CurrentUser('id') userId: string,
    @Body('id') workspaceId: string,
    @Body() dto: { name?: string; status?: string },
  ) {
    return this.workspaceService.update(userId, workspaceId, dto);
  }

  @Post(':id/invite')
  @ApiOperation({ summary: '邀请成员' })
  invite(
    @CurrentUser('id') userId: string,
    @Body('id') workspaceId: string,
    @Body() dto: { email: string },
  ) {
    return this.workspaceService.inviteMember(userId, workspaceId, dto.email);
  }
}
