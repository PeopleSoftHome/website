import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: PrismaService;

  const mockNotification = {
    id: 'n1',
    userId: 'u1',
    type: 'SYSTEM',
    title: 'Test',
    content: 'Hello',
    isRead: false,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: {
            notification: {
              findMany: jest.fn().mockResolvedValue([mockNotification]),
              count: jest.fn().mockResolvedValue(1),
              updateMany: jest.fn().mockResolvedValue({ count: 1 }),
              create: jest.fn().mockResolvedValue(mockNotification),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUser', () => {
    it('should return paginated notifications with unread count', async () => {
      const result = await service.findByUser('u1', 1, 20);

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
      });
      expect(prisma.notification.count).toHaveBeenCalledTimes(2);
      expect(result.data).toEqual([mockNotification]);
      expect(result.meta).toEqual({ page: 1, pageSize: 20, total: 1, unreadCount: 1 });
    });
  });

  describe('markAsRead', () => {
    it('should mark single notification as read', async () => {
      const result = await service.markAsRead('u1', 'n1');
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { id: 'n1', userId: 'u1' },
        data: { isRead: true },
      });
      expect(result).toEqual({ message: '已标记为已读' });
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      const result = await service.markAllAsRead('u1');
      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u1', isRead: false },
        data: { isRead: true },
      });
      expect(result).toEqual({ message: '全部已读' });
    });
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const dto = {
        userId: 'u1',
        type: 'SYSTEM',
        title: 'Welcome',
        content: 'Thanks for joining',
        data: { foo: 'bar' },
      };
      const result = await service.create(dto);
      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: dto.userId,
          type: dto.type,
          title: dto.title,
          content: dto.content,
          data: { foo: 'bar' },
        }),
      });
      expect(result).toEqual(mockNotification);
    });
  });
});
