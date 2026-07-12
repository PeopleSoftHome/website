import { Controller, Post, Body, Get, Patch, UseGuards, HttpCode, HttpStatus, Headers, Res, Req, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DevLoginDto } from './dto/dev-login.dto';
import { RecaptchaGuard } from '@/common/guards/recaptcha.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { Public } from '@shared/decorators/public.decorator';
import { Permission } from '@shared/decorators/permission.decorator';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private tokenService: AuthTokenService,
    private configService: ConfigService,
  ) {}

  @Public()
  @UseGuards(RecaptchaGuard)
  @Throttle({ auth: { limit: 10, ttl: 60000 } })
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ auth: { limit: 10, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '用户登录' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    this.tokenService.setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    return result;
  }

  /**
   * 开发环境一键登录
   * 仅在 APP_ENV=development 或 NODE_ENV=development 时可用，生产环境强制禁用。
   */
  @Public()
  @SkipThrottle({ default: true, strict: true, auth: true, search: true, lead: true })
  @Post('dev-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '开发环境一键登录（仅开发）' })
  async devLogin(
    @Body() dto: DevLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const appEnv = this.configService.get('APP_ENV');
    const nodeEnv = this.configService.get('NODE_ENV');
    if (appEnv !== 'development' && nodeEnv !== 'development') {
      throw new ForbiddenException('Dev login is only available in development environment');
    }

    const result = await this.authService.devLogin(dto.email, dto.roleName);
    this.tokenService.setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    return result;
  }

  @Public()
  @Throttle({ auth: { limit: 10, ttl: 60000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新 Token' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = dto.refreshToken || req.cookies?.tp_refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }
    const result = await this.authService.refresh(refreshToken);
    this.tokenService.setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: '登出' })
  logout(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Headers('authorization') auth: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = dto.refreshToken || req.cookies?.tp_refresh_token;
    const accessToken = auth?.replace('Bearer ', '') || req.cookies?.tp_access_token;
    this.tokenService.clearAuthCookies(res);
    return this.authService.logout(refreshToken, accessToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  @Patch('profile')
  @ApiBearerAuth()
  @Permission('auth:update')
  @ApiOperation({ summary: '更新当前用户资料' })
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, dto);
  }
}
