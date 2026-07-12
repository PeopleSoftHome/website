import { IsString, IsOptional } from 'class-validator';

export class CreateDownloadRecordDto {
  @IsString()
  resourceId!: string;

  @IsString()
  name!: string;

  @IsString()
  email!: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
