import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateExperimentDto {
  @IsString()
  key!: string;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  variantA!: Record<string, unknown>;

  variantB!: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  trafficSplit?: number;
}
