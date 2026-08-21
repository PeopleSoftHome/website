import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmProvider, LlmProviderConfig } from './ai.types';
import { AiOpenAiService } from './ai-openai.service';
import { AiAzureOpenAiService } from './ai-azure-openai.service';
import { AiAnthropicService } from './ai-anthropic.service';

export interface ProviderStatus { provider: LlmProviderConfig['provider']; configured: boolean; active: boolean; fallback?: string }

@Injectable()
export class LlmProviderFactory {
  private readonly logger = new Logger(LlmProviderFactory.name);
  private readonly config: LlmProviderConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly openAiService: AiOpenAiService,
    private readonly azureOpenAiService: AiAzureOpenAiService,
    private readonly anthropicService: AiAnthropicService,
  ) { this.config = this.openAiService.getProviderConfig(); }

  getActiveProvider(): LlmProvider {
    const provider = this.config.provider;
    const production = this.configService.get<string>('APP_ENV', 'development') === 'production';
    switch (provider) {
      case 'openai':
        if (!this.openAiService.isConfigured()) throw new ServiceUnavailableException('OpenAI provider is not configured');
        return this.openAiService;
      case 'azure':
        if (this.azureOpenAiService.isConfigured()) return this.azureOpenAiService;
        if (production) throw new ServiceUnavailableException('Azure OpenAI provider is not fully configured');
        this.logger.warn('Azure OpenAI unavailable; falling back to OpenAI in non-production.');
        return this.openAiService;
      case 'anthropic':
        if (this.anthropicService.isConfigured()) return this.anthropicService;
        if (production) throw new ServiceUnavailableException('Anthropic provider is not configured');
        this.logger.warn('Anthropic unavailable; falling back to OpenAI in non-production.');
        return this.openAiService;
      case 'openrouter':
        throw new ServiceUnavailableException('LLM provider "openrouter" is not implemented');
      default:
        throw new ServiceUnavailableException(`Unknown LLM provider "${provider}"`);
    }
  }

  getProviderStatus(): ProviderStatus[] {
    const activeProvider = this.config.provider;
    const providers: { key: LlmProviderConfig['provider']; service: LlmProvider; supported: boolean }[] = [
      { key: 'openai', service: this.openAiService, supported: true },
      { key: 'azure', service: this.azureOpenAiService, supported: true },
      { key: 'anthropic', service: this.anthropicService, supported: true },
      { key: 'openrouter', service: this.openAiService, supported: false },
    ];
    return providers.map((p) => ({ provider: p.key, configured: p.supported && p.service.isConfigured(), active: p.key === activeProvider }));
  }
}
