import { getRevenueByDay, getRevenueTopApps } from './revenue-stats.helper';
import type { PrismaService } from '../prisma/prisma.service';

function createPrismaMock() {
  return {
    order: { groupBy: jest.fn() },
    subscription: { findMany: jest.fn() },
  } as unknown as PrismaService & {
    order: { groupBy: jest.Mock };
    subscription: { findMany: jest.Mock };
  };
}

describe('revenue-stats.helper', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRevenueByDay', () => {
    it('should return empty array when no completed orders', async () => {
      const prisma = createPrismaMock();
      prisma.order.groupBy.mockResolvedValue([]);

      const result = await getRevenueByDay(prisma, new Date('2026-07-01T00:00:00.000Z'));

      expect(result).toEqual([]);
    });

    it('should merge multiple orders on the same day', async () => {
      const prisma = createPrismaMock();
      prisma.order.groupBy.mockResolvedValue([
        { paidAt: new Date('2026-07-10T08:00:00.000Z'), _sum: { total: 100 }, _count: { id: 1 } },
        { paidAt: new Date('2026-07-10T20:30:00.000Z'), _sum: { total: 250.5 }, _count: { id: 2 } },
      ]);

      const result = await getRevenueByDay(prisma, new Date('2026-07-01T00:00:00.000Z'));

      expect(result).toEqual([{ date: '2026-07-10', revenue: 350.5, orders: 3 }]);
    });

    it('should split across days and sort by date ascending', async () => {
      const prisma = createPrismaMock();
      prisma.order.groupBy.mockResolvedValue([
        { paidAt: new Date('2026-07-12T10:00:00.000Z'), _sum: { total: 50 }, _count: { id: 1 } },
        { paidAt: new Date('2026-07-09T10:00:00.000Z'), _sum: { total: 200 }, _count: { id: 2 } },
        { paidAt: new Date('2026-07-12T11:00:00.000Z'), _sum: { total: 30 }, _count: { id: 1 } },
      ]);

      const result = await getRevenueByDay(prisma, new Date('2026-07-01T00:00:00.000Z'));

      expect(result).toEqual([
        { date: '2026-07-09', revenue: 200, orders: 2 },
        { date: '2026-07-12', revenue: 80, orders: 2 },
      ]);
    });

    it('should skip rows without paidAt and tolerate null sums', async () => {
      const prisma = createPrismaMock();
      prisma.order.groupBy.mockResolvedValue([
        { paidAt: null, _sum: { total: 100 }, _count: { id: 1 } },
        { paidAt: new Date('2026-07-10T08:00:00.000Z'), _sum: { total: null }, _count: { id: 1 } },
      ]);

      const result = await getRevenueByDay(prisma, new Date('2026-07-01T00:00:00.000Z'));

      expect(result).toEqual([{ date: '2026-07-10', revenue: 0, orders: 1 }]);
    });
  });

  describe('getRevenueTopApps', () => {
    it('should return empty array and skip subscription lookup when no orders', async () => {
      const prisma = createPrismaMock();
      prisma.order.groupBy.mockResolvedValue([]);

      const result = await getRevenueTopApps(prisma, new Date('2026-07-01T00:00:00.000Z'));

      expect(result).toEqual([]);
      expect(prisma.subscription.findMany).not.toHaveBeenCalled();
    });

    it('should group by app across subscriptions and sort by revenue desc', async () => {
      const prisma = createPrismaMock();
      prisma.order.groupBy.mockResolvedValue([
        { subscriptionId: 'sub-1', _sum: { total: 100 }, _count: { id: 1 } },
        { subscriptionId: 'sub-2', _sum: { total: 500 }, _count: { id: 2 } },
        { subscriptionId: 'sub-3', _sum: { total: 200 }, _count: { id: 1 } },
        { subscriptionId: null, _sum: { total: 999 }, _count: { id: 5 } },
      ]);
      prisma.subscription.findMany.mockResolvedValue([
        { id: 'sub-1', app: { id: 'app-a', name: 'App A' } },
        { id: 'sub-2', app: { id: 'app-b', name: 'App B' } },
        { id: 'sub-3', app: { id: 'app-a', name: 'App A' } },
      ]);

      const result = await getRevenueTopApps(prisma, new Date('2026-07-01T00:00:00.000Z'));

      expect(prisma.subscription.findMany).toHaveBeenCalledWith({
        where: { id: { in: ['sub-1', 'sub-2', 'sub-3'] } },
        include: { app: true },
      });
      expect(result).toEqual([
        { appId: 'app-b', name: 'App B', revenue: 500, orders: 2 },
        { appId: 'app-a', name: 'App A', revenue: 300, orders: 2 },
      ]);
    });

    it('should skip groups whose subscription or app is missing', async () => {
      const prisma = createPrismaMock();
      prisma.order.groupBy.mockResolvedValue([
        { subscriptionId: 'sub-gone', _sum: { total: 100 }, _count: { id: 1 } },
        { subscriptionId: 'sub-1', _sum: { total: 42 }, _count: { id: 1 } },
      ]);
      prisma.subscription.findMany.mockResolvedValue([
        { id: 'sub-1', app: { id: 'app-a', name: 'App A' } },
      ]);

      const result = await getRevenueTopApps(prisma, new Date('2026-07-01T00:00:00.000Z'));

      expect(result).toEqual([{ appId: 'app-a', name: 'App A', revenue: 42, orders: 1 }]);
    });

    it('should limit result to top 10 apps', async () => {
      const prisma = createPrismaMock();
      const groups = Array.from({ length: 12 }, (_, i) => ({
        subscriptionId: `sub-${i}`,
        _sum: { total: (i + 1) * 10 },
        _count: { id: 1 },
      }));
      prisma.order.groupBy.mockResolvedValue(groups);
      prisma.subscription.findMany.mockResolvedValue(
        groups.map((g, i) => ({ id: g.subscriptionId, app: { id: `app-${i}`, name: `App ${i}` } })),
      );

      const result = await getRevenueTopApps(prisma, new Date('2026-07-01T00:00:00.000Z'));

      expect(result).toHaveLength(10);
      expect(result[0]).toEqual({ appId: 'app-11', name: 'App 11', revenue: 120, orders: 1 });
      expect(result[9].revenue).toBe(30);
    });
  });
});
