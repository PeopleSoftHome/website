import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpsertStatDto {
  @IsString()
  key!: string;

  @IsString()
  label!: string;

  @IsString()
  value!: string;

  @IsOptional()
  @IsString()
  suffix?: string;

  @IsOptional()
  @IsString()
  prefix?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
