import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ExperimentService } from './experiment.service';
import { Public } from '@/common/decorators/public.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { Permission } from '@/common/decorators/permission.decorator';
import { CreateExperimentDto } from './dto/create-experiment.dto';
import { UpdateExperimentStatusDto } from './dto/update-experiment-status.dto';
import { RecordExperimentEventDto } from './dto/record-experiment-event.dto';

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
  @Permission('experiment:create')
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建实验' })
  create(@Body() dto: CreateExperimentDto) {
    return this.experimentService.create(dto);
  }

  @Post(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新实验状态' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateExperimentStatusDto) {
    return this.experimentService.updateStatus(id, dto.status as any);
  }

  @Post(':id/events')
  @Public()
  @ApiOperation({ summary: '上报实验事件' })
  recordEvent(
    @Param('id') id: string,
    @Body() dto: RecordExperimentEventDto,
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
