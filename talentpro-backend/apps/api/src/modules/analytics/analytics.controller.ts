import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('数据分析')
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Post('page-views')
  @Public()
  @ApiOperation({ summary: '记录页面访问' })
  trackPageView(@Body() dto: {
    path: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
    userId?: string;
    sessionId: string;
  }) {
    return this.analyticsService.trackPageView(dto);
  }

  @Post('events')
  @Public()
  @ApiOperation({ summary: '记录事件' })
  trackEvent(@Body() dto: {
    event: string;
    properties?: Record<string, any>;
    userId?: string;
    sessionId: string;
  }) {
    return this.analyticsService.trackEvent(dto);
  }

  @Post('activities')
  @Public()
  @ApiOperation({ summary: '记录用户行为' })
  logUserActivity(@Body() dto: {
    userId: string;
    action: string;
    metadata?: Record<string, any>;
  }) {
    return this.analyticsService.logUserActivity(dto);
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '仪表盘统计' })
  @ApiQuery({ name: 'days', required: false })
  getDashboardStats(@Query('days') days?: string) {
    return this.analyticsService.getDashboardStats(days ? parseInt(days, 10) : 30);
  }

  @Get('funnel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '转化漏斗' })
  getConversionFunnel() {
    return this.analyticsService.getConversionFunnel();
  }
}
