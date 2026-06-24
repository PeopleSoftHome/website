import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthUserService } from './auth-user.service';
import { AuthTokenService } from './auth-token.service';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userService: AuthUserService;
  let tokenService: AuthTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthUserService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            devLogin: jest.fn(),
            getMe: jest.fn(),
            updateProfile: jest.fn(),
          },
        },
        {
          provide: AuthTokenService,
          useValue: {
            generateTokens: jest.fn().mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' }),
            saveRefreshToken: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<AuthUserService>(AuthUserService);
    tokenService = module.get<AuthTokenService>(AuthTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return user and tokens', async () => {
      const user = { id: 'u1', email: 'a@b.com', workspaceId: 'w1' };
      (userService.login as jest.Mock).mockResolvedValue({ user });

      const result = await service.login({ email: 'a@b.com', password: 'pwd' } as LoginDto);
      expect(result).toEqual({ user, accessToken: 'at', refreshToken: 'rt' });
      expect(tokenService.saveRefreshToken).toHaveBeenCalledWith('u1', 'rt');
    });
  });

  describe('devLogin', () => {
    it('should return user and tokens without password', async () => {
      const user = { id: 'u1', email: 'dev@talentpro.com', workspaceId: 'w1' };
      (userService.devLogin as jest.Mock).mockResolvedValue({ user });

      const result = await service.devLogin();
      expect(result).toEqual({ user, accessToken: 'at', refreshToken: 'rt' });
      expect(tokenService.saveRefreshToken).toHaveBeenCalledWith('u1', 'rt');
    });
  });

  describe('refresh', () => {
    it('should delegate to tokenService', async () => {
      (tokenService.refresh as jest.Mock).mockResolvedValue({ accessToken: 'new', refreshToken: 'new' });
      const result = await service.refresh('rt');
      expect(result).toEqual({ accessToken: 'new', refreshToken: 'new' });
    });
  });

  describe('logout', () => {
    it('should delegate to tokenService', async () => {
      (tokenService.logout as jest.Mock).mockResolvedValue({ message: 'ok' });
      const result = await service.logout('rt', 'at');
      expect(result).toEqual({ message: 'ok' });
    });
  });

  describe('getMe', () => {
    it('should delegate to userService', async () => {
      const user = { id: 'u1' };
      (userService.getMe as jest.Mock).mockResolvedValue(user);
      const result = await service.getMe('u1');
      expect(result).toEqual(user);
    });
  });

  describe('updateProfile', () => {
    it('should delegate to userService', async () => {
      const user = { id: 'u1', name: 'New' };
      (userService.updateProfile as jest.Mock).mockResolvedValue(user);
      const result = await service.updateProfile('u1', { name: 'New' } as UpdateProfileDto);
      expect(result).toEqual(user);
    });
  });
});
