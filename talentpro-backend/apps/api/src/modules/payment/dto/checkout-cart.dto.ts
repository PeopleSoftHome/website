import { IsArray, IsString, IsNotEmpty, IsOptional, IsNumber, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CheckoutCartItemDto {
  @IsString()
  @IsNotEmpty()
  appId: string;

  @IsString()
  @IsNotEmpty()
  tierName: string;

  @IsString()
  @IsOptional()
  interval?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @Min(1)
  quantity?: number;
}

export class CheckoutCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutCartItemDto)
  items: CheckoutCartItemDto[];
}
