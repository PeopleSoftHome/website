import { IsString, IsOptional } from 'class-validator';

export class TrackEventDto {
  @IsString()
  event: string;

  @IsOptional()
  properties?: Record<string, any>;

  @IsString()
  sessionId: string;
}
