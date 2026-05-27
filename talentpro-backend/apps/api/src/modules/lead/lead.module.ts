import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MailModule } from '../mail/mail.module';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';

@Module({
  imports: [MailModule, BullModule.registerQueue({ name: 'lead-nurture' })],
  providers: [LeadService],
  controllers: [LeadController],
})
export class LeadModule {}
