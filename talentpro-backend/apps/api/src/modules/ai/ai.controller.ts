import { Controller, Post, Body, Sse, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RecaptchaGuard } from '@/common/guards/recaptcha.guard';
import { Observable } from 'rxjs';
import { AiService } from './ai.service';
import { Public } from '@/common/decorators/public.decorator';
import { AiChatDto } from './dto/ai-chat.dto';
import { AiChatStreamDto } from './dto/ai-chat-stream.dto';

@ApiTags('AI 助手')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @Public()
  @UseGuards(RecaptchaGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'AI 对话（RAG）' })
  async chat(@Body() dto: AiChatDto) {
    return this.aiService.chat(dto.message, dto.history || []);
  }

  @Post('chat-stream')
  @Public()
  @UseGuards(RecaptchaGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'AI 对话流式输出' })
  chatStream(@Body() dto: AiChatStreamDto): Observable<any> {
    return this.aiService.chatStream(dto.message);
  }
}
