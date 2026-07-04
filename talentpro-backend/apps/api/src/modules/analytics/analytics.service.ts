import { Injectable } from '@nestjs/common';
import { Prisma, PaymentStatus } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // ─── PageView ───
  async trackPageView(data: {
    path: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
    userId?: string;
    sessionId: string;
  }) {
    return this.prisma.pageView.create({ data });
  }

  // ─── EventTrack ───
  async trackEvent(data: {
    event: string;
    properties?: Record<string, unknown>;
    userId?: string;
    sessionId: string;
  }) {
    return this.prisma.eventTrack.create({
      data: { ...data, properties: (data.properties || {}) as Prisma.InputJsonValue },
    });
  }

  async trackEvents(events: {
    event: string;
    properties?: Record<string, unknown>;
    userId?: string;
    sessionId: string;
  }[]) {
    const result = await this.prisma.$transaction(
      events.map((e) =>
        this.prisma.eventTrack.create({
          data: { ...e, properties: (e.properties || {}) as Prisma.InputJsonValue },
        }),
      ),
    );
    return { count: result.length };
  }

  // ─── UserActivity ───
  async logUserActivity(data: {
    userId: string;
    action: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.prisma.userActivity.create({
      data: { ...data, metadata: (data.metadata || {}) as Prisma.InputJsonValue },
    });
  }

  // ─── Dashboard ───
  async getDashboardStats(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalPageViews,
      totalEvents,
      uniqueSessions,
      topPages,
      topEvents,
      dailyPageViews,
      dailyEvents,
      todayLeads,
      monthLeads,
      totalUsers,
      pendingLeads,
      leadTrend,
    ] = await Promise.all([
      this.prisma.pageView.count({ where: { createdAt: { gte: since } } }),
      this.prisma.eventTrack.count({ where: { createdAt: { gte: since } } }),
      this.prisma.pageView.groupBy({
        by: ['sessionId'],
        where: { createdAt: { gte: since } },
        _count: { sessionId: true },
      }).then((rows) => rows.length),
      this.prisma.pageView.groupBy({
        by: ['path'],
        where: { createdAt: { gte: since } },
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 10,
      }),
      this.prisma.eventTrack.groupBy({
        by: ['event'],
        where: { createdAt: { gte: since } },
        _count: { event: true },
        orderBy: { _count: { event: 'desc' } },
        take: 10,
      }),
      this.prisma.pageView.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: since } },
        _count: { id: true },
      }).then((rows) =>
        rows.map((r) => ({
          date: r.createdAt.toISOString().split('T')[0],
          count: r._count.id,
        })),
      ),
      this.prisma.eventTrack.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: since } },
        _count: { id: true },
      }).then((rows) =>
        rows.map((r) => ({
          date: r.createdAt.toISOString().split('T')[0],
          count: r._count.id,
        })),
      ),
      // 业务指标
      this.prisma.demoBooking.count({ where: { createdAt: { gte: today } } }),
      this.prisma.demoBooking.count({ where: { createdAt: { gte: monthStart } } }),
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.demoBooking.count({ where: { status: 'NEW' } }),
      this.prisma.demoBooking.groupBy({
        by: ['createdAt'],
        where: { createdAt: { gte: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000) } },
        _count: { id: true },
      }).then((rows) =>
        rows.map((r) => ({
          date: r.createdAt.toISOString().split('T')[0],
          count: r._count.id,
        })),
      ),
    ]);

    return {
      period: { days, since: since.toISOString() },
      overview: { totalPageViews, totalEvents, uniqueSessions },
      topPages,
      topEvents,
      dailyPageViews,
      dailyEvents,
      todayLeads,
      monthLeads,
      totalUsers,
      pendingLeads,
      leadTrend,
    };
  }

  async trackWebVital(data: {
    event: string;
    properties: {
      name: string;
      value: number;
      rating: string;
      delta?: number;
      id: string;
      navigationType?: string;
      url: string;
      pathname: string;
    };
    sessionId: string;
    ts?: number;
  }) {
    return this.prisma.eventTrack.create({
      data: {
        event: `web_vital_${data.properties.name}`,
        properties: {
          ...data.properties,
          ts: data.ts,
        },
        sessionId: data.sessionId,
      },
    });
  }

  async getMarketplaceRevenue(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const [byProvider, byDay, topApps] = await Promise.all([
      this.prisma.order.groupBy({
        by: ['provider'],
        where: { status: PaymentStatus.COMPLETED },
        _count: { provider: true },
        _sum: { total: true },
      }),
      this.prisma.order.groupBy({
        by: ['createdAt'],
        where: { status: PaymentStatus.COMPLETED, paidAt: { gte: since } },
        _sum: { total: true },
        _count: { id: true },
      }).then((rows) =>
        rows.map((r) => ({
          date: r.createdAt.toISOString().split('T')[0],
          revenue: r._sum.total || 0,
          orders: r._count.id,
        })),
      ),
      this.prisma.order.findMany({
        where: { status: PaymentStatus.COMPLETED, paidAt: { gte: since } },
        include: { subscription: { include: { app: true } } },
        orderBy: { paidAt: 'asc' },
      }).then((orders) => {
        const appMap = new Map<string, { name: string; revenue: number; orders: number }>();
        for (const order of orders) {
          const app = order.subscription?.app;
          if (!app) continue;
          const stat = appMap.get(app.id) || { name: app.name, revenue: 0, orders: 0 };
          stat.revenue += order.total;
          stat.orders += 1;
          appMap.set(app.id, stat);
        }
        return Array.from(appMap.entries())
          .sort((a, b) => b[1].revenue - a[1].revenue)
          .slice(0, 10)
          .map(([appId, value]) => ({ appId, ...value }));
      }),
    ]);

    const totalRevenue = byProvider.reduce((sum, row) => sum + (row._sum.total || 0), 0);
    const totalOrders = byProvider.reduce((sum, row) => sum + row._count.provider, 0);

    return {
      totalRevenue,
      totalOrders,
      byProvider: byProvider.map((row) => ({
        provider: row.provider || 'UNKNOWN',
        count: row._count.provider,
        revenue: row._sum.total || 0,
      })),
      byDay,
      topApps,
    };
  }

  async getConversionFunnel() {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    since.setHours(0, 0, 0, 0);

    const [
      pageViewCount,
      demoModalOpen,
      demoStepComplete,
      demoSubmit,
    ] = await Promise.all([
      this.prisma.pageView.count({ where: { createdAt: { gte: since } } }),
      this.prisma.eventTrack.count({ where: { event: 'demo_modal_open', createdAt: { gte: since } } }),
      this.prisma.eventTrack.count({ where: { event: 'demo_step_complete', createdAt: { gte: since } } }),
      this.prisma.eventTrack.count({ where: { event: 'demo_submit', createdAt: { gte: since } } }),
    ]);

    return {
      steps: [
        { name: '页面访问', count: pageViewCount },
        { name: '打开预约弹窗', count: demoModalOpen, rate: pageViewCount ? ((demoModalOpen / pageViewCount) * 100).toFixed(2) + '%' : '0%' },
        { name: '完成表单步骤', count: demoStepComplete, rate: demoModalOpen ? ((demoStepComplete / demoModalOpen) * 100).toFixed(2) + '%' : '0%' },
        { name: '提交预约', count: demoSubmit, rate: demoStepComplete ? ((demoSubmit / demoStepComplete) * 100).toFixed(2) + '%' : '0%' },
      ],
    };
  }
}
