import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('REDIS_URL') || 'redis://localhost:6379',
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'notification', defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 } } },
      { name: 'lead-nurture', defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 5000 } } },
      { name: 'search-index', defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 3000 } } },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
