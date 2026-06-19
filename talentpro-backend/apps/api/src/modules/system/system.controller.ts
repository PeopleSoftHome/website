import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Cacheable } from '@/common/decorators/cache.decorator';
import { SystemService } from './system.service';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Permission } from '@/common/decorators/permission.decorator';
import { Public } from '@/common/decorators/public.decorator';

import { PaginationDto } from '@/common/dto/pagination.dto';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpsertEmailTemplateDto } from './dto/upsert-email-template.dto';
import { CreateSensitiveWordDto } from './dto/create-sensitive-word.dto';
import { TestModerationDto } from './dto/test-moderation.dto';

@ApiTags('系统管理')
@Controller('system')
export class SystemController {
  constructor(private systemService: SystemService) {}

  // Settings
  @Get('settings')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '系统设置列表' })
  @ApiQuery({ name: 'category', required: false })
  findAllSettings(@Query('category') category?: string) {
    return this.systemService.findAllSettings(category);
  }

  @Get('settings/:key')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取设置项' })
  findSettingByKey(@Param('key') key: string) {
    return this.systemService.findSettingByKey(key);
  }

  @Post('settings')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('setting:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新设置' })
  upsertSetting(@Body() dto: UpsertSettingDto) {
    return this.systemService.upsertSetting(dto);
  }

  @Delete('settings/:key')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('setting:delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除设置' })
  deleteSetting(@Param('key') key: string) {
    return this.systemService.deleteSetting(key);
  }

  @Get('config/public')
  @Public()
  @Cacheable({ key: 'system:public-config', ttl: 300 })
  @ApiOperation({ summary: '公开站点配置' })
  getPublicConfig() {
    return this.systemService.getPublicConfig();
  }

  // AuditLogs
  @Get('audit-logs')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '审计日志' })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'resource', required: false })
  findAllAuditLogs(
    @Query() pagination: PaginationDto,
    @Query('userId') userId?: string,
    @Query('resource') resource?: string,
  ) {
    return this.systemService.findAllAuditLogs(
      pagination.page,
      pagination.pageSize,
      { userId, resource },
    );
  }

  @Post('audit-logs')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN')
  @Permission('audit_log:create')
  @ApiBearerAuth()
  @ApiOperation({ summary: '记录审计日志（仅 SUPER_ADMIN）' })
  createAuditLog(@Body() dto: CreateAuditLogDto) {
    return this.systemService.createAuditLog(dto);
  }

  // EmailTemplates
  @Get('email-templates')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '邮件模板列表' })
  findAllEmailTemplates() {
    return this.systemService.findAllEmailTemplates();
  }

  @Get('email-templates/:key')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '邮件模板详情' })
  findEmailTemplateByKey(@Param('key') key: string) {
    return this.systemService.findEmailTemplateByKey(key);
  }

  @Post('email-templates')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('email_template:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新邮件模板' })
  upsertEmailTemplate(@Body() dto: UpsertEmailTemplateDto) {
    return this.systemService.upsertEmailTemplate(dto);
  }

  @Delete('email-templates/:key')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('email_template:delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除邮件模板' })
  deleteEmailTemplate(@Param('key') key: string) {
    return this.systemService.deleteEmailTemplate(key);
  }

  // SensitiveWords
  @Get('sensitive-words')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '敏感词列表' })
  findAllSensitiveWords() {
    return this.systemService.findAllSensitiveWords();
  }

  @Post('sensitive-words')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('sensitive_word:create')
  @ApiBearerAuth()
  @ApiOperation({ summary: '添加敏感词' })
  createSensitiveWord(@Body() dto: CreateSensitiveWordDto) {
    return this.systemService.createSensitiveWord(dto);
  }

  @Delete('sensitive-words/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('sensitive_word:delete')
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除敏感词' })
  deleteSensitiveWord(@Param('id') id: string) {
    return this.systemService.deleteSensitiveWord(id);
  }

  @Post('moderation-test')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('sensitive_word:create')
  @ApiBearerAuth()
  @ApiOperation({ summary: '内容检测模拟' })
  testModeration(@Body() dto: TestModerationDto) {
    return this.systemService.testModeration(dto.content);
  }

  // ChatBot Config
  @Get('chatbot-config')
  @Public()
  @Cacheable({ key: 'system:chatbot-config', ttl: 300 })
  @ApiOperation({ summary: 'ChatBot 公开配置' })
  getChatBotConfig() {
    return this.systemService.getChatBotConfig();
  }

  @Post('chatbot-config')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('setting:update')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新 ChatBot 配置' })
  upsertChatBotConfig(@Body() dto: { intents?: unknown[]; quickReplies?: unknown[]; fallbackCopy?: string }) {
    return this.systemService.upsertChatBotConfig(dto);
  }
}
