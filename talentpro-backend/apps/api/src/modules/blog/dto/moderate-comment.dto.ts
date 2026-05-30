import { IsEnum } from 'class-validator';
import { CommentStatus } from '@prisma/client';

export class ModerateCommentDto {
  @IsEnum(CommentStatus)
  status: CommentStatus;
}
