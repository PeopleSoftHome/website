import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DevLoginDto {
  @ApiPropertyOptional({ description: '目标用户邮箱，留空则使用数据库中第一个活跃用户' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: '指定默认角色，留空则使用 USER' })
  @IsOptional()
  @IsString()
  roleName?: string;
}
