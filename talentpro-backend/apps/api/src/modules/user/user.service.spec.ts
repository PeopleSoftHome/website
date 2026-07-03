import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from '@/common/prisma/prisma.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              count: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users without password', async () => {
      const mockUsers = [
        { id: 'u1', email: 'a@example.com', name: 'A', roleId: 'r1' },
      ];
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(mockUsers as unknown as User[]);
      jest.spyOn(prisma.user, 'count').mockResolvedValue(1);

      const result = await service.findAll(1, 20);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            id: true,
            email: true,
            name: true,
            // 确保 password 不在 select 中
          }),
        }),
      );
      expect(result.data).toEqual(mockUsers);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should exclude password from response', async () => {
      const mockUser = { id: 'u1', email: 'a@example.com', name: 'A', roleId: 'r1' };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as unknown as User);

      const result = await service.findOne('u1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.not.objectContaining({ password: true }),
        }),
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow('用户不存在');
    });
  });

  describe('create', () => {
    it('should create user with hashed password when email is available', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue(null);
      const created = { id: 'u1', email: 'a@example.com', name: 'A', status: 'ACTIVE', roleId: null, createdAt: new Date() };
      jest.spyOn(prisma.user, 'create').mockResolvedValue(created as unknown as User);

      const result = await service.create({
        email: 'a@example.com',
        password: 'SecurePass123!',
        name: 'A',
      });

      expect(prisma.user.findFirst).toHaveBeenCalledWith({ where: { email: 'a@example.com' } });
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ email: 'a@example.com', name: 'A', password: 'hashed-password' }),
          select: expect.not.objectContaining({ password: true }),
        }),
      );
      expect(result).toEqual(created);
    });

    it('should throw ConflictException when email already exists', async () => {
      jest.spyOn(prisma.user, 'findFirst').mockResolvedValue({ id: 'u-exist' } as unknown as User);

      await expect(
        service.create({ email: 'a@example.com', password: 'SecurePass123!', name: 'A' }),
      ).rejects.toThrow(ConflictException);

      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update user after verifying existence', async () => {
      const existing = { id: 'u1', email: 'a@example.com' };
      const updated = { id: 'u1', email: 'a@example.com', name: 'B', status: 'ACTIVE', roleId: null, updatedAt: new Date() };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(existing as unknown as User);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(updated as unknown as User);

      const result = await service.update('u1', { name: 'B' });

      expect(prisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'u1' } }),
      );
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { name: 'B' },
        select: expect.not.objectContaining({ password: true }),
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when updating missing user', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.update('missing', { name: 'B' })).rejects.toThrow(NotFoundException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete user after verifying existence', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue({ id: 'u1' } as unknown as User);
      jest.spyOn(prisma.user, 'delete').mockResolvedValue({} as unknown as User);

      const result = await service.remove('u1');

      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
      expect(result).toEqual({ message: '删除成功' });
    });

    it('should throw NotFoundException when deleting missing user', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
      expect(prisma.user.delete).not.toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should return active users matching query', async () => {
      const users = [{ id: 'u1', name: 'Alice', email: 'alice@example.com', avatar: null }];
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(users as unknown as User[]);

      const result = await service.search('ali', 5);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: 'ACTIVE',
            OR: [
              { name: { contains: 'ali', mode: 'insensitive' } },
              { email: { contains: 'ali', mode: 'insensitive' } },
            ],
          },
          select: { id: true, name: true, email: true, avatar: true },
          take: 5,
        }),
      );
      expect(result.data).toEqual(users);
    });
  });
});
