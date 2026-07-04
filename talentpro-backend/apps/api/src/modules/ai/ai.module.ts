import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiRagService } from './ai-rag.service';
import { AiPromptService } from './ai-prompt.service';
import { AiOpenAiService } from './ai-openai.service';
import { LlmProviderFactory } from './ai-provider.factory';
import { AiController } from './ai.controller';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [MediaModule],
  providers: [AiService, AiRagService, AiPromptService, AiOpenAiService, LlmProviderFactory],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
