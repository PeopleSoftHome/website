import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/common/prisma/prisma.service';
import { PaymentProvider, PaymentStatus } from '@prisma/client';
import crypto from 'crypto';

@Injectable()
export class AlipayService {
  private readonly logger = new Logger(AlipayService.name);

  private appId?: string;
  private privateKey?: string;
  private publicKey?: string;
  private gateway: string;
  private sandbox: boolean;
  private mock: boolean;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.appId = this.config.get<string>('ALIPAY_APP_ID') || undefined;
    this.privateKey = this.config.get<string>('ALIPAY_PRIVATE_KEY') || undefined;
    this.publicKey = this.config.get<string>('ALIPAY_PUBLIC_KEY') || undefined;
    this.gateway = this.config.get<string>('ALIPAY_GATEWAY') || 'https://openapi.alipay.com/gateway.do';
    this.sandbox = this.config.get<string>('ALIPAY_SANDBOX') === 'true';
    this.mock = this.config.get<string>('ALIPAY_MOCK') === 'true';
  }

  private get origin(): string {
    return this.config.get<string>('app.frontendUrl', 'http://localhost:3000');
  }

  private isConfigured(): boolean {
    return Boolean(this.appId && this.privateKey && this.publicKey);
  }

  async prepareOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Order status does not allow payment');
    }

    if (!this.isConfigured() || this.mock) {
      const providerPaymentId = `alipay_mock_${orderId}`;
      await this.prisma.order.update({
        where: { id: orderId },
        data: { provider: PaymentProvider.ALIPAY, providerPaymentId },
      });
      return {
        orderId,
        qrCode: undefined as string | undefined,
        paymentUrl: `${this.origin}/marketplace/payment/alipay-mock?order_id=${orderId}`,
        providerPaymentId,
      };
    }

    const providerPaymentId = `alipay_${this.generateNonce(16)}`;
    await this.prisma.order.update({
      where: { id: orderId },
      data: { provider: PaymentProvider.ALIPAY, providerPaymentId },
    });

    const returnUrl = `${this.origin}/marketplace/payment/success`;
    const notifyUrl = `${this.origin}/api/v1/payments/alipay/notify`;
    const bizContent = JSON.stringify({
      out_trade_no: order.orderNo,
      total_amount: order.total.toFixed(2),
      subject: `TalentPro 应用订阅 #${order.orderNo}`,
      product_code: 'FAST_INSTANT_TRADE_PAY',
    });

    const params: Record<string, string> = {
      app_id: this.appId!,
      method: 'alipay.trade.page.pay',
      format: 'JSON',
      return_url: returnUrl,
      notify_url: notifyUrl,
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
      version: '1.0',
      biz_content: bizContent,
    };
    params.sign = this.sign(params);

    const query = new URLSearchParams(params).toString();
    const gateway = this.sandbox ? 'https://openapi.alipaydev.com/gateway.do' : this.gateway;

    return {
      orderId,
      qrCode: undefined as string | undefined,
      paymentUrl: `${gateway}?${query}`,
      providerPaymentId,
    };
  }

  handleNotify(params: Record<string, unknown>) {
    if (!this.isConfigured() || this.mock) {
      const tradeStatus = String(params.trade_status || '');
      const providerPaymentId = String(params.out_trade_no || params.providerPaymentId || '');
      if (tradeStatus === 'TRADE_SUCCESS' && providerPaymentId.startsWith('alipay_mock_')) {
        return { verified: true, providerPaymentId };
      }
      return { verified: false };
    }

    const sign = String(params.sign || '');
    const signType = String(params.sign_type || 'RSA2');
    const verifyParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(params)) {
      if (key === 'sign' || key === 'sign_type' || value === undefined || value === null || value === '') continue;
      verifyParams[key] = String(value);
    }

    const payload = this.buildSignedString(verifyParams);
    const algorithm = signType === 'RSA2' ? 'RSA-SHA256' : 'RSA-SHA1';
    const verifier = crypto.createVerify(algorithm);
    verifier.update(payload, 'utf8');

    const verified = verifier.verify(
      this.formatKey(this.publicKey!, 'PUBLIC'),
      sign,
      'base64',
    );

    if (!verified) {
      this.logger.warn('Alipay notify signature verification failed');
      return { verified: false };
    }

    const providerPaymentId = String(params.out_trade_no || '');
    return { verified: true, providerPaymentId };
  }

  async verifyMockPayment(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { subscription: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.provider !== PaymentProvider.ALIPAY) {
      throw new BadRequestException('Order is not an Alipay order');
    }
    if (!order.providerPaymentId?.startsWith('alipay_mock_')) {
      throw new BadRequestException('Only Alipay mock orders can be verified');
    }
    if (order.status === PaymentStatus.COMPLETED) {
      return order;
    }

    const updateSubscriptionOps = [];
    if (order.subscriptionId && order.subscription) {
      updateSubscriptionOps.push(
        this.prisma.subscription.update({
          where: { id: order.subscriptionId },
          data: {
            status: 'ACTIVE' as const,
            provider: PaymentProvider.ALIPAY,
            providerSubId: order.providerPaymentId,
            currentPeriodStart: new Date(),
            currentPeriodEnd: this.calculatePeriodEnd(order.subscription.interval || 'month'),
          },
        }),
      );
    }

    const [updatedOrder] = await this.prisma.$transaction([
      this.prisma.order.update({
        where: { id: orderId },
        data: { status: PaymentStatus.COMPLETED, paidAt: new Date() },
      }),
      ...updateSubscriptionOps,
    ]);

    return updatedOrder;
  }

  private sign(params: Record<string, string>): string {
    const payload = this.buildSignedString(params);
    const signer = crypto.createSign('RSA-SHA256');
    signer.update(payload, 'utf8');
    return signer.sign(this.formatKey(this.privateKey!, 'PRIVATE'), 'base64');
  }

  private buildSignedString(params: Record<string, string>): string {
    return Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&');
  }

  private formatKey(key: string, type: 'PUBLIC' | 'PRIVATE'): string {
    const trimmed = key.replace(/-----BEGIN [^\n]+-----/g, '').replace(/-----END [^\n]+-----/g, '').replace(/\s+/g, '');
    const header = `-----BEGIN ${type === 'PUBLIC' ? 'PUBLIC' : 'RSA PRIVATE'} KEY-----`;
    const footer = `-----END ${type === 'PUBLIC' ? 'PUBLIC' : 'RSA PRIVATE'} KEY-----`;
    const chunks = trimmed.match(/.{1,64}/g) || [];
    return [header, ...chunks, footer].join('\n');
  }

  private generateNonce(length: number): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }

  private calculatePeriodEnd(interval: string): Date {
    const now = new Date();
    if (interval === 'year') {
      return new Date(now.setFullYear(now.getFullYear() + 1));
    }
    return new Date(now.setMonth(now.getMonth() + 1));
  }
}
