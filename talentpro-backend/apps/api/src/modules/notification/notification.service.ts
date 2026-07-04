import { Injectable } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { getSkip } from '@/common/helpers/pagination.helper';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async findByUser(userId: string, page = 1, pageSize = 20) {
    const skip = getSkip(page, pageSize);
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
    return { message: 'Marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'All marked as read' };
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
        type: data.type as NotificationType,
        title: data.title,
        content: data.content,
        workspaceId: data.workspaceId,
        data: (data.data || {}) as Prisma.InputJsonValue,
      },
    });
    return notif;
  }
}
