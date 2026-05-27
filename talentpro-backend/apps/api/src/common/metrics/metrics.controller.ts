import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { PrometheusService } from './prometheus.service';

@ApiTags('监控')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly prometheus: PrometheusService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Prometheus 指标' })
  async getMetrics() {
    return this.prometheus.getMetrics();
  }
}
