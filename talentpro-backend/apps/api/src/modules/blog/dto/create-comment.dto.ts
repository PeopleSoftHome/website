import { IsString, IsOptional } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  entityType: string;

  @IsString()
  entityId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  workspaceId?: string;
}
