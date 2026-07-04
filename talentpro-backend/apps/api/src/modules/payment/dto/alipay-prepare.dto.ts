import { IsNotEmpty, IsString } from 'class-validator';

export class AlipayPrepareDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;
}
