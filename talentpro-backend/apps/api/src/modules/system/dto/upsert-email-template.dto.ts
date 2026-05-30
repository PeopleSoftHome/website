import { IsString, IsOptional } from 'class-validator';

export class UpsertEmailTemplateDto {
  @IsString()
  key: string;

  @IsString()
  subject: string;

  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  html?: string;
}
