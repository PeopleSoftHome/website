import { IsArray, IsEnum, IsString } from 'class-validator';
import { CommentStatus } from '@prisma/client';

export class BatchModerateCommentsDto {
  @IsArray()
  @IsString({ each: true })
  ids!: string[];

  @IsEnum(CommentStatus)
  status!: CommentStatus;
}
