import { IsString, IsOptional } from 'class-validator';

export class AiGenerateImageDto {
  @IsString()
  prompt!: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsString()
  @IsOptional()
  quality?: string;

  @IsString()
  @IsOptional()
  style?: string;
}
