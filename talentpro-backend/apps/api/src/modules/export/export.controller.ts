import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportService } from './export.service';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { LeadStatus } from '@prisma/client';

@ApiTags('数据导出')
@Controller('admin/export')
@UseGuards(RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class ExportController {
  constructor(private exportService: ExportService) {}

  @Get('leads')
  @ApiOperation({ summary: '导出线索' })
  @ApiQuery({ name: 'status', required: false, enum: LeadStatus })
  @ApiQuery({ name: 'format', required: false, enum: ['xlsx', 'csv'] })
  async exportLeads(
    @Res() res: Response,
    @CurrentUser() user: any,
    @Query('status') status?: LeadStatus,
    @Query('format') format = 'xlsx',
  ) {
    const workspaceId = user.role?.name === 'SUPER_ADMIN' ? undefined : user.workspaceId;
    const buffer = await this.exportService.exportLeads({ status, workspaceId });
    const ext = format === 'csv' ? 'csv' : 'xlsx';
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=leads-${Date.now()}.${ext}`);
    res.send(buffer);
  }

  @Get('users')
  @ApiOperation({ summary: '导出用户' })
  async exportUsers(
    @Res() res: Response,
    @CurrentUser() user: any,
    @Query('format') format = 'xlsx',
  ) {
    const workspaceId = user.role?.name === 'SUPER_ADMIN' ? undefined : user.workspaceId;
    const buffer = await this.exportService.exportUsers({ workspaceId });
    const ext = format === 'csv' ? 'csv' : 'xlsx';
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=users-${Date.now()}.${ext}`);
    res.send(buffer);
  }

  @Get('analytics')
  @ApiOperation({ summary: '导出数据分析' })
  @ApiQuery({ name: 'days', required: false })
  async exportAnalytics(
    @Res() res: Response,
    @Query('days') days?: string,
  ) {
    const buffer = await this.exportService.exportAnalytics(days ? parseInt(days, 10) : 30);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-${Date.now()}.xlsx`);
    res.send(buffer);
  }
}
