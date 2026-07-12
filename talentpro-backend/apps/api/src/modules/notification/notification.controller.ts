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
import { SkipThrottle } from '@nestjs/throttler';
import { Observable } from 'rxjs';
import { NotificationService } from './notification.service';
import { NotificationSseService } from './notification-sse.service';
import { SseAuthGuard } from '@/common/guards/sse-auth.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { Public } from '@shared/decorators/public.decorator';
import { Permission } from '@shared/decorators/permission.decorator';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('通知中心')
@Controller('notifications')
@ApiBearerAuth()
export class NotificationController {
  constructor(
    private notificationService: NotificationService,
    private notificationSseService: NotificationSseService,
  ) {}

  @Get()
  @ApiOperation({ summary: '通知列表' })
  findAll(
    @CurrentUser('id') userId: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.notificationService.findByUser(
      userId,
      pagination.page,
      pagination.pageSize,
    );
  }

  @Sse('stream')
  @SkipThrottle({ default: true, auth: true, search: true })
  @Public()
  @UseGuards(SseAuthGuard)
  @ApiOperation({ summary: 'SSE 实时推送（token 优先通过 Authorization header 传递，降级通过 query parameter）' })
  stream(@CurrentUser('id') userId: string): Observable<MessageEvent> {
    return this.notificationSseService.addStream(userId);
  }

  @Patch(':id/read')
  @Permission('notification:update')
  @ApiOperation({ summary: '标记已读' })
  markAsRead(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.notificationService.markAsRead(userId, id);
  }

  @Patch('read-all')
  @Permission('notification:update')
  @ApiOperation({ summary: '全部已读' })
  markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationService.markAllAsRead(userId);
  }
}
