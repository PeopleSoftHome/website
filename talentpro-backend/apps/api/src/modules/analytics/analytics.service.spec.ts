import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PageView, EventTrack } from '@prisma/client';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: {
            pageView: {
              create: jest.fn(),
              count: jest.fn(),
              groupBy: jest.fn(),
            },
            eventTrack: {
              create: jest.fn(),
              count: jest.fn(),
              groupBy: jest.fn(),
            },
            userActivity: {
              create: jest.fn(),
            },
            demoBooking: {
              count: jest.fn(),
              groupBy: jest.fn().mockResolvedValue([]),
            },
            user: {
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('trackPageView', () => {
    it('should create page view record', async () => {
      const data = { path: '/', sessionId: 's1' };
      const mockResult = { id: 'pv1', ...data };
      jest.spyOn(prisma.pageView, 'create').mockResolvedValue(mockResult as unknown as PageView);

      const result = await service.trackPageView(data);

      expect(prisma.pageView.create).toHaveBeenCalledWith({ data });
      expect(result).toEqual(mockResult);
    });
  });

  describe('trackEvent', () => {
    it('should create event track record', async () => {
      const data = { event: 'demo_modal_open', sessionId: 's1' };
      const mockResult = { id: 'et1', ...data, properties: {} };
      jest.spyOn(prisma.eventTrack, 'create').mockResolvedValue(mockResult as unknown as EventTrack);

      const result = await service.trackEvent(data);

      expect(prisma.eventTrack.create).toHaveBeenCalledWith({
        data: { ...data, properties: {} },
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard stats with business metrics', async () => {
      jest.spyOn(prisma.pageView, 'count').mockResolvedValue(100);
      jest.spyOn(prisma.eventTrack, 'count').mockResolvedValue(50);
      jest.spyOn(prisma.pageView, 'groupBy').mockResolvedValue([]);
      jest.spyOn(prisma.eventTrack, 'groupBy').mockResolvedValue([]);
      jest.spyOn(prisma.demoBooking, 'count').mockResolvedValue(10);
      jest.spyOn(prisma.user, 'count').mockResolvedValue(5);

      const result = await service.getDashboardStats(30);

      expect(result.overview.totalPageViews).toBe(100);
      expect(result.todayLeads).toBe(10);
      expect(result.totalUsers).toBe(5);
    });
  });

  describe('getConversionFunnel', () => {
    it('should return conversion funnel data', async () => {
      jest.spyOn(prisma.pageView, 'count').mockResolvedValue(1000);
      jest.spyOn(prisma.eventTrack, 'count').mockResolvedValue(100);

      const result = await service.getConversionFunnel();

      expect(result.steps).toHaveLength(4);
      expect(result.steps[0].name).toBe('页面访问');
    });
  });
});
