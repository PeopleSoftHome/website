import { IsString } from 'class-validator';

export class TestModerationDto {
  @IsString()
  content!: string;
}
