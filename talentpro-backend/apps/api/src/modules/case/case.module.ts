import { Module } from '@nestjs/common';
import { CaseController } from './case.controller';
import { CaseService } from './case.service';
import { CaseStudyRepository } from './case-study.repository';

@Module({
  controllers: [CaseController],
  providers: [CaseService, CaseStudyRepository],
})
export class CaseModule {}
