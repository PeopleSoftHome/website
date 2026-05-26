import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { UserStatus } from '@prisma/client';

export class CreateUserDto {
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  password: string;

  @IsString()
  @MinLength(2, { message: '姓名至少2个字符' })
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  roleId?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
