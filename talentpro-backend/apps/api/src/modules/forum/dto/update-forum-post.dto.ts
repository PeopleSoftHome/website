import { IsString } from 'class-validator';

export class UpdateForumPostDto {
  @IsString()
  content: string;
}
