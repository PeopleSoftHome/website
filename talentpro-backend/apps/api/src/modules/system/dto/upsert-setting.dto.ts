import { IsString, IsOptional } from 'class-validator';

export class UpsertSettingDto {
  @IsString()
  key: string;

  value: unknown;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}
