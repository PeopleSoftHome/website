import { IsString } from 'class-validator';

export class AddFollowUpDto {
  @IsString()
  type: string;

  @IsString()
  content: string;

  @IsString()
  createdBy: string;
}
