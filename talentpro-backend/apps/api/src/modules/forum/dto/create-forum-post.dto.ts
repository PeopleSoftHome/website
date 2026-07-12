import { IsString, IsOptional } from 'class-validator';

export class CreateForumPostDto {
  @IsString()
  topicId!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  workspaceId?: string;
}
