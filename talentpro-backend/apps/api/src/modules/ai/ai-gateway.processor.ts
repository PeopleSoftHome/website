import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { AiService } from './ai.service';
import type { AiGatewayChatJob } from './ai-gateway.service';

@Processor('ai-gateway', { concurrency: Number(process.env.AI_GATEWAY_CONCURRENCY || 4) })
export class AiGatewayProcessor extends WorkerHost {
  constructor(private readonly ai: AiService) {
    super();
  }

  async process(job: Job<AiGatewayChatJob>) {
    if (job.name !== 'chat') {
      throw new Error(`Unsupported AI gateway job: ${job.name}`);
    }

    return this.ai.chat(
      job.data.message,
      job.data.history || [],
      job.data.locale || 'zh',
    );
  }
}
