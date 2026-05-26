import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Sse,
  UseGuards,
  MessageEvent,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Observable, map } from 'rxjs';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('通知中心')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: '通知列表' })
  findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.notificationService.findByUser(
      userId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  @Sse('stream')
  @ApiOperation({ summary: 'SSE 实时推送' })
  stream(@CurrentUser('id') userId: string): Observable<MessageEvent> {
    return this.notificationService.getStream(userId).pipe(
      map((event) => ({
        data: event.data,
      }) as MessageEvent),
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: '标记已读' })
  markAsRead(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notificationService.markAsRead(userId, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: '全部已读' })
  markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }
}
