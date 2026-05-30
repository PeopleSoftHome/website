import { IsString } from 'class-validator';

export class AiChatStreamDto {
  @IsString()
  message: string;

  @IsString()
  recaptchaToken: string;
}
