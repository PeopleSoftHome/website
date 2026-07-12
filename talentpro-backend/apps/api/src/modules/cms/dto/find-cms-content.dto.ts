import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '@shared/dto';

export class FindCmsContentDto extends PaginationDto {
  @IsOptional()
  @IsString()
  status?: string;
}
