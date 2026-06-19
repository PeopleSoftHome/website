import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const redisMode = configService.get<string>('REDIS_MODE') || 'single';
        const redisUrl = configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

        if (redisMode === 'cluster') {
          const clusterNodes = configService
            .get<string>('REDIS_CLUSTER_NODES')
            ?.split(',')
            .map((node) => {
              const [host, port] = node.trim().split(':');
              return { host, port: parseInt(port, 10) || 6379 };
            }) || [{ host: 'localhost', port: 6379 }];

          return {
            connection: {
              host: clusterNodes[0].host,
              port: clusterNodes[0].port,
            } as unknown as { host: string; port: number },
          };
        }

        return {
          connection: {
            url: redisUrl,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
