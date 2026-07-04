import { IsString, IsOptional, IsArray } from 'class-validator';
import { ChatMessage } from '../ai.types';

export class AiAdminChatDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsArray()
  history?: ChatMessage[];

  @IsOptional()
  context?: Record<string, unknown>;
}
