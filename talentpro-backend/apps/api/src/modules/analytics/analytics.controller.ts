import { Controller, Get, Post, Body, Query, UseGuards, Req, Logger } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AnalyticsService } from './analytics.service';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Permission } from '@/common/decorators/permission.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { TrackPageViewDto } from './dto/track-page-view.dto';

import { TrackEventsBatchDto } from './dto/track-events-batch.dto';
import { TrackWebVitalDto } from './dto/track-web-vital.dto';
import { ReportClientErrorDto } from './dto/report-client-error.dto';
import { LogUserActivityDto } from './dto/log-user-activity.dto';

@ApiTags('数据分析')
@Throttle({
  default: { limit: 1000, ttl: 60000 },
  strict: { limit: 100, ttl: 60000 },
  auth: { limit: 500, ttl: 60000 },
  search: { limit: 1000, ttl: 60000 },
  lead: { limit: 100, ttl: 3600000 },
})
@Controller('analytics')
export class AnalyticsController {
  private readonly logger: Logger;

  constructor(private analyticsService: AnalyticsService) {
    this.logger = new Logger(AnalyticsController.name);
  }

  @Post('page-views')
  @Public()
  @ApiOperation({ summary: '记录页面访问' })
  trackPageView(
    @Body() dto: TrackPageViewDto,
    @Req() req: Request,
  ) {
    return this.analyticsService.trackPageView({
      ...dto,
      ipAddress: req.ip || (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
  }

  @Post('events')
  @Public()
  @ApiOperation({ summary: '记录事件（支持批量）' })
  trackEvent(@Body() dto: TrackEventsBatchDto) {
    return this.analyticsService.trackEvents(dto.events);
  }

  @Post('client-errors')
  @Public()
  @ApiOperation({ summary: '接收前端错误上报' })
  reportClientError(@Body() dto: ReportClientErrorDto) {
    // 仅记录日志，不入库存储敏感信息
    this.logger.error(`[Client Error] ${dto.type}: ${dto.message} (${dto.url})`);
    return { received: true };
  }

  @Post('web-vitals')
  @Public()
  @ApiOperation({ summary: '接收 Web Vitals 性能指标' })
  trackWebVital(@Body() dto: TrackWebVitalDto) {
    return this.analyticsService.trackWebVital(dto);
  }

  @Post('activities')
  @ApiBearerAuth()
  @Permission('analytics:write')
  @ApiOperation({ summary: '记录用户行为' })
  logUserActivity(
    @CurrentUser('id') userId: string,
    @Body() dto: LogUserActivityDto,
  ) {
    return this.analyticsService.logUserActivity({ userId, ...dto });
  }

  @Get('dashboard')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '仪表盘统计' })
  @ApiQuery({ name: 'days', required: false })
  getDashboardStats(@Query('days') days?: string) {
    return this.analyticsService.getDashboardStats(days ? Number(days) || 30 : 30);
  }

  @Get('funnel')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '转化漏斗' })
  getConversionFunnel() {
    return this.analyticsService.getConversionFunnel();
  }
}
