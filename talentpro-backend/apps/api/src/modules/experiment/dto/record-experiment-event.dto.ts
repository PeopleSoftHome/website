import { IsString, IsOptional } from 'class-validator';

export class RecordExperimentEventDto {
  @IsString()
  variant!: string;

  @IsString()
  eventType!: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  sessionId!: string;

  @IsOptional()
  properties?: Record<string, unknown>;
}
