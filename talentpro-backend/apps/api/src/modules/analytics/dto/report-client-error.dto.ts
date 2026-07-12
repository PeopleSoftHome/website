import { IsString, IsOptional } from 'class-validator';

export class ReportClientErrorDto {
  @IsString()
  type!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  stack?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  ua?: string;

  @IsOptional()
  @IsString()
  time?: string;
}
