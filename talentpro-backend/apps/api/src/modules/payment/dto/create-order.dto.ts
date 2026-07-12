import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { PaymentProvider } from '@prisma/client';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  appId!: string;

  @IsString()
  @IsNotEmpty()
  tierName!: string;

  @IsString()
  @IsOptional()
  interval?: string; // 'month' | 'year'

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(PaymentProvider)
  @IsOptional()
  provider?: PaymentProvider;
}

export class CreateStripeCheckoutDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsString()
  @IsOptional()
  successUrl?: string;

  @IsString()
  @IsOptional()
  cancelUrl?: string;
}
