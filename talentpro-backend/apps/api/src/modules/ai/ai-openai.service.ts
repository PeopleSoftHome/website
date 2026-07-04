import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Subject } from 'rxjs';
import OpenAI from 'openai';
import { ChatMessage, StreamEvent, LlmProvider, LlmProviderConfig } from './ai.types';

@Injectable()
export class AiOpenAiService implements LlmProvider {
  readonly name = 'openai';
  private readonly logger = new Logger(AiOpenAiService.name);
  private readonly config: LlmProviderConfig;
  private readonly client: OpenAI | null = null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.config = {
      provider: 'openai',
      model: this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini',
      apiKey,
      baseUrl: this.configService.get<string>('OPENAI_BASE_URL'),
      temperature: Number(this.configService.get<string>('OPENAI_TEMPERATURE') || '0.7'),
      maxTokens: Number(this.configService.get<string>('OPENAI_MAX_TOKENS') || '800'),
      timeoutMs: Number(this.configService.get<string>('OPENAI_TIMEOUT_MS') || '30000'),
    };

    if (apiKey) {
      this.client = new OpenAI({
        apiKey,
        baseURL: this.config.baseUrl || undefined,
        timeout: this.config.timeoutMs,
        maxRetries: 2,
      });
    } else {
      this.logger.warn('OPENAI_API_KEY not configured. AI chat will use rule-based fallback.');
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
    return this.callOpenAI(lastUser.content, history, systemMessage?.content || '', overrides);
  }

  async callOpenAI(message: string, history: ChatMessage[], systemPrompt: string, overrides?: Partial<LlmProviderConfig>) {
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
        this.logger.debug(`OpenAI usage: prompt=${usage.prompt_tokens}, completion=${usage.completion_tokens}`);
      }

      return {
        content: completion.choices?.[0]?.message?.content || '',
        sources: [],
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`OpenAI chat error: ${message}`);
      throw new Error(`OpenAI chat error: ${message}`);
    }
  }

  async moderateContent(content: string): Promise<{ riskScore: number; flags: string[] }> {
    if (!this.client) {
      return { riskScore: 0, flags: [] };
    }

    try {
      const moderation = await this.client.moderations.create({
        input: content,
        model: 'text-moderation-latest',
      });

      const result = moderation.results?.[0];
      if (!result) {
        return { riskScore: 0, flags: [] };
      }

      const flags = Object.entries(result.categories)
        .filter(([, flagged]) => flagged)
        .map(([category]) => category);
      const scores = Object.values(result.category_scores).map((s) => Number(s) || 0);
      const riskScore = scores.length > 0 ? Math.max(0, ...scores) : 0;

      return { riskScore, flags };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Moderation request failed: ${message}`);
      return { riskScore: 0, flags: [] };
    }
  }

  async stream(messages: ChatMessage[], subject: Subject<StreamEvent>) {
    if (!this.client) {
      subject.error(new Error('OpenAI not configured'));
      return;
    }

    try {
      const stream = await this.client.chat.completions.create({
        model: this.config.model,
        messages: messages.map((m) => ({ role: m.role, content: m.content }) as OpenAI.Chat.ChatCompletionMessageParam),
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
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Stream error: ${message}`);
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

    const model = this.configService.get<string>('OPENAI_IMAGE_MODEL') || 'dall-e-3';
    const size = options?.size || this.configService.get<string>('OPENAI_IMAGE_SIZE') || '1024x1024';
    const quality = options?.quality || this.configService.get<string>('OPENAI_IMAGE_QUALITY') || 'standard';
    const style = options?.style || this.configService.get<string>('OPENAI_IMAGE_STYLE') || 'vivid';

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
        throw new Error('OpenAI image generation returned no URL');
      }

      return {
        url: image.url,
        revisedPrompt: image.revised_prompt || prompt,
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`OpenAI image generation error: ${message}`);
      throw new Error(`OpenAI image generation error: ${message}`);
    }
  }
}
