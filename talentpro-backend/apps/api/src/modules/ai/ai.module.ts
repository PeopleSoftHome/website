import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiRagService } from './ai-rag.service';
import { AiEmbeddingService } from './ai-embedding.service';
import { AiPromptService } from './ai-prompt.service';
import { AiOpenAiService } from './ai-openai.service';
import { AiAzureOpenAiService } from './ai-azure-openai.service';
import { AiAnthropicService } from './ai-anthropic.service';
import { LlmProviderFactory } from './ai-provider.factory';
import { AiController } from './ai.controller';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  providers: [
    AiService,
    AiRagService,
    AiEmbeddingService,
    AiPromptService,
    AiOpenAiService,
    AiAzureOpenAiService,
    AiAnthropicService,
    LlmProviderFactory,
  ],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
