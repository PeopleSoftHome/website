import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { PrismaService } from '@shared/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';

// Mock passport AuthGuard so JwtAuthGuard.canActivate can focus on blacklist logic
jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn(() => {
    class MockAuthGuard {
      async canActivate() {
        return true;
      }
      handleRequest(err: unknown, user: unknown) {
        if (err || !user) throw err || new Error('Unauthorized');
        return user;
      }
    }
    return MockAuthGuard;
  }),
}));

describe('Auth Security', () => {
  describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;
    let prisma: PrismaService;

    const buildContext = (overrides: { public?: boolean; token?: string; cookie?: string } = {}): ExecutionContext => {
      const req = {
        cookies: overrides.cookie ? { tp_access_token: overrides.cookie } : {},
        headers: overrides.token ? { authorization: `Bearer ${overrides.token}` } : {},
      };
      return {
        switchToHttp: () => ({
          getRequest: () => req,
        }),
        getHandler: () => ({}),
        getClass: () => ({}),
      } as unknown as ExecutionContext;
    };

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          JwtAuthGuard,
          {
            provide: Reflector,
            useValue: {
              getAllAndOverride: jest.fn().mockReturnValue(false),
            },
          },
          {
            provide: PrismaService,
            useValue: {
              tokenBlacklist: {
                findUnique: jest.fn(),
              },
            },
          },
        ],
      }).compile();

      guard = module.get<JwtAuthGuard>(JwtAuthGuard);
      prisma = module.get<PrismaService>(PrismaService);
    });

    it('should allow public routes without checking token', async () => {
      const reflector = (guard as unknown as { reflector: Reflector }).reflector;
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
      const ctx = buildContext({ token: 'any-token' });
      await expect(guard.canActivate(ctx)).resolves.toBe(true);
      expect(prisma.tokenBlacklist.findUnique).not.toHaveBeenCalled();
    });

    it('should reject blacklisted bearer tokens', async () => {
      jest.spyOn(prisma.tokenBlacklist, 'findUnique').mockResolvedValue({ id: 'bl-1', token: 'bad-token' } as unknown as import('@prisma/client').TokenBlacklist);
      const ctx = buildContext({ token: 'bad-token' });
      await expect(guard.canActivate(ctx)).rejects.toThrow('Token has expired, please log in again');
    });

    it('should reject blacklisted cookie tokens', async () => {
      jest.spyOn(prisma.tokenBlacklist, 'findUnique').mockResolvedValue({ id: 'bl-2', token: 'cookie-token' } as unknown as import('@prisma/client').TokenBlacklist);
      const ctx = buildContext({ cookie: 'cookie-token' });
      await expect(guard.canActivate(ctx)).rejects.toThrow('Token has expired, please log in again');
    });

    it('should proceed when token is not blacklisted', async () => {
      jest.spyOn(prisma.tokenBlacklist, 'findUnique').mockResolvedValue(null);
      const ctx = buildContext({ token: 'valid-token' });
      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });
  });

  describe('RegisterDto password policy', () => {
    it('should reject passwords shorter than 8 characters', async () => {
      const dto = plainToInstance(RegisterDto, {
        email: 'test@example.com',
        password: 'Short1!',
        name: 'Test',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should reject passwords without uppercase letters', async () => {
      const dto = plainToInstance(RegisterDto, {
        email: 'test@example.com',
        password: 'lowercase1!',
        name: 'Test',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should reject passwords without lowercase letters', async () => {
      const dto = plainToInstance(RegisterDto, {
        email: 'test@example.com',
        password: 'UPPERCASE1!',
        name: 'Test',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should reject passwords without digits', async () => {
      const dto = plainToInstance(RegisterDto, {
        email: 'test@example.com',
        password: 'NoDigits!@',
        name: 'Test',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should reject passwords without special characters', async () => {
      const dto = plainToInstance(RegisterDto, {
        email: 'test@example.com',
        password: 'NoSpecial123',
        name: 'Test',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should accept a strong password', async () => {
      const dto = plainToInstance(RegisterDto, {
        email: 'test@example.com',
        password: 'StrongPass123!',
        name: 'Test',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
