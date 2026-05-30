import { IsString, IsOptional, IsArray, IsInt } from 'class-validator';

export class UpsertAiCardDto {
  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsString()
  tagline: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsArray()
  features?: any[];

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
