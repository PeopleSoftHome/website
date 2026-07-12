import { IsString, IsOptional, IsArray } from 'class-validator';
import { ChatMessage } from '../ai.types';

export class AiChatDto {
  @IsString()
  message!: string;

  @IsOptional()
  @IsArray()
  history?: ChatMessage[];

  @IsOptional()
  @IsString()
  sessionId?: string;
}
