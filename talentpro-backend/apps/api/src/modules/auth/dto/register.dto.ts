import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  @MaxLength(32, { message: '密码最多32位' })
  password: string;

  @IsString()
  @MinLength(2, { message: '姓名至少2个字符' })
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
