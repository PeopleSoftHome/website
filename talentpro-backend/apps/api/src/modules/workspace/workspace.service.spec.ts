import { Test, TestingModule } from '@nestjs/testing';
import { User, Workspace, WorkspaceInvite } from '@prisma/client';
import { WorkspaceService } from './workspace.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('WorkspaceService', () => {
  let service: WorkspaceService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
            },
            workspace: {
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
            },
            workspaceInvite: {
              create: jest.fn(),
            },
            $transaction: jest.fn((cb) => cb({
              workspace: { create: jest.fn(), update: jest.fn() },
              user: { update: jest.fn() },
            })),
          },
        },
      ],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findMine', () => {
    it('should return user workspace', async () => {
      const mockUser = {
        id: 'u1',
        workspace: { id: 'ws1', name: 'Test Workspace' },
        workspaceRole: 'OWNER',
      };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as unknown as User);

      const result = await service.findMine('u1');

      expect(result.workspace).toEqual(mockUser.workspace);
      expect(result.role).toBe('OWNER');
    });

    it('should throw NotFoundException when user has no workspace', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 'u1', workspace: null } as unknown as User);

      await expect(service.findMine('u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create workspace and update user', async () => {
      const mockWorkspace = { id: 'ws1', name: 'New Workspace', slug: 'new-workspace' };
      jest.spyOn(prisma.workspace, 'create').mockResolvedValue(mockWorkspace as unknown as Workspace);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({ id: 'u1', workspaceId: 'ws1' } as unknown as User);

      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          workspace: { create: jest.fn().mockResolvedValue(mockWorkspace) },
          user: { update: jest.fn().mockResolvedValue({}) },
        };
        return callback(tx);
      });

      const result = await service.create('u1', { name: 'New Workspace' });

      expect(result).toBeDefined();
      expect(result.name).toBe('New Workspace');
    });

    it('should allow creating additional workspace when user already has one', async () => {
      const mockWorkspace = { id: 'ws2', name: 'Second Workspace', slug: 'second-workspace' };
      jest.spyOn(prisma.workspace, 'create').mockResolvedValue(mockWorkspace as unknown as Workspace);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({ id: 'u1', workspaceId: 'ws2' } as unknown as User);

      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          workspace: { create: jest.fn().mockResolvedValue(mockWorkspace) },
          user: { update: jest.fn().mockResolvedValue({}) },
        };
        return callback(tx);
      });

      const result = await service.create('u1', { name: 'Second Workspace' });

      expect(result).toBeDefined();
      expect(result.name).toBe('Second Workspace');
    });
  });

  describe('inviteMember', () => {
    it('should add existing user to workspace', async () => {
      const inviter = { id: 'u1', workspaceId: 'ws1', workspaceRole: 'OWNER' };
      const invitee = { id: 'u2', email: 'new@example.com', workspaceId: null };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(inviter as unknown as User);
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(invitee as unknown as User);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({} as unknown as User);

      const result = await service.inviteMember('u1', 'ws1', 'new@example.com');

      expect(result.message).toBe('邀请成功');
    });

    it('should create invite token for unregistered email', async () => {
      const inviter = { id: 'u1', workspaceId: 'ws1', workspaceRole: 'OWNER' };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(inviter as unknown as User);
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);
      jest.spyOn(prisma.workspaceInvite, 'create').mockResolvedValue({
        id: 'i1',
        token: 'token',
        expiresAt: new Date(),
      } as unknown as WorkspaceInvite);

      const result = await service.inviteMember('u1', 'ws1', 'pending@example.com');

      expect(result.inviteToken).toBeDefined();
    });
  });
});
