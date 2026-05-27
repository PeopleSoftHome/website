import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '@/common/prisma/prisma.service';

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
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue(mockUsers as any);
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
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

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
});
