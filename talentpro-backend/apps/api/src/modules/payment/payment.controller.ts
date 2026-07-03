import { Controller, Get, Post, Body, Param, Query, Headers, RawBody } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { Permission } from '@/common/decorators/permission.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaymentService } from './payment.service';
import { CreateOrderDto, CreateStripeCheckoutDto } from './dto/create-order.dto';
import { CheckoutCartDto } from './dto/checkout-cart.dto';

@ApiTags('支付')
@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

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
}
