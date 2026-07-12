import { IsString, IsOptional, IsArray, IsEmail } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  name!: string;

  @IsString()
  company!: string;

  @IsString()
  phone!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  products?: string[];

  @IsString()
  scale!: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  workspaceId?: string;
}
