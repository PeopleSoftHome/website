// Shared revenue aggregation for COMPLETED orders, grouped in the database
// (groupBy/_sum) instead of pulling full rows with nested includes into memory.
// Consumers: PaymentService.getRevenueAnalytics, AnalyticsService.getMarketplaceRevenue.
import { PaymentStatus } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';

export interface RevenueByDayRow {
  date: string;
  revenue: number;
  orders: number;
}

export interface RevenueTopAppRow {
  appId: string;
  name: string;
  revenue: number;
  orders: number;
}

/**
 * 按天聚合收入：groupBy paidAt（时间戳级）后在内存中按日期合并，
 * 输出与历史实现一致：date 为 ISO 日期串，按日期升序。
 */
export async function getRevenueByDay(prisma: PrismaService, since: Date): Promise<RevenueByDayRow[]> {
  const rows = await prisma.order.groupBy({
    by: ['paidAt'],
    where: { status: PaymentStatus.COMPLETED, paidAt: { gte: since } },
    _sum: { total: true },
    _count: { id: true },
  });

  const byDayMap = new Map<string, { revenue: number; orders: number }>();
  for (const row of rows) {
    if (!row.paidAt) continue;
    const date = row.paidAt.toISOString().split('T')[0];
    const day = byDayMap.get(date) || { revenue: 0, orders: 0 };
    day.revenue += row._sum.total || 0;
    day.orders += row._count.id;
    byDayMap.set(date, day);
  }

  return Array.from(byDayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, ...value }));
}

/**
 * 按应用聚合收入 Top10：先 groupBy subscriptionId，再按命中的订阅批量
 * 查询 app（替代全量订单 + 两层 include），输出与历史实现一致：
 * 按 revenue 降序，最多 10 条。
 */
export async function getRevenueTopApps(prisma: PrismaService, since: Date): Promise<RevenueTopAppRow[]> {
  const grouped = await prisma.order.groupBy({
    by: ['subscriptionId'],
    where: { status: PaymentStatus.COMPLETED, paidAt: { gte: since } },
    _sum: { total: true },
    _count: { id: true },
  });

  const subscriptionIds = grouped
    .map((row) => row.subscriptionId)
    .filter((id): id is string => Boolean(id));
  const subscriptions = subscriptionIds.length > 0
    ? await prisma.subscription.findMany({
        where: { id: { in: subscriptionIds } },
        include: { app: true },
      })
    : [];
  const appBySubscription = new Map(subscriptions.map((sub) => [sub.id, sub.app]));

  const appMap = new Map<string, { name: string; revenue: number; orders: number }>();
  for (const row of grouped) {
    if (!row.subscriptionId) continue;
    const app = appBySubscription.get(row.subscriptionId);
    if (!app) continue;
    const stat = appMap.get(app.id) || { name: app.name, revenue: 0, orders: 0 };
    stat.revenue += row._sum.total || 0;
    stat.orders += row._count.id;
    appMap.set(app.id, stat);
  }

  return Array.from(appMap.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 10)
    .map(([appId, value]) => ({ appId, ...value }));
}
