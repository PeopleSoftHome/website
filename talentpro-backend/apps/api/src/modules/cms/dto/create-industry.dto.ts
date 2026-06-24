import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateIndustryDto {
  @IsString()
  slug: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsArray()
  features?: Record<string, unknown>[];

  @IsOptional()
  screenshot?: Record<string, unknown>;
}
