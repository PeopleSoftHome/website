import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationSseService } from './notification-sse.service';
import { SseAuthGuard } from '@/common/guards/sse-auth.guard';
import { PaginationDto } from '@/common/dto/pagination.dto';

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: NotificationService;
  let sseService: NotificationSseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: {
            findByUser: jest.fn(),
            markAsRead: jest.fn(),
            markAllAsRead: jest.fn(),
          },
        },
        {
          provide: NotificationSseService,
          useValue: {
            addStream: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(SseAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<NotificationController>(NotificationController);
    service = module.get<NotificationService>(NotificationService);
    sseService = module.get<NotificationSseService>(NotificationSseService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /notifications', () => {
    it('should return paginated notifications', async () => {
      const expected = {
        data: [],
        meta: { page: 1, pageSize: 20, total: 0, unreadCount: 0 },
      };
      jest.spyOn(service, 'findByUser').mockResolvedValue(expected);

      const pagination: PaginationDto = { page: 1, pageSize: 20 };
      const result = await controller.findAll('u1', pagination);

      expect(service.findByUser).toHaveBeenCalledWith('u1', 1, 20);
      expect(result).toEqual(expected);
    });
  });

  describe('SSE /notifications/stream', () => {
    it('should return observable from sse service', (done) => {
      const message = { data: { hello: 'world' } };
      jest.spyOn(sseService, 'addStream').mockReturnValue(of(message as any));

      const result = controller.stream('u1');

      expect(sseService.addStream).toHaveBeenCalledWith('u1');
      result.subscribe((value) => {
        expect(value).toEqual(message);
        done();
      });
    });
  });

  describe('PATCH /notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const expected = { message: 'Marked as read' };
      jest.spyOn(service, 'markAsRead').mockResolvedValue(expected);

      const result = await controller.markAsRead('u1', 'n1');

      expect(service.markAsRead).toHaveBeenCalledWith('u1', 'n1');
      expect(result).toEqual(expected);
    });
  });

  describe('PATCH /notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      const expected = { message: 'All marked as read' };
      jest.spyOn(service, 'markAllAsRead').mockResolvedValue(expected);

      const result = await controller.markAllAsRead('u1');

      expect(service.markAllAsRead).toHaveBeenCalledWith('u1');
      expect(result).toEqual(expected);
    });
  });
});
