import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExperimentService } from './experiment.service';
import { Public } from '@/common/decorators/public.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';

@ApiTags('A/B 测试')
@Controller('experiments')
export class ExperimentController {
  constructor(private experimentService: ExperimentService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '实验列表' })
  findAll() {
    return this.experimentService.findAll();
  }

  @Get('running')
  @Public()
  @ApiOperation({ summary: '运行中实验' })
  findRunning() {
    return this.experimentService.findRunning();
  }

  @Get(':key')
  @Public()
  @ApiOperation({ summary: '实验详情' })
  findByKey(@Param('key') key: string) {
    return this.experimentService.findByKey(key);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建实验' })
  create(@Body() dto: { key: string; name: string; description?: string; variantA: any; variantB: any; trafficSplit?: number }) {
    return this.experimentService.create(dto);
  }

  @Post(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新实验状态' })
  updateStatus(@Param('id') id: string, @Body() dto: { status: string }) {
    return this.experimentService.updateStatus(id, dto.status);
  }

  @Post(':id/events')
  @Public()
  @ApiOperation({ summary: '上报实验事件' })
  recordEvent(
    @Param('id') id: string,
    @Body() dto: { variant: string; eventType: string; userId?: string; sessionId: string; properties?: any },
  ) {
    return this.experimentService.recordEvent({ experimentId: id, ...dto });
  }

  @Get(':id/stats')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '实验统计数据' })
  getStats(@Param('id') id: string) {
    return this.experimentService.getStats(id);
  }
}
