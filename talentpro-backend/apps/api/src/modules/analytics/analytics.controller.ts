import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('analyticss')
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}
}
