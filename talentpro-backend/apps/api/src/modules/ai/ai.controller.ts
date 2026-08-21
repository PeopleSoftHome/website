import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RecaptchaGuard, RolesGuard } from '@shared/guards';
import { Observable } from 'rxjs';
import { randomUUID } from 'crypto';
import { AiService } from './ai.service';
import { AiGatewayService } from './ai-gateway.service';
import { AgentDemoService } from './agent-demo.service';
import { Public } from '@shared/decorators/public.decorator';
import { Roles } from '@shared/decorators/roles.decorator';
import { Permission } from '@shared/decorators/permission.decorator';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { UserContext } from '@shared/types';
import { AiChatDto } from './dto/ai-chat.dto';
import { AiChatStreamDto } from './dto/ai-chat-stream.dto';
import { AiGenerateDto } from './dto/ai-generate.dto';
import { AiGenerateImageDto } from './dto/ai-generate-image.dto';
import { AiAdminChatDto } from './dto/ai-admin-chat.dto';

@ApiTags('AI 助手')
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly aiGateway: AiGatewayService,
    private readonly agentDemo: AgentDemoService,
  ) {}

  @Post('agent/demo')
  @Public()
  @Throttle({ default: { limit: 12, ttl: 60000 } })
  @ApiOperation({ summary: '真实 AI Agent 产品演示（Gateway → Tool → Workspace scope → Action）' })
  async agentDemoRun(@Body() body: { promptId?: string; apply?: boolean; locale?: string }) {
    return this.agentDemo.run(body || {});
  }

  @Post('agent/demo/approve')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('ai:demo:action')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: '审批并执行 Agent Demo action' })
  async approveAgentDemo(@Body() body: { approvalId: string }, @CurrentUser() user: UserContext) {
    return this.agentDemo.approve(body.approvalId, user);
  }

  @Post('gateway/chat')
  @Public()
  @UseGuards(RecaptchaGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'AI Gateway 对话（quota + distributed BullMQ + provider facade）' })
  async gatewayChat(@Body() dto: AiChatDto, @Req() req: { ip?: string }) {
    const subject = req.ip || 'anonymous';
    return this.aiGateway.chat({ subject, message: dto.message, history: dto.history, locale: dto.locale });
  }

  @Get('gateway/status')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('ai:generate')
  @ApiOperation({ summary: 'AI Gateway 队列与容量状态' })
  gatewayStatus() { return this.aiGateway.getStatus(); }

  @Post('chat')
  @Public()
  @UseGuards(RecaptchaGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'AI 对话（RAG）' })
  async chat(@Body() dto: AiChatDto) {
    const sessionId = dto.sessionId || randomUUID();
    const history = dto.history?.length ? dto.history : await this.aiService.loadChatSession(sessionId);
    const result = await this.aiService.chat(dto.message, history, dto.locale || 'zh');
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
  async generate(@Body() dto: AiGenerateDto) { return this.aiService.generateContent(dto); }

  @Post('generate-image')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('ai:generate')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'AI 图片生成' })
  async generateImage(@Body() dto: AiGenerateImageDto) { return this.aiService.generateImage(dto); }

  @Post('admin-chat')
  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Permission('ai:chat')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Admin AI 对话' })
  async adminChat(@Body() dto: AiAdminChatDto) { return this.aiService.adminChat(dto); }
}
