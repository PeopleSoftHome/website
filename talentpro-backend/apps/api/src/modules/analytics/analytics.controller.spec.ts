import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { RolesGuard } from '@/common/guards/roles.guard';
import { TrackPageViewDto } from './dto/track-page-view.dto';
import { TrackEventDto } from './dto/track-event.dto';
import { TrackEventsBatchDto } from './dto/track-events-batch.dto';
import { TrackWebVitalDto } from './dto/track-web-vital.dto';
import { ReportClientErrorDto } from './dto/report-client-error.dto';
import { LogUserActivityDto } from './dto/log-user-activity.dto';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: {
            trackPageView: jest.fn(),
            trackEvents: jest.fn(),
            trackWebVital: jest.fn(),
            logUserActivity: jest.fn(),
            getDashboardStats: jest.fn(),
            getConversionFunnel: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /analytics/page-views', () => {
    it('should track page view with ip and user agent', async () => {
      const dto: TrackPageViewDto = { path: '/', sessionId: 's1' };
      const expected = { id: 'pv1', ...dto };
      jest.spyOn(service, 'trackPageView').mockResolvedValue(expected as any);

      const req = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'test-agent' },
        socket: { remoteAddress: '127.0.0.2' },
      } as unknown as Request;

      const result = await controller.trackPageView(dto, req);

      expect(service.trackPageView).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/',
          sessionId: 's1',
          ipAddress: '127.0.0.1',
          userAgent: 'test-agent',
        }),
      );
      expect(result).toEqual(expected);
    });
  });

  describe('POST /analytics/events', () => {
    it('should track batch events', async () => {
      const events: TrackEventDto[] = [
        { event: 'demo_modal_open', sessionId: 's1' },
      ];
      const dto: TrackEventsBatchDto = { events };
      const expected = { count: 1 };
      jest.spyOn(service, 'trackEvents').mockResolvedValue(expected);

      const result = await controller.trackEvent(dto);

      expect(service.trackEvents).toHaveBeenCalledWith(events);
      expect(result).toEqual(expected);
    });
  });

  describe('POST /analytics/client-errors', () => {
    it('should return received true', async () => {
      const dto: ReportClientErrorDto = {
        type: 'Error',
        message: 'boom',
        url: '/',
      };

      const result = await controller.reportClientError(dto);

      expect(result).toEqual({ received: true });
    });
  });

  describe('POST /analytics/web-vitals', () => {
    it('should track web vital', async () => {
      const dto: TrackWebVitalDto = {
        event: 'web-vital',
        properties: {
          name: 'LCP',
          value: 1.2,
          rating: 'good',
          id: 'id1',
          url: '/',
          pathname: '/',
        },
        sessionId: 's1',
      };
      const expected = { id: 'ev1' };
      jest.spyOn(service, 'trackWebVital').mockResolvedValue(expected as any);

      const result = await controller.trackWebVital(dto);

      expect(service.trackWebVital).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('POST /analytics/activities', () => {
    it('should log user activity', async () => {
      const dto: LogUserActivityDto = { action: 'login' };
      const expected = { id: 'ua1' };
      jest.spyOn(service, 'logUserActivity').mockResolvedValue(expected as any);

      const result = await controller.logUserActivity('u1', dto);

      expect(service.logUserActivity).toHaveBeenCalledWith({
        userId: 'u1',
        ...dto,
      });
      expect(result).toEqual(expected);
    });
  });

  describe('GET /analytics/dashboard', () => {
    it('should return dashboard stats for given days', async () => {
      const expected = { period: { days: 7 } };
      jest.spyOn(service, 'getDashboardStats').mockResolvedValue(expected as any);

      const result = await controller.getDashboardStats('7');

      expect(service.getDashboardStats).toHaveBeenCalledWith(7);
      expect(result).toEqual(expected);
    });

    it('should default to 30 days when days is not provided', async () => {
      const expected = { period: { days: 30 } };
      jest.spyOn(service, 'getDashboardStats').mockResolvedValue(expected as any);

      const result = await controller.getDashboardStats(undefined);

      expect(service.getDashboardStats).toHaveBeenCalledWith(30);
      expect(result).toEqual(expected);
    });
  });

  describe('GET /analytics/funnel', () => {
    it('should return conversion funnel', async () => {
      const expected = { steps: [] };
      jest
        .spyOn(service, 'getConversionFunnel')
        .mockResolvedValue(expected as any);

      const result = await controller.getConversionFunnel();

      expect(service.getConversionFunnel).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });
});
