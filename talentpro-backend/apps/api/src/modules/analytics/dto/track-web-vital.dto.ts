import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class TrackWebVitalDto {
  @IsString()
  event!: string;

  @IsObject()
  properties!: {
    name: string;
    value: number;
    rating: string;
    delta?: number;
    id: string;
    navigationType?: string;
    url: string;
    pathname: string;
  };

  @IsString()
  sessionId!: string;

  @IsNumber()
  @IsOptional()
  ts?: number;
}
