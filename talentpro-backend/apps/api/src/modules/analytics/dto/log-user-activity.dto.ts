import { IsString, IsOptional } from 'class-validator';

export class LogUserActivityDto {
  @IsString()
  action: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
