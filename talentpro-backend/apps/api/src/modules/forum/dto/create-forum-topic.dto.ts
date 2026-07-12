import { IsString, IsOptional } from 'class-validator';

export class CreateForumTopicDto {
  @IsString()
  categoryId!: string;

  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  workspaceId?: string;
}
