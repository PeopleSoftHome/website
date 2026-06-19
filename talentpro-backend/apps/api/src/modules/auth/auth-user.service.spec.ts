import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthUserService } from './auth-user.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Role, User, WorkspaceInvite } from '@prisma/client';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthUserService', () => {
  let service: AuthUserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthUserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            role: {
              findUnique: jest.fn(),
            },
            workspace: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            workspaceInvite: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn(async (cb: (tx: Record<string, unknown>) => unknown) => cb({
              user: {
                create: jest.fn(),
                update: jest.fn(),
              },
              workspace: {
                create: jest.fn(),
              },
              workspaceInvite: {
                update: jest.fn(),
              },
            })),
          },
        },
      ],
    }).compile();

    service = module.get<AuthUserService>(AuthUserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and create workspace', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
        phone: '13800138000',
        company: 'Test Corp',
      };
      const mockRole = { id: 'r1', name: 'USER' };
      const mockUser = {
        id: 'u1',
        email: dto.email,
        name: dto.name,
        status: 'ACTIVE',
        createdAt: new Date(),
      };
      const mockWorkspace = { id: 'w1', name: dto.company, slug: 'test-corp' };
      const updatedUser = { ...mockUser, workspaceId: mockWorkspace.id, workspaceRole: 'OWNER' };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.role, 'findUnique').mockResolvedValue(mockRole as unknown as Role);
      jest.spyOn(prisma.workspace, 'findUnique').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      // Override $transaction to return our mocked data
      jest.spyOn(prisma, '$transaction').mockImplementation(async (cb: (tx: Record<string, unknown>) => unknown) => {
        const tx = {
          user: {
            create: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue(updatedUser),
          },
          workspace: {
            create: jest.fn().mockResolvedValue(mockWorkspace),
          },
        };
        return cb(tx);
      });

      const result = await service.register(dto);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 12);
      expect(result.message).toBe('注册成功');
      expect(result.user).toEqual(updatedUser);
    });

    it('should throw ConflictException when email already exists', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      };
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue({ id: 'u1' } as unknown as User);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      await expect(service.register(dto)).rejects.toThrow('邮箱已被注册');
    });

    it('should join existing workspace with valid invite token', async () => {
      const dto = {
        email: 'invited@example.com',
        password: 'SecurePass123!',
        name: 'Invited User',
        inviteToken: 'valid-token',
      };
      const mockRole = { id: 'r1', name: 'USER' };
      const mockInvite = {
        id: 'i1',
        email: dto.email,
        workspaceId: 'ws1',
        token: dto.inviteToken,
        usedAt: null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };
      const mockUser = {
        id: 'u1',
        email: dto.email,
        name: dto.name,
        status: 'ACTIVE',
        createdAt: new Date(),
        workspaceId: mockInvite.workspaceId,
        workspaceRole: 'MEMBER',
      };

      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.workspaceInvite, 'findUnique').mockResolvedValue(mockInvite as unknown as WorkspaceInvite);
      jest.spyOn(prisma.role, 'findUnique').mockResolvedValue(mockRole as unknown as Role);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      jest.spyOn(prisma, '$transaction').mockImplementation(async (cb: (tx: Record<string, unknown>) => unknown) => {
        const tx = {
          user: {
            create: jest.fn().mockResolvedValue(mockUser),
          },
          workspaceInvite: {
            update: jest.fn().mockResolvedValue({ ...mockInvite, usedAt: new Date() }),
          },
        };
        return cb(tx);
      });

      const result = await service.register(dto);

      expect(result.message).toBe('注册成功');
      expect(result.user.workspaceId).toBe('ws1');
      expect(result.user.workspaceRole).toBe('MEMBER');
    });
  });

  describe('login', () => {
    it('should return user info on valid credentials', async () => {
      const dto = { email: 'test@example.com', password: 'SecurePass123!' };
      const mockUser = {
        id: 'u1',
        email: dto.email,
        password: 'hashedPassword',
        name: 'Test User',
        status: 'ACTIVE',
        role: { name: 'USER' },
        workspaceId: 'w1',
        workspaceRole: 'OWNER',
        workspace: { name: 'Test Corp' },
      };
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser as unknown as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(dto);

      expect(prisma.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: dto.email } }),
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, mockUser.password);
      expect(result.user).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: 'USER',
        }),
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const dto = { email: 'missing@example.com', password: 'pass' };
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(dto)).rejects.toThrow('邮箱或密码错误');
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      const dto = { email: 'test@example.com', password: 'wrongPass' };
      const mockUser = { id: 'u1', password: 'hashedPassword', status: 'ACTIVE' };
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser as unknown as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(dto)).rejects.toThrow('邮箱或密码错误');
    });

    it('should throw UnauthorizedException when account is inactive', async () => {
      const dto = { email: 'test@example.com', password: 'SecurePass123!' };
      const mockUser = {
        id: 'u1',
        password: 'hashedPassword',
        status: 'INACTIVE',
        role: { name: 'USER' },
      };
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(mockUser as unknown as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(dto)).rejects.toThrow('账号已被禁用');
    });
  });

  describe('getMe', () => {
    it('should return current user profile', async () => {
      const mockUser = {
        id: 'u1',
        email: 'test@example.com',
        name: 'Test User',
        avatar: null,
        phone: null,
        bio: null,
        status: 'ACTIVE',
        role: { id: 'r1', name: 'USER', permissions: [] },
        workspaceId: 'w1',
        workspaceRole: 'OWNER',
        workspace: { id: 'w1', name: 'Test Corp', slug: 'test-corp' },
        createdAt: new Date(),
      };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as unknown as User);

      const result = await service.getMe('u1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u1' },
          select: expect.objectContaining({ id: true, email: true, name: true }),
        }),
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile and return success message', async () => {
      const dto = { name: 'Updated Name', phone: '13900139000' };
      const mockUser = {
        id: 'u1',
        email: 'test@example.com',
        name: dto.name,
        avatar: null,
        phone: dto.phone,
        bio: null,
        status: 'ACTIVE',
        role: { id: 'r1', name: 'USER' },
        createdAt: new Date(),
      };
      jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser as unknown as User);

      const result = await service.updateProfile('u1', dto);

      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'u1' },
          data: dto,
        }),
      );
      expect(result.message).toBe('更新成功');
      expect(result.user).toEqual(mockUser);
    });
  });
});
