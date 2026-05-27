import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiRagService } from './ai-rag.service';
import { AiPromptService } from './ai-prompt.service';
import { AiOpenAiService } from './ai-openai.service';
import { AiController } from './ai.controller';

@Module({
  providers: [AiService, AiRagService, AiPromptService, AiOpenAiService],
  controllers: [AiController],
  exports: [AiService],
})
export class AiModule {}
