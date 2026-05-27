import { Module } from '@nestjs/common';
import { ExperimentService } from './experiment.service';
import { ExperimentController } from './experiment.controller';

@Module({
  providers: [ExperimentService],
  controllers: [ExperimentController],
  exports: [ExperimentService],
})
export class ExperimentModule {}
