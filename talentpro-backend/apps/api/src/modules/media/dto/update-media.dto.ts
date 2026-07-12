import { IsString, IsOptional } from 'class-validator';

export class UpdateMediaDto {
  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsString()
  originalName?: string;
}
