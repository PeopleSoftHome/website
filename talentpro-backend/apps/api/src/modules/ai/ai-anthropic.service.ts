import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Subject } from 'rxjs';
import Anthropic from '@anthropic-ai/sdk';
import { ChatMessage, StreamEvent, LlmProvider, LlmProviderConfig } from './ai.types';

/**
 * Anthropic Claude Provider 实现
 */
@Injectable()
export class AiAnthropicService implements LlmProvider {
  readonly name = 'anthropic';
  private readonly logger = new Logger(AiAnthropicService.name);
  private readonly config: LlmProviderConfig;
  private readonly client: Anthropic | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    const baseUrl = this.configService.get<string>('ANTHROPIC_BASE_URL');

    this.config = {
      provider: 'anthropic',
      model: this.configService.get<string>('ANTHROPIC_MODEL') || 'claude-sonnet-4-5-20250929',
      apiKey,
      baseUrl: baseUrl || undefined,
      temperature: Number(this.configService.get<string>('ANTHROPIC_TEMPERATURE') || '0.7'),
      maxTokens: Number(this.configService.get<string>('ANTHROPIC_MAX_TOKENS') || '1024'),
      timeoutMs: Number(this.configService.get<string>('ANTHROPIC_TIMEOUT_MS') || '30000'),
    };

    if (apiKey) {
      this.client = new Anthropic({
        apiKey,
        baseURL: baseUrl || undefined,
        timeout: this.config.timeoutMs,
        maxRetries: 2,
      });
    } else {
      this.logger.warn('ANTHROPIC_API_KEY not configured. Anthropic provider is unavailable.');
    }
  }

  isConfigured(): boolean {
    return !!this.client;
  }

  getProviderConfig(): LlmProviderConfig {
    return { ...this.config };
  }

  async chat(messages: ChatMessage[], overrides?: Partial<LlmProviderConfig>): Promise<{ content: string }> {
    const systemMessage = messages.find((m) => m.role === 'system');
    const nonSystem = messages.filter((m) => m.role !== 'system');
    const lastUser = [...nonSystem].reverse().find((m) => m.role === 'user');
    if (!lastUser) {
      return { content: '' };
    }
    const history = nonSystem.slice(0, nonSystem.indexOf(lastUser));
    return this.callAnthropic(lastUser.content, history, systemMessage?.content || '', overrides);
  }

  private async callAnthropic(
    message: string,
    history: ChatMessage[],
    systemPrompt: string,
    overrides?: Partial<LlmProviderConfig>,
  ) {
    if (!this.client) {
      return { content: '', sources: [] };
    }

    const cfg = { ...this.config, ...overrides };
    const anthropicMessages: Anthropic.MessageParam[] = [
      ...history.map((h) => ({ role: h.role, content: h.content }) as Anthropic.MessageParam),
      { role: 'user', content: message },
    ];

    try {
      const response = await this.client.messages.create({
        model: cfg.model,
        max_tokens: cfg.maxTokens,
        messages: anthropicMessages,
        system: systemPrompt || undefined,
        temperature: cfg.temperature,
      });

      const usage = response.usage;
      if (usage) {
        this.logger.debug(`Anthropic usage: input=${usage.input_tokens}, output=${usage.output_tokens}`);
      }

      const content = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('');

      return { content, sources: [] };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Anthropic chat error: ${msg}`);
      throw new Error(`Anthropic chat error: ${msg}`);
    }
  }

  async moderateContent(): Promise<{ riskScore: number; flags: string[] }> {
    // Anthropic 没有独立的内容审核端点，返回中性结果。
    if (!this.client) {
      return { riskScore: 0, flags: [] };
    }
    this.logger.debug('Anthropic does not expose a moderations endpoint; returning neutral moderation result.');
    return { riskScore: 0, flags: [] };
  }

  async stream(messages: ChatMessage[], subject: Subject<StreamEvent>) {
    if (!this.client) {
      subject.error(new Error('Anthropic not configured'));
      return;
    }

    const systemMessage = messages.find((m) => m.role === 'system');
    const nonSystem = messages.filter((m) => m.role !== 'system');

    try {
      const stream = await this.client.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        messages: nonSystem.map((m) => ({ role: m.role, content: m.content }) as Anthropic.MessageParam),
        system: systemMessage?.content || undefined,
        temperature: this.config.temperature,
        stream: true,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const content = event.delta.text;
          if (content) {
            subject.next({ data: JSON.stringify({ chunk: content }) });
          }
        }
      }

      subject.next({ data: JSON.stringify({ done: true }) });
      subject.complete();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Anthropic stream error: ${msg}`);
      subject.error(err);
    }
  }

  async generateImage(
    prompt: string,
    _options?: { size?: string; quality?: string; style?: string },
  ): Promise<{ url: string; revisedPrompt?: string }> {
    // Anthropic 当前不提供图片生成能力，返回占位图。
    this.logger.warn('Anthropic provider does not support image generation. Returning placeholder.');
    return {
      url: this.configService.get<string>('AI_IMAGE_PLACEHOLDER_URL') || 'https://placehold.co/1024x576?text=AI+Image',
      revisedPrompt: prompt,
    };
  }
}
