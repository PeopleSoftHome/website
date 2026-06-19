import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, DemoBookingScale, LeadSource } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '@/common/prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { LeadStatus } from '@prisma/client';
import { getSkip, buildPaginatedResponse } from '@/common/helpers/pagination.helper';

@Injectable()
export class LeadService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private eventEmitter: EventEmitter2,
    @InjectQueue('lead-nurture') private notificationQueue: Queue,
  ) {}

  private async scheduleNurtureEmails(bookingId: string, email?: string, name?: string, products: string[] = []) {
    if (!email) return;
    const payload = { email, name: name || '', products };
    await this.notificationQueue.add('lead-nurture-day3', payload, { delay: 3 * 24 * 60 * 60 * 1000 });
    await this.notificationQueue.add('lead-nurture-day7', payload, { delay: 7 * 24 * 60 * 60 * 1000 });
    await this.notificationQueue.add('lead-nurture-day14', payload, { delay: 14 * 24 * 60 * 60 * 1000 });
  }

  async findAll(page = 1, pageSize = 20, status?: LeadStatus, workspaceId?: string) {
    const skip = getSkip(page, pageSize);
    const where: Prisma.DemoBookingWhereInput = {};
    if (status) where.status = status;
    if (workspaceId) where.workspaceId = workspaceId;
    const [data, total] = await Promise.all([
      this.prisma.demoBooking.findMany({
        skip,
        take: pageSize,
        where,
        include: { followUps: { orderBy: { createdAt: 'desc' } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.demoBooking.count({ where }),
    ]);
    return buildPaginatedResponse(data, page, pageSize, total);
  }

  async findOne(id: string, workspaceId?: string) {
    const where: Prisma.DemoBookingWhereInput = { id };
    if (workspaceId) where.workspaceId = workspaceId;
    const booking = await this.prisma.demoBooking.findFirst({
      where,
      include: { followUps: { orderBy: { createdAt: 'desc' } } },
    });
    if (!booking) throw new NotFoundException('预约记录不存在');
    return booking;
  }

  async create(data: {
    name: string;
    company: string;
    phone: string;
    email?: string;
    products?: string[];
    scale: string;
    source?: string;
    ipAddress?: string;
    userAgent?: string;
    workspaceId?: string;
  }) {
    const booking = await this.prisma.demoBooking.create({
      data: {
        name: data.name,
        company: data.company,
        phone: data.phone,
        email: data.email,
        products: data.products || [],
        scale: data.scale as DemoBookingScale,
        source: (data.source || 'website') as LeadSource,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        workspaceId: data.workspaceId,
      },
    });

    // 异步发送确认邮件（不阻塞响应）
    if (data.email) {
      this.mailService.sendDemoConfirmation(data.email, {
        name: data.name,
        company: data.company,
        products: data.products || [],
      }).catch(() => {});
    }

    // 触发 lead 创建事件
    this.eventEmitter.emit('lead.created', { bookingId: booking.id, email: data.email });

    // 注册培育邮件队列（Day 3 / Day 7 / Day 14）
    this.scheduleNurtureEmails(booking.id, data.email, data.name, data.products || []);

    return booking;
  }

  private readonly statusTransitions: Record<LeadStatus, LeadStatus[]> = {
    NEW: ['CONTACTED', 'LOST'],
    CONTACTED: ['QUALIFIED', 'LOST'],
    QUALIFIED: ['DEMOED', 'LOST'],
    DEMOED: ['NEGOTIATION', 'WON', 'LOST'],
    NEGOTIATION: ['WON', 'LOST'],
    WON: [],
    LOST: [],
  };

  async updateStatus(id: string, status: LeadStatus, assignedTo?: string, notes?: string, workspaceId?: string) {
    const where: Prisma.DemoBookingWhereInput = { id };
    if (workspaceId) where.workspaceId = workspaceId;
    const booking = await this.prisma.demoBooking.findFirst({ where });
    if (!booking) throw new NotFoundException('预约记录不存在');

    const allowed = this.statusTransitions[booking.status];
    if (!allowed.includes(status)) {
      throw new BadRequestException(`状态无法从 ${booking.status} 变更为 ${status}`);
    }

    return this.prisma.demoBooking.update({
      where: { id },
      data: { status, assignedTo, notes },
    });
  }

  async addFollowUp(id: string, data: { type: string; content: string; createdBy: string }, workspaceId?: string) {
    if (workspaceId) {
      const booking = await this.prisma.demoBooking.findFirst({ where: { id, workspaceId } });
      if (!booking) throw new NotFoundException('预约记录不存在');
    }
    return this.prisma.followUp.create({
      data: { bookingId: id, type: data.type, content: data.content, createdBy: data.createdBy },
    });
  }

  async getStats() {
    const total = await this.prisma.demoBooking.count();
    const byStatus = await this.prisma.demoBooking.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await this.prisma.demoBooking.count({
      where: { createdAt: { gte: today } },
    });
    return { total, byStatus, todayCount };
  }
}
