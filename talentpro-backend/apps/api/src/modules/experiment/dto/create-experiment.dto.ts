import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateExperimentDto {
  @IsString()
  key: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  variantA: any;

  variantB: any;

  @IsOptional()
  @IsNumber()
  trafficSplit?: number;
}
