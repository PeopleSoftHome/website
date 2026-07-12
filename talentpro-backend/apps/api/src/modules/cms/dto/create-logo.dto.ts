import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateLogoDto {
  @IsString()
  name!: string;

  @IsString()
  logo!: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
