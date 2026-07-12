import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@shared/dto';

export class FindTranslationListDto extends PaginationDto {
  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsString()
  context?: string;
}
