import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { TokenType } from '@prisma/client';
import { AuthTokenService } from './auth-token.service';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('AuthTokenService', () => {
  let service: AuthTokenService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthTokenService,
        {
          provide: PrismaService,
          useValue: {
            refreshToken: {
              findUnique: jest.fn(),
              create: jest.fn(),
              deleteMany: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
            tokenBlacklist: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'signed-token'),
            decode: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, fallback?: string) => {
              const map: Record<string, string> = {
                JWT_SECRET: 'test-secret',
                JWT_ACCESS_EXPIRATION: '15m',
                JWT_REFRESH_EXPIRATION: '7d',
              };
              return map[key] ?? fallback;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthTokenService>(AuthTokenService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTokens', () => {
    it('should sign access and refresh tokens', async () => {
      const tokens = await service.generateTokens('u1', 'a@b.com', 'w1');
      expect(tokens.accessToken).toBe('signed-token');
      expect(tokens.refreshToken).toBe('signed-token');
      expect(jwtService.sign).toHaveBeenCalledTimes(2);
    });
  });

  describe('saveRefreshToken', () => {
    it('should create refresh token with expiration', async () => {
      await service.saveRefreshToken('u1', 'rt1');
      expect(prisma.refreshToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ token: 'rt1', userId: 'u1' }),
        }),
      );
    });
  });

  describe('refresh', () => {
    it('should rotate tokens when refresh token is valid', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        id: 'rt1',
        token: 'valid',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 100000),
      });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        status: 'ACTIVE',
      });

      const tokens = await service.refresh('valid');
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { id: 'rt1' } });
      expect(tokens).toEqual({ accessToken: 'signed-token', refreshToken: 'signed-token' });
    });

    it('should throw when refresh token not found', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.refresh('invalid')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw when refresh token expired', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        id: 'rt1',
        token: 'expired',
        userId: 'u1',
        expiresAt: new Date(Date.now() - 100000),
      });
      await expect(service.refresh('expired')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw when user inactive', async () => {
      (prisma.refreshToken.findUnique as jest.Mock).mockResolvedValue({
        id: 'rt1',
        token: 'valid',
        userId: 'u1',
        expiresAt: new Date(Date.now() + 100000),
      });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'u1',
        status: 'INACTIVE',
      });
      await expect(service.refresh('valid')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should delete refresh token and blacklist access token', async () => {
      const exp = Math.floor(Date.now() / 1000) + 60;
      (jwtService.decode as jest.Mock).mockReturnValue({ exp, sub: 'u1' });

      const result = await service.logout('rt1', 'at1');
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { token: 'rt1' } });
      expect(prisma.tokenBlacklist.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ token: 'at1', type: TokenType.ACCESS, userId: 'u1' }),
        }),
      );
      expect(result.message).toBe('登出成功');
    });

    it('should ignore invalid access token', async () => {
      (jwtService.decode as jest.Mock).mockImplementation(() => {
        throw new Error('bad token');
      });
      const result = await service.logout('rt1', 'bad');
      expect(prisma.tokenBlacklist.create).not.toHaveBeenCalled();
      expect(result.message).toBe('登出成功');
    });
  });

  describe('cookie helpers', () => {
    it('should set auth cookies', () => {
      const res = {
        cookie: jest.fn(),
      } as unknown as import('express').Response;
      service.setAuthCookies(res, { accessToken: 'at', refreshToken: 'rt' });
      expect(res.cookie).toHaveBeenCalledWith(
        'tp_access_token',
        'at',
        expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' }),
      );
      expect(res.cookie).toHaveBeenCalledWith(
        'tp_refresh_token',
        'rt',
        expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' }),
      );
    });

    it('should clear auth cookies', () => {
      const res = {
        clearCookie: jest.fn(),
      } as unknown as import('express').Response;
      service.clearAuthCookies(res);
      expect(res.clearCookie).toHaveBeenCalledWith('tp_access_token', { path: '/' });
      expect(res.clearCookie).toHaveBeenCalledWith('tp_refresh_token', { path: '/' });
    });
  });
});
