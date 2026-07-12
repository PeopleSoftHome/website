import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Subject } from 'rxjs';
import { AzureOpenAI, OpenAI } from 'openai';
import { ChatMessage, StreamEvent, LlmProvider, LlmProviderConfig } from './ai.types';

/**
 * Azure OpenAI Provider 实现
 * 通过 OPENAI SDK 的 AzureOpenAI 客户端访问 Azure OpenAI Service。
 */
@Injectable()
export class AiAzureOpenAiService implements LlmProvider {
  readonly name = 'azure';
  private readonly logger = new Logger(AiAzureOpenAiService.name);
  private readonly config: LlmProviderConfig;
  private readonly client: AzureOpenAI | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('AZURE_OPENAI_API_KEY');
    const endpoint = this.configService.get<string>('AZURE_OPENAI_ENDPOINT');
    const apiVersion = this.configService.get<string>('AZURE_OPENAI_API_VERSION') || '2024-10-21';
    const deployment = this.configService.get<string>('AZURE_OPENAI_DEPLOYMENT');

    this.config = {
      provider: 'azure',
      model: this.configService.get<string>('AZURE_OPENAI_MODEL') || deployment || 'gpt-4o-mini',
      apiKey,
      baseUrl: endpoint,
      temperature: Number(this.configService.get<string>('AZURE_OPENAI_TEMPERATURE') || '0.7'),
      maxTokens: Number(this.configService.get<string>('AZURE_OPENAI_MAX_TOKENS') || '800'),
      timeoutMs: Number(this.configService.get<string>('AZURE_OPENAI_TIMEOUT_MS') || '30000'),
    };

    if (apiKey && endpoint) {
      this.client = new AzureOpenAI({
        apiKey,
        endpoint,
        apiVersion,
        deployment,
        timeout: this.config.timeoutMs,
        maxRetries: 2,
      });
    } else {
      this.logger.warn(
        'AZURE_OPENAI_API_KEY or AZURE_OPENAI_ENDPOINT not configured. Azure OpenAI provider is unavailable.',
      );
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
    return this.callAzureOpenAI(lastUser.content, history, systemMessage?.content || '', overrides);
  }

  private async callAzureOpenAI(
    message: string,
    history: ChatMessage[],
    systemPrompt: string,
    overrides?: Partial<LlmProviderConfig>,
  ) {
    if (!this.client) {
      return { content: '', sources: [] };
    }

    const cfg = { ...this.config, ...overrides };

    try {
      const completion = await this.client.chat.completions.create({
        model: cfg.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.map((h) => ({ role: h.role, content: h.content }) as OpenAI.Chat.ChatCompletionMessageParam),
          { role: 'user', content: message },
        ],
        temperature: cfg.temperature,
        max_tokens: cfg.maxTokens,
      });

      const usage = completion.usage;
      if (usage) {
        this.logger.debug(`Azure OpenAI usage: prompt=${usage.prompt_tokens}, completion=${usage.completion_tokens}`);
      }

      return {
        content: completion.choices?.[0]?.message?.content || '',
        sources: [],
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Azure OpenAI chat error: ${msg}`);
      throw new Error(`Azure OpenAI chat error: ${msg}`);
    }
  }

  async moderateContent(_content: string): Promise<{ riskScore: number; flags: string[] }> {
    // Azure OpenAI Service 没有与 OpenAI 对齐的 moderations 端点，返回中性结果。
    // 如需内容审核，建议结合 Azure Content Safety 服务。
    if (!this.client) {
      return { riskScore: 0, flags: [] };
    }
    this.logger.debug('Azure OpenAI does not expose a moderations endpoint; returning neutral moderation result.');
    return { riskScore: 0, flags: [] };
  }

  async stream(messages: ChatMessage[], subject: Subject<StreamEvent>) {
    if (!this.client) {
      subject.error(new Error('Azure OpenAI not configured'));
      return;
    }

    try {
      const stream = await this.client.chat.completions.create({
        model: this.config.model,
        messages: messages.map(
          (m) => ({ role: m.role, content: m.content }) as OpenAI.Chat.ChatCompletionMessageParam,
        ),
        stream: true,
        max_tokens: this.config.maxTokens,
      });

      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content || '';
        if (content) {
          subject.next({ data: JSON.stringify({ chunk: content }) });
        }
      }

      subject.next({ data: JSON.stringify({ done: true }) });
      subject.complete();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Azure OpenAI stream error: ${msg}`);
      subject.error(err);
    }
  }

  async generateImage(
    prompt: string,
    options?: { size?: string; quality?: string; style?: string },
  ): Promise<{ url: string; revisedPrompt?: string }> {
    if (!this.client) {
      return {
        url: this.configService.get<string>('AI_IMAGE_PLACEHOLDER_URL') || 'https://placehold.co/1024x576?text=AI+Image',
        revisedPrompt: prompt,
      };
    }

    const model = this.configService.get<string>('AZURE_OPENAI_IMAGE_DEPLOYMENT') || 'dall-e-3';
    const size = options?.size || this.configService.get<string>('AZURE_OPENAI_IMAGE_SIZE') || '1024x1024';
    const quality = options?.quality || this.configService.get<string>('AZURE_OPENAI_IMAGE_QUALITY') || 'standard';
    const style = options?.style || this.configService.get<string>('AZURE_OPENAI_IMAGE_STYLE') || 'vivid';

    try {
      const response = await this.client.images.generate({
        model,
        prompt,
        n: 1,
        size,
        quality: quality as 'standard' | 'hd' | 'auto' | 'low' | 'medium' | 'high' | undefined,
        style: style as 'vivid' | 'natural' | undefined,
        response_format: 'url',
      });

      const image = response.data?.[0];
      if (!image?.url) {
        throw new Error('Azure OpenAI image generation returned no URL');
      }

      return {
        url: image.url,
        revisedPrompt: image.revised_prompt || prompt,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Azure OpenAI image generation error: ${msg}`);
      throw new Error(`Azure OpenAI image generation error: ${msg}`);
    }
  }
}
