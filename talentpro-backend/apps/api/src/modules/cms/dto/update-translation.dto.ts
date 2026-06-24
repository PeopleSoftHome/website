import { IsOptional, IsString } from 'class-validator';

export class UpdateTranslationDto {
  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  context?: string;
}
