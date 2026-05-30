import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthTokenService } from './auth-token.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
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
            const map: Record<string, any> = {
              JWT_SECRET: 'test-secret-key-at-least-32-characters-long',
              JWT_ACCESS_EXPIRATION: '15m',
              JWT_REFRESH_EXPIRATION: '7d',
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
      jest.spyOn(authService, 'register').mockResolvedValue(expected as any);

      const result = await controller.register(dto as any);

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
      const mockRes = { cookie: jest.fn() } as any;
      jest.spyOn(authService, 'login').mockResolvedValue(expected as any);

      const result = await controller.login(dto as any, mockRes);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return new access token', async () => {
      const body = { refreshToken: 'old-rtoken' };
      const expected = { accessToken: 'new-atoken', expiresAt: new Date() };
      const mockRes = { cookie: jest.fn() } as any;
      jest.spyOn(authService, 'refresh').mockResolvedValue(expected as any);

      const result = await controller.refresh(body, mockRes);

      expect(authService.refresh).toHaveBeenCalledWith(body.refreshToken);
      expect(result).toEqual(expected);
    });
  });

  describe('POST /auth/logout', () => {
    it('should call authService.logout with refreshToken and accessToken', async () => {
      const dto = { refreshToken: 'rtoken' };
      const mockRes = { clearCookie: jest.fn() } as any;
      jest.spyOn(authService, 'logout').mockResolvedValue({ success: true } as any);

      const result = await controller.logout(dto, 'Bearer atoken', mockRes);

      expect(authService.logout).toHaveBeenCalledWith('rtoken', 'atoken');
      expect(result).toEqual({ success: true });
    });
  });
});
