import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { PrismaService } from '@shared/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { DevLoginDto } from './dto/dev-login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            devLogin: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
            me: jest.fn(),
          },
        },
        {
          provide: AuthTokenService,
          useValue: {
            setAuthCookies: jest.fn(),
            clearAuthCookies: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {},
            tokenBlacklist: {},
            refreshToken: {},
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn((key: string) => {
            const map: Record<string, unknown> = {
              JWT_SECRET: 'test-secret-key-at-least-32-characters-long',
              JWT_ACCESS_EXPIRATION: '15m',
              JWT_REFRESH_EXPIRATION: '7d',
              APP_ENV: 'development',
            };
            return map[key] || null;
          }) },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/register', () => {
    it('should call authService.register with correct params', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      };
      const expected = { id: 'u1', email: dto.email, name: dto.name };
      jest.spyOn(authService, 'register').mockResolvedValue(expected as unknown as ReturnType<AuthService['register']>);

      const result = await controller.register(dto as unknown as RegisterDto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('POST /auth/login', () => {
    it('should return tokens on valid credentials', async () => {
      const dto = { email: 'test@example.com', password: 'SecurePass123!' };
      const expected = {
        accessToken: 'atoken',
        refreshToken: 'rtoken',
        expiresAt: new Date(),
      };
      const mockRes = { cookie: jest.fn() } as unknown as Response;
      jest.spyOn(authService, 'login').mockResolvedValue(expected as unknown as ReturnType<AuthService['login']>);

      const result = await controller.login(dto as unknown as LoginDto, mockRes);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return new access token', async () => {
      const body = { refreshToken: 'old-rtoken' };
      const expected = { accessToken: 'new-atoken', expiresAt: new Date() };
      const mockReq = { cookies: {} } as unknown as Request;
      const mockRes = { cookie: jest.fn() } as unknown as Response;
      jest.spyOn(authService, 'refresh').mockResolvedValue(expected as unknown as ReturnType<AuthService['refresh']>);

      const result = await controller.refresh(body as unknown as RefreshTokenDto, mockReq, mockRes);

      expect(authService.refresh).toHaveBeenCalledWith(body.refreshToken);
      expect(result).toEqual(expected);
    });
  });

  describe('POST /auth/logout', () => {
    it('should call authService.logout with refreshToken and accessToken', async () => {
      const dto = { refreshToken: 'rtoken' };
      const mockReq = { cookies: {} } as unknown as Request;
      const mockRes = { clearCookie: jest.fn() } as unknown as Response;
      jest.spyOn(authService, 'logout').mockResolvedValue({ success: true } as unknown as ReturnType<AuthService['logout']>);

      const result = await controller.logout(dto as unknown as RefreshTokenDto, mockReq, 'Bearer atoken', mockRes);

      expect(authService.logout).toHaveBeenCalledWith('rtoken', 'atoken');
      expect(result).toEqual({ success: true });
    });
  });

  describe('POST /auth/dev-login', () => {
    it('should return tokens in development', async () => {
      const expected = {
        user: { id: 'u1', email: 'dev@talentpro.com' },
        accessToken: 'atoken',
        refreshToken: 'rtoken',
      };
      const mockRes = { cookie: jest.fn() } as unknown as Response;
      jest.spyOn(authService, 'devLogin').mockResolvedValue(expected as unknown as ReturnType<AuthService['devLogin']>);

      const result = await controller.devLogin({} as DevLoginDto, mockRes);

      expect(authService.devLogin).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual(expected);
    });

    it('should be forbidden in production', async () => {
      const configService = module.get<ConfigService>(ConfigService);
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'APP_ENV') return 'production';
        if (key === 'NODE_ENV') return 'production';
        return null;
      });

      await expect(controller.devLogin({} as DevLoginDto, {} as Response)).rejects.toThrow(ForbiddenException);
    });
  });
});
