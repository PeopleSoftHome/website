import { Controller, Get, Post, Patch, Body, Param, Query, Headers, RawBody, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '@shared/decorators/public.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@shared/decorators/roles.decorator';
import { Permission } from '@shared/decorators/permission.decorator';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaymentService } from './payment.service';
import { AlipayService } from './alipay.service';
import { CreateOrderDto, CreateStripeCheckoutDto } from './dto/create-order.dto';
import { CheckoutCartDto } from './dto/checkout-cart.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { InvoiceDto } from './dto/invoice.dto';
import { AlipayPrepareDto } from './dto/alipay-prepare.dto';
import { PaymentStatus, PaymentProvider } from '@prisma/client';

@ApiTags('支付')
@Controller('payments')
export class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private alipayService: AlipayService,
  ) {}

  // ─── Orders ───

  @Post('orders')
  @ApiBearerAuth()
  @Permission('payment:manage')
  @ApiOperation({ summary: '创建订单' })
  createOrder(
    @CurrentUser('id') userId: string,
    @CurrentUser() user: { workspaceId: string },
    @Body() dto: CreateOrderDto,
  ) {
    return this.paymentService.createOrder(userId, user.workspaceId, dto);
  }

  @Post('cart/checkout')
  @ApiBearerAuth()
  @Permission('payment:manage')
  @ApiOperation({ summary: '购物车结算' })
  checkoutCart(
    @CurrentUser('id') userId: string,
    @CurrentUser() user: { workspaceId: string },
    @Body() dto: CheckoutCartDto,
  ) {
    return this.paymentService.checkoutCart(userId, user.workspaceId, dto.items);
  }

  @Get('orders')
  @ApiBearerAuth()
  @ApiOperation({ summary: '我的订单列表' })
  findOrders(
    @CurrentUser('id') userId: string,
    @CurrentUser() user: { workspaceId: string },
    @Query() pagination: PaginationDto,
  ) {
    return this.paymentService.findOrders(userId, user.workspaceId, pagination.page, pagination.pageSize);
  }

  @Get('orders/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '订单详情' })
  findOrder(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.paymentService.findOrderById(userId, id);
  }

  @Post('orders/:id/cancel')
  @ApiBearerAuth()
  @Permission('payment:manage')
  @ApiOperation({ summary: '取消订单' })
  cancelOrder(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.paymentService.cancelOrder(userId, id);
  }

  @Post('orders/:id/invoice')
  @ApiBearerAuth()
  @Permission('payment:manage')
  @ApiOperation({ summary: '申请发票' })
  requestInvoice(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: InvoiceDto,
  ) {
    return this.paymentService.requestInvoice(userId, id, dto);
  }

  // ─── Subscriptions ───

  @Get('subscriptions')
  @ApiBearerAuth()
  @ApiOperation({ summary: '我的订阅列表' })
  findSubscriptions(
    @CurrentUser('id') userId: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    return this.paymentService.findSubscriptions(userId, user.workspaceId);
  }

  // ─── Stripe ───

  @Post('stripe/checkout')
  @ApiBearerAuth()
  @Permission('payment:manage')
  @ApiOperation({ summary: '创建 Stripe Checkout' })
  createStripeCheckout(@Body() dto: CreateStripeCheckoutDto) {
    return this.paymentService.createStripeCheckout(dto.orderId, dto.successUrl, dto.cancelUrl);
  }

  @Post('stripe/webhook')
  @Public()
  @ApiOperation({ summary: 'Stripe Webhook' })
  handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @RawBody() payload: Buffer,
  ) {
    return this.paymentService.handleStripeWebhook(signature, payload);
  }

  // ─── Alipay ───

  @Post('alipay/prepare')
  @ApiBearerAuth()
  @Permission('payment:manage')
  @ApiOperation({ summary: '准备支付宝订单' })
  prepareAlipay(@Body() dto: AlipayPrepareDto) {
    return this.alipayService.prepareOrder(dto.orderId);
  }

  @Post('alipay/notify')
  @Public()
  @ApiOperation({ summary: '支付宝异步通知' })
  handleAlipayNotify(@Body() payload: Record<string, unknown>) {
    return this.alipayService.handleNotify(payload);
  }

  @Post('alipay/mock/verify')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '标记支付宝 Mock 订单为已支付' })
  verifyAlipayMockPayment(@Body('orderId') orderId: string) {
    return this.alipayService.verifyMockPayment(orderId);
  }

  // ─── Analytics ───

  @Get('analytics/revenue')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: '收入分析（Admin）' })
  @ApiQuery({ name: 'days', required: false })
  getRevenueAnalytics(@Query('days') days?: string) {
    return this.paymentService.getRevenueAnalytics(days ? Number(days) || 30 : 30);
  }

  // ─── Admin Orders ───

  @Get('admin/marketplace/orders')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin 订单列表' })
  @ApiQuery({ name: 'status', required: false, enum: PaymentStatus })
  @ApiQuery({ name: 'provider', required: false, enum: PaymentProvider })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  findOrdersAdmin(
    @Query() pagination: PaginationDto,
    @Query('status') status?: PaymentStatus,
    @Query('provider') provider?: PaymentProvider,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentService.findOrdersAdmin({
      status,
      provider,
      startDate,
      endDate,
      page: pagination.page,
      pageSize: pagination.pageSize,
    });
  }

  @Patch('admin/marketplace/orders/:id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin 更新订单状态' })
  updateOrderStatusAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.paymentService.updateOrderStatusAdmin(id, dto.status, dto.reason);
  }

  @Patch('admin/marketplace/orders/:id/invoice')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin 标记发票信息' })
  updateInvoiceAdmin(
    @Param('id') id: string,
    @Body() dto: InvoiceDto,
  ) {
    return this.paymentService.updateInvoiceAdmin(id, dto);
  }
}
