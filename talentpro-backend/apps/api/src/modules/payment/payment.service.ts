import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@shared/prisma/prisma.service';
import { PaymentStatus, PaymentProvider, SubscriptionStatus, Prisma } from '@prisma/client';
import { getSkip, buildPaginatedResponse } from '@shared/helpers/pagination.helper';
import { getRevenueByDay, getRevenueTopApps } from '@shared/helpers/revenue-stats.helper';
import Stripe from 'stripe';
import type { Stripe as StripeTypes } from 'stripe/cjs/stripe.core.js';

export interface FindOrdersAdminFilters {
  status?: PaymentStatus;
  provider?: PaymentProvider;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface OrderStatsResult {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  refundedOrders: number;
  pendingOrders: number;
  byProvider: { provider: string; count: number; revenue: number }[];
}

export interface RevenueAnalyticsResult extends OrderStatsResult {
  byDay: { date: string; revenue: number; orders: number }[];
  topApps: { appId: string; name: string; revenue: number; orders: number }[];
}

@Injectable()
export class PaymentService {
  private stripe: StripeTypes | null = null;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (secretKey) {
      // Stripe 版本字符串尚未包含在当前类型定义中
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.stripe = new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' as any });
    }
  }

  // ─── Orders ───

  async createOrder(userId: string, workspaceId: string, dto: {
    appId: string;
    tierName: string;
    interval?: string;
    amount: number;
    currency?: string;
    provider?: PaymentProvider;
    quantity?: number;
  }) {
    const app = await this.prisma.app.findUnique({ where: { id: dto.appId } });
    if (!app) throw new NotFoundException('App not found');

    const tier = this.findPricingTier(app.pricingTiers, dto.tierName);
    if (!tier) throw new BadRequestException('Selected subscription tier not found');

    const interval = dto.interval || 'month';
    const quantity = dto.quantity || 1;
    const unitPrice = tier.price?.[interval] ?? tier.price;
    if (unitPrice === undefined) {
      throw new BadRequestException('Pricing not available for the selected interval');
    }
    const expectedAmount = unitPrice * quantity;
    if (Math.abs(expectedAmount - dto.amount) > 0.01) {
      throw new BadRequestException('Order amount does not match pricing');
    }

    const orderNo = this.generateOrderNo();

    // 创建待激活订阅，与订单绑定
    const subscription = await this.prisma.subscription.create({
      data: {
        appId: dto.appId,
        workspaceId,
        tierName: dto.tierName,
        pricingModel: app.pricingModel,
        amount: dto.amount,
        currency: dto.currency || 'CNY',
        interval,
        status: SubscriptionStatus.TRIAL,
      },
    });

    const order = await this.prisma.order.create({
      data: {
        orderNo,
        subscriptionId: subscription.id,
        workspaceId,
        userId,
        subtotal: dto.amount,
        discount: 0,
        tax: 0,
        total: dto.amount,
        currency: dto.currency || 'CNY',
        status: PaymentStatus.PENDING,
        provider: dto.provider || null,
      },
    });

    return order;
  }

  private findPricingTier(pricingTiers: unknown, tierName: string) {
    if (!pricingTiers) return null;
    try {
      const tiers = typeof pricingTiers === 'string' ? JSON.parse(pricingTiers) : pricingTiers;
      if (Array.isArray(tiers)) {
        return tiers.find((t) => t.name === tierName || t.tierName === tierName);
      }
      if (tiers && typeof tiers === 'object') {
        return tiers[tierName];
      }
    } catch { /* ignore */ }
    return null;
  }

  async findOrders(userId: string, workspaceId: string, page = 1, pageSize = 20) {
    const skip = getSkip(page, pageSize);
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { workspaceId, userId },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where: { workspaceId, userId } }),
    ]);
    return buildPaginatedResponse(data, page, pageSize, total);
  }

  async findOrderById(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await this.findOrderById(userId, orderId);
    if (!this.isValidStatusTransition(order.status, PaymentStatus.CANCELLED)) {
      throw new BadRequestException('Current order status does not allow cancellation');
    }
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: PaymentStatus.CANCELLED },
    });
  }

  // ─── State machine ───

  private isValidStatusTransition(from: PaymentStatus, to: PaymentStatus): boolean {
    if (from === to) return false;
    const transitions: Record<PaymentStatus, PaymentStatus[]> = {
      [PaymentStatus.PENDING]: [PaymentStatus.PROCESSING, PaymentStatus.COMPLETED, PaymentStatus.FAILED, PaymentStatus.CANCELLED],
      [PaymentStatus.PROCESSING]: [PaymentStatus.COMPLETED, PaymentStatus.FAILED],
      [PaymentStatus.COMPLETED]: [PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED],
      [PaymentStatus.REFUNDED]: [],
      [PaymentStatus.PARTIALLY_REFUNDED]: [PaymentStatus.REFUNDED],
      [PaymentStatus.FAILED]: [],
      [PaymentStatus.CANCELLED]: [],
    };
    return transitions[from]?.includes(to) ?? false;
  }

  async updateOrderStatus(userId: string, orderId: string, status: PaymentStatus) {
    const order = await this.findOrderById(userId, orderId);
    if (!this.isValidStatusTransition(order.status, status)) {
      throw new BadRequestException(`Order status cannot transition from ${order.status} to ${status}`);
    }
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  async updateOrderStatusAdmin(orderId: string, status: PaymentStatus, _reason?: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (!this.isValidStatusTransition(order.status, status)) {
      throw new BadRequestException(`Order status cannot transition from ${order.status} to ${status}`);
    }
    // reason 用于审计说明，当前模型未持久化，仅保留参数接口一致性
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  // ─── Invoice ───

  async requestInvoice(userId: string, orderId: string, _invoiceData: { title: string; taxNo?: string }) {
    const order = await this.findOrderById(userId, orderId);
    if (order.status !== PaymentStatus.COMPLETED && order.status !== PaymentStatus.REFUNDED && order.status !== PaymentStatus.PARTIALLY_REFUNDED) {
      throw new BadRequestException('Only completed or refunded orders can request an invoice');
    }

    const invoiceNo = this.generateInvoiceNo();
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        invoiceRequested: true,
        invoiceNo,
      },
    });
  }

  async updateInvoiceAdmin(orderId: string, _invoiceData: { title: string; taxNo?: string }) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    const invoiceNo = order.invoiceNo || this.generateInvoiceNo();
    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        invoiceRequested: true,
        invoiceNo,
      },
    });
  }

  private generateInvoiceNo(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `INV-${date}-${random}`;
  }

  // ─── Admin Orders ───

  async findOrdersAdmin(filters: FindOrdersAdminFilters) {
    const page = Math.max(1, filters.page || 1);
    const pageSize = Math.max(1, filters.pageSize || 20);
    const skip = getSkip(page, pageSize);

    const where: Prisma.OrderWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.provider) where.provider = filters.provider;
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: { subscription: { include: { app: true } } },
      }),
      this.prisma.order.count({ where }),
    ]);

    return buildPaginatedResponse(data, page, pageSize, total);
  }

  async getOrderStats(): Promise<OrderStatsResult> {
    const [allOrders, completedOrders, refundedOrders, pendingOrders, byProvider] = await Promise.all([
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: PaymentStatus.COMPLETED } }),
      this.prisma.order.count({ where: { status: { in: [PaymentStatus.REFUNDED, PaymentStatus.PARTIALLY_REFUNDED] } } }),
      this.prisma.order.count({ where: { status: PaymentStatus.PENDING } }),
      this.prisma.order.groupBy({
        by: ['provider'],
        _count: { provider: true },
        _sum: { total: true },
        where: { status: PaymentStatus.COMPLETED },
      }),
    ]);

    const totalRevenue = byProvider.reduce((sum, row) => sum + (row._sum.total || 0), 0);

    return {
      totalRevenue,
      totalOrders: allOrders,
      completedOrders,
      refundedOrders,
      pendingOrders,
      byProvider: byProvider.map((row) => ({
        provider: row.provider || 'UNKNOWN',
        count: row._count.provider,
        revenue: row._sum.total || 0,
      })),
    };
  }

  async getRevenueAnalytics(days = 30): Promise<RevenueAnalyticsResult> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);

    const [stats, byDay, topApps] = await Promise.all([
      this.getOrderStats(),
      getRevenueByDay(this.prisma, since),
      getRevenueTopApps(this.prisma, since),
    ]);

    return {
      ...stats,
      byDay,
      topApps,
    };
  }

  // ─── Subscriptions ───

  async findSubscriptions(userId: string, workspaceId: string) {
    return this.prisma.subscription.findMany({
      where: { workspaceId },
      include: { app: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Cart ───

  async checkoutCart(
    userId: string,
    workspaceId: string,
    items: { appId: string; tierName: string; interval?: string; amount: number; currency?: string; quantity?: number }[],
  ) {
    if (!items || items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const orders = [];
    for (const item of items) {
      const order = await this.createOrder(userId, workspaceId, {
        appId: item.appId,
        tierName: item.tierName,
        interval: item.interval,
        amount: item.amount,
        currency: item.currency,
        quantity: item.quantity,
      });
      orders.push(order);
    }

    const orderIds = orders.map((o) => o.id);
    const origin = this.config.get<string>('app.frontendUrl', 'http://localhost:3000');
    const successUrl = `${origin}/marketplace/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/marketplace/payment/cancel`;
    const checkout = await this.createStripeCheckoutForOrders(orderIds, successUrl, cancelUrl);

    return { orders, ...checkout };
  }

  // ─── Stripe ───

  async createStripeCheckout(orderId: string, successUrl?: string, cancelUrl?: string) {
    const checkout = await this.createStripeCheckoutForOrders([orderId], successUrl, cancelUrl);
    return checkout;
  }

  private async createStripeCheckoutForOrders(orderIds: string[], successUrl?: string, cancelUrl?: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const orders = await this.prisma.order.findMany({
      where: { id: { in: orderIds } },
    });
    if (orders.length !== orderIds.length) {
      throw new NotFoundException('Some orders not found');
    }
    if (orders.some((o) => o.status !== PaymentStatus.PENDING)) {
      throw new BadRequestException('Order status does not allow payment');
    }

    const origin = this.config.get<string>('app.frontendUrl', 'http://localhost:3000');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: orders.map((order) => ({
        price_data: {
          currency: order.currency.toLowerCase(),
          product_data: { name: `TalentPro 应用订阅 #${order.orderNo}` },
          unit_amount: Math.round(order.total * 100),
        },
        quantity: 1,
      })),
      mode: 'payment',
      success_url: successUrl || `${origin}/marketplace/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/marketplace/payment/cancel`,
      metadata: { orderIds: orderIds.join(',') },
    });

    await this.prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: { provider: PaymentProvider.STRIPE, providerPaymentId: session.id },
    });

    return { sessionId: session.id, url: session.url };
  }

  async handleStripeWebhook(signature: string, payload: Buffer) {
    if (!this.stripe) return { received: false };

    const endpointSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!endpointSecret) return { received: false };

    let event: StripeTypes.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } catch {
      return { received: false };
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as unknown as StripeTypes.Checkout.Session;
      const rawOrderIds = session.metadata?.orderIds || session.metadata?.orderId || '';
      const orderIds = rawOrderIds.split(',').filter(Boolean);
      for (const orderId of orderIds) {
        await this.confirmOrderPayment(orderId, PaymentProvider.STRIPE, session.payment_intent as string || session.id);
      }
    }

    return { received: true };
  }

  // ─── Helpers ───

  private async confirmOrderPayment(orderId: string, provider: PaymentProvider, providerPaymentId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { subscription: true },
    });
    if (!order) return;

    // 幂等性：已完成的订单不再处理
    if (order.status === PaymentStatus.COMPLETED) return;

    // 仅允许从 PENDING / PROCESSING 进入完成态
    const allowComplete: PaymentStatus[] = [PaymentStatus.PENDING, PaymentStatus.PROCESSING];
    if (!allowComplete.includes(order.status)) return;

    const updateSubscriptionOps = [];
    if (order.subscriptionId && order.subscription) {
      updateSubscriptionOps.push(
        this.prisma.subscription.update({
          where: { id: order.subscriptionId },
          data: {
            status: SubscriptionStatus.ACTIVE,
            provider,
            providerSubId: providerPaymentId,
            currentPeriodStart: new Date(),
            currentPeriodEnd: this.calculatePeriodEnd(order.subscription.interval || 'month'),
          },
        }),
      );
    }

    await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: { status: PaymentStatus.COMPLETED, paidAt: new Date(), provider, providerPaymentId },
      }),
      ...updateSubscriptionOps,
    ]);
  }

  private calculatePeriodEnd(interval: string): Date {
    const now = new Date();
    if (interval === 'year') {
      return new Date(now.setFullYear(now.getFullYear() + 1));
    }
    return new Date(now.setMonth(now.getMonth() + 1));
  }

  private generateOrderNo(): string {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `TP${date}${random}`;
  }
}
