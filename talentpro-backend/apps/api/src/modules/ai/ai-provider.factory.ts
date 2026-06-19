import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LlmProvider, LlmProviderConfig } from './ai.types';
import { AiOpenAiService } from './ai-openai.service';

/**
 * LLM 多提供商工厂
 * 根据 AI_PROVIDER 环境变量选择实际提供商实现。
 * 当前已接入：openai
 * 预留接口：azure / anthropic / openrouter
 */
@Injectable()
export class LlmProviderFactory {
  private readonly config: LlmProviderConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly openAiService: AiOpenAiService,
  ) {
    this.config = this.openAiService.getProviderConfig();
  }

  getActiveProvider(): LlmProvider {
    const provider = this.config.provider;

    switch (provider) {
      case 'openai':
        return this.openAiService;
      case 'azure':
      case 'anthropic':
      case 'openrouter':
        // 预留：后续接入对应 SDK 后返回具体实现
        return this.openAiService;
      default:
        return this.openAiService;
    }
  }
}
