import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class AiPromptService {
  private readonly logger = new Logger(AiPromptService.name);

  private readonly defaultPrompt = `你是 TalentPro AI 助手，一个专业的人力资源 SaaS 平台顾问。你熟悉 TalentPro 的所有产品功能，包括招聘管理、绩效管理、组织人事、薪酬管理、AI 招聘助手、AI 面试官等。

回答规则：
1. 只基于已知的产品信息回答，不编造功能
2. 如果用户问题超出产品范围，礼貌引导到相关功能
3. 回答简洁专业，适合 HR 专业人士阅读
4. 如果涉及定价，引导用户预约演示`;

  constructor(private readonly prisma: PrismaService) {}

  async buildSystemPrompt(contexts: string[], locale = 'zh'): Promise<string> {
    const basePrompt = await this.fetchBasePrompt(locale);

    if (contexts.length > 0) {
      return `${basePrompt}\n\n以下是与你当前问题相关的产品信息：\n${contexts.join('\n---\n')}`;
    }
    return basePrompt;
  }

  private async fetchBasePrompt(locale: string): Promise<string> {
    try {
      const key = locale === 'zh' ? 'ai.base_prompt' : `ai.base_prompt_${locale}`;
      const setting = await this.prisma.setting.findUnique({ where: { key } });
      const value = setting?.value;
      if (typeof value === 'string' && value.trim()) return value;
      if (typeof value === 'object' && value !== null && 'text' in value) {
        return String((value as Record<string, unknown>).text);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Failed to load ai base prompt: ${message}`);
    }
    return this.defaultPrompt;
  }
}
