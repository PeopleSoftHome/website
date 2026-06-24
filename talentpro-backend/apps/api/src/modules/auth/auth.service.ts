import { Injectable } from '@nestjs/common';
import { AuthUserService } from './auth-user.service';
import { AuthTokenService } from './auth-token.service';

/**
 * AuthService — Facade
 * 组合 User / Token 两个子服务，对外保持统一接口
 */
@Injectable()
export class AuthService {
  constructor(
    private userService: AuthUserService,
    private tokenService: AuthTokenService,
  ) {}

  async register(dto: Parameters<AuthUserService['register']>[0]) {
    return this.userService.register(dto);
  }

  async login(dto: Parameters<AuthUserService['login']>[0]) {
    const { user } = await this.userService.login(dto);
    const tokens = await this.tokenService.generateTokens(user.id, user.email, user.workspaceId);
    await this.tokenService.saveRefreshToken(user.id, tokens.refreshToken);
    return { user, ...tokens };
  }

  async devLogin(email?: string, roleName?: string) {
    const { user } = await this.userService.devLogin(email, roleName);
    const tokens = await this.tokenService.generateTokens(user.id, user.email, user.workspaceId);
    await this.tokenService.saveRefreshToken(user.id, tokens.refreshToken);
    return { user, ...tokens };
  }

  async refresh(refreshToken: string) {
    return this.tokenService.refresh(refreshToken);
  }

  async logout(refreshToken: string, accessToken?: string) {
    return this.tokenService.logout(refreshToken, accessToken);
  }

  async getMe(userId: string) {
    return this.userService.getMe(userId);
  }

  async updateProfile(userId: string, dto: Parameters<AuthUserService['updateProfile']>[1]) {
    return this.userService.updateProfile(userId, dto);
  }
}
