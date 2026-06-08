import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PaymentStatus, PaymentProvider, SubscriptionStatus } from '@prisma/client';
import { getSkip, buildPaginatedResponse } from '@/common/helpers/pagination.helper';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (secretKey) {
      this.stripe = new Stripe(secretKey, { apiVersion: '2025-05-28.basil' });
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

    const orderNo = this.generateOrderNo();

    const order = await this.prisma.order.create({
      data: {
        orderNo,
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

    const origin = process.env.FRONTEND_URL || 'http://localhost:3000';

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

    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!endpointSecret) return { received: false };

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } catch {
      return { received: false };
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
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
    if (!order || order.status === PaymentStatus.PAID) return;

    await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: { status: PaymentStatus.PAID, paidAt: new Date(), provider, providerPaymentId },
      }),
      this.prisma.subscription.updateMany({
        where: { workspaceId: order.workspaceId },
        data: { status: SubscriptionStatus.ACTIVE },
      }),
    ]);
  }

  private generateOrderNo(): string {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `TP${date}${random}`;
  }
}
