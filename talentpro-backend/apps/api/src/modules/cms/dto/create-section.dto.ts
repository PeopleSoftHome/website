import { IsString, IsOptional, IsNumber, IsBoolean, IsObject } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  pageId: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
