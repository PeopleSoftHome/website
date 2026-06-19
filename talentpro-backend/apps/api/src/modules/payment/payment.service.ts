import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PaymentStatus, PaymentProvider, SubscriptionStatus } from '@prisma/client';
import { getSkip, buildPaginatedResponse } from '@/common/helpers/pagination.helper';
import Stripe from 'stripe';
import type { Stripe as StripeTypes } from 'stripe/cjs/stripe.core.js';

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
  }) {
    const app = await this.prisma.app.findUnique({ where: { id: dto.appId } });
    if (!app) throw new NotFoundException('应用不存在');

    const tier = this.findPricingTier(app.pricingTiers, dto.tierName);
    if (!tier) throw new BadRequestException('指定的订阅套餐不存在');

    const interval = dto.interval || 'month';
    const expectedAmount = tier.price?.[interval] ?? tier.price;
    if (expectedAmount === undefined) {
      throw new BadRequestException('指定周期暂无价格');
    }
    if (Math.abs(expectedAmount - dto.amount) > 0.01) {
      throw new BadRequestException('订单金额与套餐价格不一致');
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
    if (!order) throw new NotFoundException('订单不存在');
    return order;
  }

  // ─── Stripe ───

  async createStripeCheckout(orderId: string, successUrl?: string, cancelUrl?: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe 未配置');
    }

    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('订单不存在');
    if (order.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('订单状态不允许支付');
    }

    const origin = this.config.get<string>('app.frontendUrl', 'http://localhost:3000');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: order.currency.toLowerCase(),
            product_data: { name: `TalentPro 应用订阅 #${order.orderNo}` },
            unit_amount: Math.round(order.total * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${origin}/marketplace/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: cancelUrl || `${origin}/marketplace/payment/cancel?order_id=${order.id}`,
      metadata: { orderId: order.id },
    });

    await this.prisma.order.update({
      where: { id: orderId },
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
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await this.confirmOrderPayment(orderId, PaymentProvider.STRIPE, session.id);
      }
    }

    return { received: true };
  }

  // ─── Helpers ───

  private async confirmOrderPayment(orderId: string, provider: PaymentProvider, providerPaymentId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.status === PaymentStatus.COMPLETED) return;

    const updateSubscriptionOps = [];
    if (order.subscriptionId) {
      updateSubscriptionOps.push(
        this.prisma.subscription.update({
          where: { id: order.subscriptionId },
          data: {
            status: SubscriptionStatus.ACTIVE,
            provider,
            providerSubId: providerPaymentId,
            currentPeriodStart: new Date(),
            currentPeriodEnd: this.calculatePeriodEnd(order.interval || 'month'),
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
