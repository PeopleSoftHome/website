import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertTranslationDto {
  @IsNotEmpty()
  @IsString()
  locale: string;

  @IsNotEmpty()
  @IsString()
  key: string;

  @IsNotEmpty()
  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  context?: string;
}
