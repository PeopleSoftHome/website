import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InvoiceDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsString()
  taxNo?: string;
}
