import { Controller, Post, Body, Sse, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RecaptchaGuard } from '@/common/guards/recaptcha.guard';
import { Observable } from 'rxjs';
import { AiService } from './ai.service';
import { ChatMessage } from './ai.types';
import { Public } from '@/common/decorators/public.decorator';

@ApiTags('AI 助手')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @Public()
  @UseGuards(RecaptchaGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'AI 对话（RAG）' })
  async chat(@Body() dto: { message: string; history?: ChatMessage[] }) {
    return this.aiService.chat(dto.message, dto.history || []);
  }

  @Sse('chat-stream')
  @Public()
  @UseGuards(RecaptchaGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'AI 对话流式输出' })
  chatStream(@Query('message') message: string): Observable<any> {
    return this.aiService.chatStream(message);
  }
}
