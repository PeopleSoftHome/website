import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Permission } from '@/common/decorators/permission.decorator';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto';

@ApiTags('购物车')
@Controller('cart')
@ApiBearerAuth()
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: '获取购物车' })
  getCart(@CurrentUser('id') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @Permission('cart:manage')
  @ApiOperation({ summary: '添加商品到购物车' })
  addItem(@CurrentUser('id') userId: string, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(userId, dto);
  }

  @Post('items/:appId')
  @Permission('cart:manage')
  @ApiOperation({ summary: '更新购物车商品数量' })
  updateItem(
    @CurrentUser('id') userId: string,
    @Param('appId') appId: string,
    @Query('tier') tierName: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(userId, appId, tierName, dto.quantity);
  }

  @Delete('items/:appId')
  @Permission('cart:manage')
  @ApiOperation({ summary: '移除购物车商品' })
  removeItem(
    @CurrentUser('id') userId: string,
    @Param('appId') appId: string,
    @Query('tier') tierName: string,
  ) {
    return this.cartService.removeItem(userId, appId, tierName);
  }

  @Delete()
  @Permission('cart:manage')
  @ApiOperation({ summary: '清空购物车' })
  clearCart(@CurrentUser('id') userId: string) {
    return this.cartService.clearCart(userId);
  }
}
