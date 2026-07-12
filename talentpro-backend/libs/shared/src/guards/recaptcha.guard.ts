import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.body?.recaptchaToken;
    const secret = this.config.get<string>('RECAPTCHA_SECRET_KEY');

    // 开发环境或未配置时跳过验证
    if (!secret) {
      return true;
    }

    if (!token) {
      throw new BadRequestException('Missing reCAPTCHA token');
    }

    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secret}&response=${token}`,
    });

    const data = await response.json();

    if (!data.success) {
      throw new BadRequestException('reCAPTCHA verification failed, please try again');
    }

    // v3 分数检查（可选）
    if (typeof data.score === 'number' && data.score < 0.3) {
      throw new BadRequestException('Security verification failed, please try again');
    }

    return true;
  }
}
