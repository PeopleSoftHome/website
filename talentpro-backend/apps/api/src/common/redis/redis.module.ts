import { Module, Global, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Cluster } from 'ioredis';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (config: ConfigService) => {
        const redisMode = config.get<string>('REDIS_MODE') || 'single';
        const redisUrl = config.get<string>('REDIS_URL') || 'redis://localhost:6379';

        if (redisMode === 'cluster') {
          const clusterNodes = config.get<string>('REDIS_CLUSTER_NODES')
            ?.split(',')
            .map((node) => {
              const [host, port] = node.trim().split(':');
              return { host, port: parseInt(port, 10) || 6379 };
            }) || [{ host: 'localhost', port: 6379 }];

          Logger.log(`Redis Cluster mode: ${clusterNodes.length} nodes`, 'RedisModule');
          return new Cluster(clusterNodes, {
            redisOptions: {
              maxRetriesPerRequest: null,
              enableReadyCheck: true,
            },
          });
        }

        if (redisMode === 'sentinel') {
          const sentinels = config.get<string>('REDIS_SENTINEL_NODES')
            ?.split(',')
            .map((node) => {
              const [host, port] = node.trim().split(':');
              return { host, port: parseInt(port, 10) || 26379 };
            }) || [{ host: 'localhost', port: 26379 }];

          Logger.log(`Redis Sentinel mode: ${sentinels.length} sentinels`, 'RedisModule');
          return new Redis({
            sentinels,
            name: config.get<string>('REDIS_SENTINEL_MASTER_NAME') || 'mymaster',
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
          });
        }

        Logger.log(`Redis Single mode: ${redisUrl}`, 'RedisModule');
        return new Redis(redisUrl, {
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
