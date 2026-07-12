import { IsString, IsOptional, IsArray, IsEnum, IsObject } from 'class-validator';
import { PricingModel } from '@prisma/client';

export class CreateAppDto {
  @IsString()
  name!: string;

  @IsString()
  slug!: string;

  @IsString()
  tagline!: string;

  @IsString()
  description!: string;

  @IsString()
  categoryId!: string;

  @IsString()
  vendorId!: string;

  @IsString()
  iconUrl!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coverImages?: string[];

  @IsEnum(PricingModel)
  pricingModel!: PricingModel;

  @IsOptional()
  @IsObject()
  pricingTiers?: Record<string, unknown>;

  @IsString()
  version!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  compatibility?: string[];

  @IsOptional()
  @IsString()
  integrationType?: string;
}
