import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceService } from './workspace.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';

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
              update: jest.fn(),
            },
            workspace: {
              create: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
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
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      const result = await service.findMine('u1');

      expect(result.workspace).toEqual(mockUser.workspace);
      expect(result.role).toBe('OWNER');
    });

    it('should throw NotFoundException when user has no workspace', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 'u1', workspace: null } as any);

      await expect(service.findMine('u1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create workspace and update user', async () => {
      const mockWorkspace = { id: 'ws1', name: 'New Workspace', slug: 'new-workspace' };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 'u1', workspace: null } as any);
      jest.spyOn(prisma.workspace, 'create').mockResolvedValue(mockWorkspace as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({ id: 'u1', workspaceId: 'ws1' } as any);

      // 重写 $transaction 以正确执行
      jest.spyOn(prisma, '$transaction').mockImplementation(async (callback: any) => {
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

    it('should throw ConflictException when user already has workspace', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({
        id: 'u1',
        workspace: { id: 'ws1' },
      } as any);

      await expect(service.create('u1', { name: 'New' })).rejects.toThrow(ConflictException);
    });
  });
});
