import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { UserContext } from '../types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token =
      request.cookies?.['tp_access_token'] ||
      request.headers?.authorization?.replace('Bearer ', '');

    // 检查 token 是否在黑名单中
    if (token) {
      const blacklisted = await this.prisma.tokenBlacklist.findUnique({
        where: { token },
      });
      if (blacklisted) {
        throw new UnauthorizedException('Token has expired, please log in again');
      }
    }

    return super.canActivate(context) as boolean;
  }

  handleRequest<TUser = UserContext>(err: unknown, user: TUser | null): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized, please log in');
    }
    return user;
  }
}
