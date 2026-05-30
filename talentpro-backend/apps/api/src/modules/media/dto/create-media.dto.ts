import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateMediaDto {
  @IsString()
  filename: string;

  @IsString()
  originalName: string;

  @IsString()
  url: string;

  @IsString()
  mimeType: string;

  @IsNumber()
  size: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsString()
  alt?: string;
}
