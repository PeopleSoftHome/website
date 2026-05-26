import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SystemService } from './system.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('系统管理')
@Controller('system')
export class SystemController {
  constructor(private systemService: SystemService) {}

  // Settings
  @Get('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '系统设置列表' })
  @ApiQuery({ name: 'category', required: false })
  findAllSettings(@Query('category') category?: string) {
    return this.systemService.findAllSettings(category);
  }

  @Get('settings/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取设置项' })
  findSettingByKey(@Param('key') key: string) {
    return this.systemService.findSettingByKey(key);
  }

  @Post('settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新设置' })
  upsertSetting(@Body() dto: { key: string; value: any; category?: string; updatedBy?: string }) {
    return this.systemService.upsertSetting(dto);
  }

  @Delete('settings/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除设置' })
  deleteSetting(@Param('key') key: string) {
    return this.systemService.deleteSetting(key);
  }

  // AuditLogs
  @Get('audit-logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '审计日志' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'resource', required: false })
  findAllAuditLogs(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('userId') userId?: string,
    @Query('resource') resource?: string,
  ) {
    return this.systemService.findAllAuditLogs(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
      { userId, resource },
    );
  }

  @Post('audit-logs')
  @Public()
  @ApiOperation({ summary: '记录审计日志' })
  createAuditLog(@Body() dto: {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.systemService.createAuditLog(dto);
  }

  // EmailTemplates
  @Get('email-templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '邮件模板列表' })
  findAllEmailTemplates() {
    return this.systemService.findAllEmailTemplates();
  }

  @Get('email-templates/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '邮件模板详情' })
  findEmailTemplateByKey(@Param('key') key: string) {
    return this.systemService.findEmailTemplateByKey(key);
  }

  @Post('email-templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新邮件模板' })
  upsertEmailTemplate(@Body() dto: { key: string; subject: string; body: string; html?: string }) {
    return this.systemService.upsertEmailTemplate(dto);
  }

  @Delete('email-templates/:key')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除邮件模板' })
  deleteEmailTemplate(@Param('key') key: string) {
    return this.systemService.deleteEmailTemplate(key);
  }
}
