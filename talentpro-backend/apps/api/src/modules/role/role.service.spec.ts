import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RoleService } from './role.service';
import { PrismaService } from '@shared/prisma/prisma.service';

describe('RoleService', () => {
  let service: RoleService;
  let prisma: PrismaService;

  const mockRole = {
    id: 'r1',
    name: 'ADMIN',
    description: '管理员',
    permissions: [{ id: 'p1', resource: 'user', action: 'read' }],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: PrismaService,
          useValue: {
            role: {
              findMany: jest.fn().mockResolvedValue([mockRole]),
              findUnique: jest.fn().mockResolvedValue(mockRole),
              create: jest.fn().mockResolvedValue(mockRole),
              update: jest.fn().mockResolvedValue(mockRole),
              delete: jest.fn().mockResolvedValue(mockRole),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all roles with permissions', async () => {
      const result = await service.findAll();
      expect(prisma.role.findMany).toHaveBeenCalledWith({
        include: { permissions: true },
      });
      expect(result).toEqual([mockRole]);
    });
  });

  describe('findOne', () => {
    it('should return role by id', async () => {
      const result = await service.findOne('r1');
      expect(prisma.role.findUnique).toHaveBeenCalledWith({
        where: { id: 'r1' },
        include: { permissions: true },
      });
      expect(result).toEqual(mockRole);
    });

    it('should throw NotFoundException when role not found', async () => {
      jest.spyOn(prisma.role, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create role with permission connections', async () => {
      const dto = { name: 'EDITOR', description: '编辑', permissionIds: ['p1', 'p2'] };
      const result = await service.create(dto);
      expect(prisma.role.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          description: dto.description,
          permissions: { connect: [{ id: 'p1' }, { id: 'p2' }] },
        },
        include: { permissions: true },
      });
      expect(result).toEqual(mockRole);
    });

    it('should create role without permissions', async () => {
      const dto = { name: 'VIEWER' };
      await service.create(dto);
      expect(prisma.role.create).toHaveBeenCalledWith({
        data: { name: dto.name, description: undefined, permissions: undefined },
        include: { permissions: true },
      });
    });
  });

  describe('update', () => {
    it('should update role and replace permissions', async () => {
      const dto = { name: 'SUPER_ADMIN', permissionIds: ['p3'] };
      const result = await service.update('r1', dto);
      expect(prisma.role.update).toHaveBeenCalledWith({
        where: { id: 'r1' },
        data: {
          name: dto.name,
          description: undefined,
          permissions: { set: [{ id: 'p3' }] },
        },
        include: { permissions: true },
      });
      expect(result).toEqual(mockRole);
    });

    it('should throw when updating nonexistent role', async () => {
      jest.spyOn(prisma.role, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.update('bad', { name: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete role and return message', async () => {
      const result = await service.remove('r1');
      expect(prisma.role.delete).toHaveBeenCalledWith({ where: { id: 'r1' } });
      expect(result).toEqual({ message: 'Deleted successfully' });
    });

    it('should throw when deleting nonexistent role', async () => {
      jest.spyOn(prisma.role, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.remove('bad')).rejects.toThrow(NotFoundException);
    });
  });
});
