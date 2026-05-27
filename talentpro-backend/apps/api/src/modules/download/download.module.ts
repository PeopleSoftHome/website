import { Module } from '@nestjs/common';
import { DownloadService } from './download.service';
import { DownloadController } from './download.controller';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [DownloadService],
  controllers: [DownloadController],
  exports: [DownloadService],
})
export class DownloadModule {}
