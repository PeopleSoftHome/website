import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@shared/prisma/prisma.service';

@Injectable()
export class SseAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // 优先从 httpOnly Cookie 读取，其次 Authorization header；不再推荐 URL query token
    const token =
      request.cookies?.tp_access_token ||
      request.headers?.authorization?.replace('Bearer ', '') ||
      request.query?.token;

    if (!token) {
      throw new UnauthorizedException('Missing SSE token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      // 校验 Token 是否在黑名单中
      const blacklisted = await this.prisma.tokenBlacklist.findUnique({
        where: { token },
      });
      if (blacklisted) {
        throw new UnauthorizedException('Token has been revoked');
      }
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid SSE token');
    }
  }
}
