import { IsString, IsOptional } from 'class-validator';

export class CreateAuditLogDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsString()
  action!: string;

  @IsString()
  resource!: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

  @IsOptional()
  oldValue?: Record<string, unknown>;

  @IsOptional()
  newValue?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
