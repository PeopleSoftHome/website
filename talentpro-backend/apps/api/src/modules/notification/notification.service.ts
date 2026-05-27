import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Observable, Subject } from 'rxjs';

interface NotificationEvent {
  data: unknown;
}

@Injectable()
export class NotificationService {
  private userStreams = new Map<string, Subject<NotificationEvent>>();

  constructor(private prisma: PrismaService) {}

  async findByUser(userId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { data, meta: { page, pageSize, total, unreadCount } };
  }

  async markAsRead(userId: string, id: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
    return { message: '已标记为已读' };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: '全部已读' };
  }

  async create(data: {
    userId: string;
    type: string;
    title: string;
    content: string;
    data?: Record<string, unknown>;
    workspaceId?: string;
  }) {
    const notif = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        content: data.content,
        workspaceId: data.workspaceId,
        data: (data.data || {}) as any,
      },
    });
    this.pushToUser(data.userId, notif);
    return notif;
  }

  getStream(userId: string): Observable<NotificationEvent> {
    if (!this.userStreams.has(userId)) {
      this.userStreams.set(userId, new Subject<NotificationEvent>());
    }
    return this.userStreams.get(userId)!.asObservable();
  }

  private pushToUser(userId: string, data: unknown) {
    const stream = this.userStreams.get(userId);
    if (stream) {
      stream.next({ data });
    }
  }
}
