import { Inject, Injectable, TooManyRequestsException, RequestTimeoutException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import type { Job, Queue } from 'bullmq';
import type Redis from 'ioredis';
import type { Cluster } from 'ioredis';
import { AiService } from './ai.service';
import type { ChatMessage } from './ai.types';
import { REDIS_CLIENT } from '@shared/redis/redis.module';

export interface AiGatewayChatJob {
  subject: string;
  message: string;
  history: ChatMessage[];
  locale: string;
}

@Injectable()
export class AiGatewayService {
  private readonly limitPerMinute: number;
  private readonly maxWaitMs: number;

  constructor(
    private readonly config: ConfigService,
    @InjectQueue('ai-gateway') private readonly queue: Queue<AiGatewayChatJob>,
    @Inject(REDIS_CLIENT) private readonly redis: Redis | Cluster,
  ) {
    this.limitPerMinute = Number(this.config.get('AI_GATEWAY_RPM', 30));
    this.maxWaitMs = Number(this.config.get('AI_GATEWAY_MAX_WAIT_MS', 60_000));
  }

  async chat(input: { subject: string; message: string; history?: ChatMessage[]; locale?: string }) {
    await this.assertQuota(input.subject);
    const job = await this.queue.add(
      'chat',
      {
        subject: input.subject || 'anonymous',
        message: input.message,
        history: input.history || [],
        locale: input.locale || 'zh',
      },
      {
        removeOnComplete: { age: 3600, count: 1000 },
        removeOnFail: { age: 86_400, count: 1000 },
      },
    );

    return this.waitForResult(job);
  }

  async getStatus() {
    const counts = await this.queue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed');
    return {
      queueDepth: counts.waiting + counts.delayed,
      active: counts.active,
      maxConcurrency: Number(this.config.get('AI_GATEWAY_CONCURRENCY', 4)),
      limitPerMinute: this.limitPerMinute,
      mode: 'distributed-bullmq',
      distributedQueue: true,
      counts,
    };
  }

  private async assertQuota(subject: string) {
    const key = `ai:quota:${subject || 'anonymous'}`;
    const count = await this.redis.incr(key);
    if (count === 1) await this.redis.expire(key, 60);
    if (count > this.limitPerMinute) {
      throw new TooManyRequestsException('AI quota exceeded; retry later');
    }
  }

  private async waitForResult<T>(job: Job<AiGatewayChatJob, T>) {
    const started = Date.now();
    while (Date.now() - started < this.maxWaitMs) {
      const state = await job.getState();
      if (state === 'completed') {
        return job.returnvalue as T;
      }
      if (state === 'failed') {
        throw job.failedReason ? new Error(job.failedReason) : new Error('AI gateway job failed');
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new RequestTimeoutException('AI gateway request timed out while waiting for distributed worker');
  }
}
