import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AiService } from './ai.service';
import { AiGatewayService } from './ai-gateway.service';
import { AiGatewayProcessor } from './ai-gateway.processor';
import { AgentActionProcessor } from './agent-action.processor';
import { AgentDemoService } from './agent-demo.service';
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
  imports: [
    MediaModule,
    BullModule.registerQueue(
      {
        name: 'ai-gateway',
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 500 },
          removeOnComplete: { age: 3600, count: 1000 },
          removeOnFail: { age: 86_400, count: 1000 },
        },
      },
      {
        name: 'agent-actions',
        defaultJobOptions: {
          attempts: 2,
          backoff: { type: 'exponential', delay: 250 },
          removeOnComplete: { age: 86_400, count: 5000 },
          removeOnFail: { age: 7 * 86_400, count: 5000 },
        },
      },
    ),
  ],
  providers: [
    AiService,
    AiGatewayService,
    AiGatewayProcessor,
    AgentActionProcessor,
    AgentDemoService,
    AiRagService,
    AiEmbeddingService,
    AiPromptService,
    AiOpenAiService,
    AiAzureOpenAiService,
    AiAnthropicService,
    LlmProviderFactory,
  ],
  controllers: [AiController],
  exports: [AiService, AiGatewayService],
})
export class AiModule {}
