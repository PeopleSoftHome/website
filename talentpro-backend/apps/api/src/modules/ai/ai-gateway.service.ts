import { Injectable, TooManyRequestsException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import type { ChatMessage } from './ai.types';

type QueueTask<T> = { run: () => Promise<T>; resolve: (value: T) => void; reject: (reason: unknown) => void };

/**
 * P1 AI Gateway boundary.
 *
 * Quota + bounded FIFO concurrency are enforced before work reaches the AI facade.
 * The queue is intentionally behind a single service boundary so it can be moved
 * to BullMQ/Redis without changing controller contracts in the next HA iteration.
 */
@Injectable()
export class AiGatewayService {
  private readonly limitPerMinute: number;
  private readonly maxConcurrency: number;
  private readonly usage = new Map<string, { startedAt: number; count: number }>();
  private readonly queue: QueueTask<unknown>[] = [];
  private active = 0;

  constructor(
    private readonly config: ConfigService,
    private readonly ai: AiService,
  ) {
    this.limitPerMinute = Number(this.config.get('AI_GATEWAY_RPM', 30));
    this.maxConcurrency = Number(this.config.get('AI_GATEWAY_CONCURRENCY', 4));
  }

  async chat(input: { subject: string; message: string; history?: ChatMessage[]; locale?: string }) {
    this.assertQuota(input.subject);
    return this.enqueue(() => this.ai.chat(input.message, input.history || [], input.locale || 'zh'));
  }

  getStatus() {
    return {
      queueDepth: this.queue.length,
      active: this.active,
      maxConcurrency: this.maxConcurrency,
      limitPerMinute: this.limitPerMinute,
      mode: 'bounded-fifo',
      distributedQueue: false,
    };
  }

  private assertQuota(subject: string) {
    const now = Date.now();
    const key = subject || 'anonymous';
    const current = this.usage.get(key);
    if (!current || now - current.startedAt >= 60_000) {
      this.usage.set(key, { startedAt: now, count: 1 });
      return;
    }
    if (current.count >= this.limitPerMinute) {
      throw new TooManyRequestsException('AI quota exceeded; retry later');
    }
    current.count += 1;
  }

  private enqueue<T>(run: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ run, resolve: resolve as (value: unknown) => void, reject });
      void this.drain();
    });
  }

  private async drain() {
    while (this.active < this.maxConcurrency && this.queue.length) {
      const task = this.queue.shift()!;
      this.active += 1;
      task.run()
        .then(task.resolve)
        .catch(task.reject)
        .finally(() => {
          this.active -= 1;
          void this.drain();
        });
    }
  }
}
