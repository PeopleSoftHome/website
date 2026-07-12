import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmProvider, LlmProviderConfig } from './ai.types';
import { AiOpenAiService } from './ai-openai.service';
import { AiAzureOpenAiService } from './ai-azure-openai.service';
import { AiAnthropicService } from './ai-anthropic.service';

export interface ProviderStatus {
  provider: LlmProviderConfig['provider'];
  configured: boolean;
  active: boolean;
  fallback?: string;
}

/**
 * LLM 多提供商工厂
 * 根据 AI_PROVIDER 环境变量选择实际提供商实现。
 * 已接入：openai / azure / anthropic
 * 未接入：openrouter（显式抛错，避免静默降级导致合规风险）
 */
@Injectable()
export class LlmProviderFactory {
  private readonly logger = new Logger(LlmProviderFactory.name);
  private readonly config: LlmProviderConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly openAiService: AiOpenAiService,
    private readonly azureOpenAiService: AiAzureOpenAiService,
    private readonly anthropicService: AiAnthropicService,
  ) {
    this.config = this.openAiService.getProviderConfig();
  }

  getActiveProvider(): LlmProvider {
    const provider = this.config.provider;

    switch (provider) {
      case 'openai':
        return this.openAiService;
      case 'azure': {
        if (this.azureOpenAiService.isConfigured()) {
          return this.azureOpenAiService;
        }
        this.logger.warn(
          'AI_PROVIDER=azure but Azure OpenAI is not fully configured ' +
            '(AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT are required). ' +
            'Falling back to OpenAI.',
        );
        return this.openAiService;
      }
      case 'anthropic': {
        if (this.anthropicService.isConfigured()) {
          return this.anthropicService;
        }
        this.logger.warn(
          'AI_PROVIDER=anthropic but Anthropic is not configured ' +
            '(ANTHROPIC_API_KEY is required). Falling back to OpenAI.',
        );
        return this.openAiService;
      }
      case 'openrouter':
        throw new Error(
          'LLM provider "openrouter" is configured but not yet implemented. ' +
            'Please set AI_PROVIDER to one of: openai, azure, anthropic.',
        );
      default:
        this.logger.warn(
          `Unknown LLM provider "${provider}". Falling back to OpenAI. ` +
            'Please set AI_PROVIDER to one of: openai, azure, anthropic.',
        );
        return this.openAiService;
    }
  }

  /**
   * 返回所有已知 Provider 的可用性状态，供 Admin 配置页面展示。
   */
  getProviderStatus(): ProviderStatus[] {
    const activeProvider = this.config.provider;
    const providers: { key: LlmProviderConfig['provider']; service: LlmProvider; supported: boolean }[] = [
      { key: 'openai', service: this.openAiService, supported: true },
      { key: 'azure', service: this.azureOpenAiService, supported: true },
      { key: 'anthropic', service: this.anthropicService, supported: true },
      { key: 'openrouter', service: this.openAiService, supported: false },
    ];

    return providers.map((p) => ({
      provider: p.key,
      configured: p.supported && p.service.isConfigured(),
      active: p.key === activeProvider,
      fallback: p.key === activeProvider && p.supported && !p.service.isConfigured() ? 'openai' : undefined,
    }));
  }
}
