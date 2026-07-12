import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { TokenType } from '@prisma/client';
import { PrismaService } from '@shared/prisma/prisma.service';

@Injectable()
export class AuthTokenService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateTokens(userId: string, email: string, workspaceId?: string | null) {
    // 添加唯一 jti，避免同一秒内重复登录产生相同 token 导致唯一索引冲突
    const payload = { sub: userId, email, workspaceId, jti: randomUUID() };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
    });
    return { accessToken, refreshToken };
  }

  async saveRefreshToken(userId: string, token: string) {
    const expirationDays = parseInt(
      this.configService.get('JWT_REFRESH_EXPIRATION', '7d').replace(/\D/g, ''),
      10,
    ) || 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);
    await this.prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });
  }

  async refresh(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: stored.userId },
    });
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User not found');
    }

    await this.prisma.refreshToken.deleteMany({ where: { id: stored.id } });
    const tokens = await this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(refreshToken: string, accessToken?: string) {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
    if (accessToken) {
      try {
        const decoded = this.jwtService.decode(accessToken) as { exp?: number; sub?: string };
        if (decoded?.exp && decoded?.sub) {
          await this.prisma.tokenBlacklist.create({
            data: {
              token: accessToken,
              type: TokenType.ACCESS,
              userId: decoded.sub,
              expiresAt: new Date(decoded.exp * 1000),
            },
          });
        }
      } catch {
        // ignore decode error
      }
    }
    return { message: 'Logged out successfully' };
  }

  /* ── Cookie 辅助方法 ── */
  setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const accessMaxAge = parseInt(
      this.configService.get('JWT_ACCESS_EXPIRATION', '15m').replace(/\D/g, ''),
      10,
    ) * 60 * 1000;
    const refreshMaxAge = parseInt(
      this.configService.get('JWT_REFRESH_EXPIRATION', '7d').replace(/\D/g, ''),
      10,
    ) * 24 * 60 * 60 * 1000;

    res.cookie('tp_access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: accessMaxAge,
      path: '/',
    });
    res.cookie('tp_refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: refreshMaxAge,
      path: '/',
    });
  }

  clearAuthCookies(res: Response) {
    res.clearCookie('tp_access_token', { path: '/' });
    res.clearCookie('tp_refresh_token', { path: '/' });
  }
}
