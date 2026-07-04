import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RecaptchaGuard } from '@/common/guards/recaptcha.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Observable } from 'rxjs';
import { randomUUID } from 'crypto';
import { AiService } from './ai.service';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { Permission } from '@/common/decorators/permission.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { AiChatDto } from './dto/ai-chat.dto';
import { AiChatStreamDto } from './dto/ai-chat-stream.dto';
import { AiGenerateDto } from './dto/ai-generate.dto';
import { AiGenerateImageDto } from './dto/ai-generate-image.dto';
import { AiAdminChatDto } from './dto/ai-admin-chat.dto';

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
    const sessionId = dto.sessionId || randomUUID();
    const history = dto.history?.length ? dto.history : await this.aiService.loadChatSession(sessionId);
    const result = await this.aiService.chat(dto.message, history);
    await this.aiService.appendChatMessage(sessionId, 'user', dto.message);
    await this.aiService.appendChatMessage(sessionId, 'assistant', result.content);
    return { ...result, sessionId };
  }

  @Post('chat-stream')
  @Public()
  @UseGuards(RecaptchaGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'AI 对话流式输出' })
  chatStream(@Body() dto: AiChatStreamDto): Observable<unknown> {
    const sessionId = dto.sessionId || randomUUID();
    return this.aiService.chatStream(dto.message, dto.history || [], sessionId);
  }

  @Post('generate')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('ai:generate')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'AI 内容生成（博客/产品/SEO/翻译/审核）' })
  async generate(@Body() dto: AiGenerateDto) {
    return this.aiService.generateContent(dto);
  }

  @Post('generate-image')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('ai:generate-image')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'AI 图片生成' })
  async generateImage(
    @Body() dto: AiGenerateImageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.aiService.generateImage({ ...dto, userId });
  }

  @Post('admin/chat')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('ai:chat')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Admin 配置助手对话' })
  async adminChat(@Body() dto: AiAdminChatDto) {
    const sessionId = randomUUID();
    const result = await this.aiService.adminChat(
      dto.message,
      dto.history || [],
      dto.context,
    );
    return { ...result, sessionId };
  }
}
