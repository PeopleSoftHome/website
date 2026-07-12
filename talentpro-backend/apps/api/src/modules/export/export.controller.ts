import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportService } from './export.service';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@shared/decorators/roles.decorator';
import { Permission } from '@shared/decorators/permission.decorator';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { UserContext } from '@shared/types';
import { LeadStatus } from '@prisma/client';

@ApiTags('数据导出')
@Controller('admin/export')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Get('leads')
  @Permission('export:run')
  @ApiOperation({ summary: '导出线索' })
  @ApiQuery({ name: 'status', required: false, enum: LeadStatus })
  @ApiQuery({ name: 'format', required: false, enum: ['xlsx', 'csv'] })
  async exportLeads(
    @Res() res: Response,
    @CurrentUser() user: UserContext,
    @Query('status') status?: LeadStatus,
    @Query('format') format = 'xlsx',
  ) {
    const workspaceId = user.role?.name === 'SUPER_ADMIN' ? undefined : user.workspaceId;
    const ext = format === 'csv' ? 'csv' : 'xlsx';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=leads-${Date.now()}.${ext}`);
    await this.exportService.exportLeads({ status, workspaceId }, res);
  }

  @Get('users')
  @Permission('export:run')
  @ApiOperation({ summary: '导出用户' })
  async exportUsers(
    @Res() res: Response,
    @CurrentUser() user: UserContext,
    @Query('format') format = 'xlsx',
  ) {
    const workspaceId = user.role?.name === 'SUPER_ADMIN' ? undefined : user.workspaceId;
    const ext = format === 'csv' ? 'csv' : 'xlsx';
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=users-${Date.now()}.${ext}`);
    await this.exportService.exportUsers({ workspaceId }, res);
  }

  @Get('analytics')
  @Permission('export:run')
  @ApiOperation({ summary: '导出数据分析' })
  @ApiQuery({ name: 'days', required: false })
  async exportAnalytics(
    @Res() res: Response,
    @CurrentUser() user: UserContext,
    @Query('days') days?: string,
  ) {
    const workspaceId = user.role?.name === 'SUPER_ADMIN' ? undefined : user.workspaceId;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-${Date.now()}.xlsx`);
    await this.exportService.exportAnalytics(days ? Number(days) || 30 : 30, workspaceId, res);
  }
}
