import { IsString, IsOptional, IsArray } from 'class-validator';

export class UpsertNavigationDto {
  @IsString()
  key!: string;

  @IsString()
  label!: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsArray()
  items?: unknown[];
}
