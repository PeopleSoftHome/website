import { IsString, IsOptional, IsArray, IsInt } from 'class-validator';

export class UpsertWhyUsTabDto {
  @IsString()
  slug: string;

  @IsString()
  label: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsArray()
  metrics?: any[];

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
