import { IsEnum, IsString, IsOptional } from 'class-validator';

export enum AiGenerateType {
  BLOG = 'blog',
  PRODUCT = 'product',
  SEO = 'seo',
  TRANSLATE = 'translate',
  MODERATE = 'moderate',
}

export class AiGenerateDto {
  @IsEnum(AiGenerateType, { message: '不支持的生成类型' })
  type: AiGenerateType;

  @IsString()
  @IsOptional()
  prompt?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsOptional()
  tone?: string;
}
