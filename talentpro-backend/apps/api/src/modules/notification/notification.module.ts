import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationService } from './notification.service';
import { NotificationSseService } from './notification-sse.service';
import { NotificationController } from './notification.controller';

@Module({
  imports: [JwtModule],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationSseService],
  exports: [NotificationService, NotificationSseService],
})
export class NotificationModule {}
