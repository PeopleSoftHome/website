import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MailModule } from '../mail/mail.module';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';

@Module({
  imports: [
    MailModule,
    BullModule.registerQueue({
      name: 'lead-nurture',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }),
  ],
  providers: [LeadService],
  controllers: [LeadController],
})
export class LeadModule {}
