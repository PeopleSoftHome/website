import { IsOptional, IsString, IsEnum } from 'class-validator';
import { CommentStatus } from '@prisma/client';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class FindAdminCommentsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(CommentStatus)
  status?: CommentStatus;

  @IsOptional()
  @IsString()
  entityType?: string;
}
