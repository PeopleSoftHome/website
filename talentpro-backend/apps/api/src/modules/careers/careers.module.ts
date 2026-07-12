import { Module } from '@nestjs/common';
import { CareersController } from './careers.controller';
import { CareersService } from './careers.service';
import { JobRepository } from './job.repository';

@Module({
  controllers: [CareersController],
  providers: [CareersService, JobRepository],
})
export class CareersModule {}
