import { IsString, IsEmail, IsOptional, IsUrl } from 'class-validator';

export class CreateJobApplicationDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  resumeUrl?: string;

  @IsOptional()
  @IsString()
  coverLetter?: string;

  @IsOptional()
  @IsUrl()
  portfolioUrl?: string;
}
