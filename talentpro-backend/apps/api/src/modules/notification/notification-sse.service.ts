import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  MessageEvent,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { Observable, Subject, finalize } from 'rxjs';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '@/common/redis/redis.module';

@Injectable()
export class NotificationSseService implements OnModuleInit, OnModuleDestroy {
  private subscriber: Redis;
  private userStreams = new Map<string, Subject<MessageEvent>>();

  constructor(@Inject(REDIS_CLIENT) private redis: Redis) {}

  onModuleInit() {
    this.subscriber = this.redis.duplicate();
    this.subscriber.psubscribe('sse:notifications:*');
    this.subscriber.on('pmessage', (pattern, channel, message) => {
      const userId = channel.replace('sse:notifications:', '');
      const stream = this.userStreams.get(userId);
      if (stream) {
        try {
          const data = JSON.parse(message);
          stream.next({ data } as MessageEvent);
        } catch {
          // ignore invalid JSON
        }
      }
    });
  }

  onModuleDestroy() {
    this.subscriber.punsubscribe('sse:notifications:*');
    this.subscriber.disconnect();
  }

  addStream(userId: string): Observable<MessageEvent> {
    const subject = new Subject<MessageEvent>();
    this.userStreams.set(userId, subject);
    return subject.pipe(
      finalize(() => {
        this.userStreams.delete(userId);
      }),
    );
  }

  async broadcast(userId: string, data: unknown): Promise<void> {
    try {
      await this.redis.publish(
        `sse:notifications:${userId}`,
        JSON.stringify(data),
      );
    } catch {
      // Fallback: 如果 Redis 不可用，直接推送给本地内存中的 stream
      const stream = this.userStreams.get(userId);
      if (stream) {
        stream.next({ data } as MessageEvent);
      }
    }
  }
}
