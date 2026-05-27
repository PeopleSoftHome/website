import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
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
      jest.spyOn(authService, 'login').mockResolvedValue(expected as any);

      const result = await controller.login(dto as any);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return new access token', async () => {
      const body = { refreshToken: 'old-rtoken' };
      const expected = { accessToken: 'new-atoken', expiresAt: new Date() };
      jest.spyOn(authService, 'refresh').mockResolvedValue(expected as any);

      const result = await controller.refresh(body);

      expect(authService.refresh).toHaveBeenCalledWith(body.refreshToken);
      expect(result).toEqual(expected);
    });
  });

  describe('POST /auth/logout', () => {
    it('should call authService.logout with token', async () => {
      const req = { headers: { authorization: 'Bearer atoken' } } as any;
      jest.spyOn(authService, 'logout').mockResolvedValue({ success: true } as any);

      const result = await controller.logout(req);

      expect(authService.logout).toHaveBeenCalledWith('atoken');
      expect(result).toEqual({ success: true });
    });
  });
});
