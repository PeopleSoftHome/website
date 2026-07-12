import { IsEnum } from 'class-validator';
import { ExperimentStatus } from '@prisma/client';

export class UpdateExperimentStatusDto {
  @IsEnum(ExperimentStatus)
  status!: ExperimentStatus;
}
