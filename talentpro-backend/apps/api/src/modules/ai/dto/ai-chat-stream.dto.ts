import { IsString, IsOptional, IsArray } from 'class-validator';
import { ChatMessage } from '../ai.types';

export class AiChatStreamDto {
  @IsString()
  message!: string;

  @IsString()
  recaptchaToken!: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsArray()
  history?: ChatMessage[];
}
