import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import type Redis from 'ioredis';
import type { Cluster } from 'ioredis';
import { Inject } from '@nestjs/common';
import { REDIS_CLIENT } from '@shared/redis/redis.module';

interface AgentActionJob {
  actionKey: string;
  action: Record<string, unknown>;
}

@Processor('agent-actions', { concurrency: 2 })
export class AgentActionProcessor extends WorkerHost {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis | Cluster) {
    super();
  }

  async process(job: Job<AgentActionJob>) {
    if (job.name !== 'apply-workforce-action') {
      throw new Error(`Unsupported agent action: ${job.name}`);
    }

    const result = {
      ...job.data.action,
      status: 'completed',
      executedAt: new Date().toISOString(),
      execution: {
        worker: 'agent-action-processor',
        effect: 'demo-workspace workflow action applied',
      },
    };
    await this.redis.set(job.data.actionKey, JSON.stringify(result), 'EX', 86_400);
    return result;
  }
}
