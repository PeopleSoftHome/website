import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import Redis, { Cluster } from 'ioredis';
import { RedisModule, REDIS_CLIENT } from '@/common/redis/redis.module';

export function createBullRootOptions(
  redisClient: Redis | Cluster,
): { connection: Redis | Cluster } {
  return {
    connection: redisClient,
  };
}

@Module({
  imports: [
    RedisModule,
    BullModule.forRootAsync({
      imports: [RedisModule],
      useFactory: createBullRootOptions,
      inject: [REDIS_CLIENT],
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
