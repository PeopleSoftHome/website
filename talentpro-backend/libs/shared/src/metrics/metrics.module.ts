import { Module, Global } from '@nestjs/common';
import { PrometheusService } from './prometheus.service';
import { MetricsController } from './metrics.controller';

@Global()
@Module({
  providers: [PrometheusService],
  controllers: [MetricsController],
  exports: [PrometheusService],
})
export class MetricsModule {}
