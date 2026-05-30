import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateSensitiveWordDto {
  @IsString()
  word: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  severity?: number;
}
