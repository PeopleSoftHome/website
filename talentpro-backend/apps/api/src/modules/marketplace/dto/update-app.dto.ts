import { IsString, IsOptional, IsArray, IsEnum, IsObject } from 'class-validator';
import { AppStatus, PricingModel } from '@prisma/client';

export class UpdateAppDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  tagline?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coverImages?: string[];

  @IsOptional()
  @IsEnum(PricingModel)
  pricingModel?: PricingModel;

  @IsOptional()
  @IsObject()
  pricingTiers?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  compatibility?: string[];

  @IsOptional()
  @IsString()
  integrationType?: string;

  @IsOptional()
  @IsEnum(AppStatus)
  status?: AppStatus;
}
