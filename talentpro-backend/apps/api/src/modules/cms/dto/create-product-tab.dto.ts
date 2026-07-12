import { IsString, IsOptional } from 'class-validator';

export class CreateProductTabDto {
  @IsString()
  label!: string;

  @IsString()
  slug!: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  iconColor?: string;

  @IsOptional()
  @IsString()
  iconBg?: string;
}
