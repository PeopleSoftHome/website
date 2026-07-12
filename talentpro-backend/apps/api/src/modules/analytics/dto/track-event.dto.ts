import { IsString, IsOptional } from 'class-validator';

export class TrackEventDto {
  @IsString()
  event!: string;

  @IsOptional()
  properties?: Record<string, unknown>;

  @IsString()
  sessionId!: string;
}
