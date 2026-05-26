import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { LeadStatus } from '@prisma/client';

@Injectable()
export class LeadService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, pageSize = 20, status?: LeadStatus) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (status) where.status = status;
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
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findOne(id: string) {
    const booking = await this.prisma.demoBooking.findUnique({
      where: { id },
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
  }) {
    return this.prisma.demoBooking.create({
      data: {
        name: data.name,
        company: data.company,
        phone: data.phone,
        email: data.email,
        products: data.products || [],
        scale: data.scale,
        source: data.source || 'website',
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async updateStatus(id: string, status: LeadStatus, assignedTo?: string, notes?: string) {
    return this.prisma.demoBooking.update({
      where: { id },
      data: { status, assignedTo, notes },
    });
  }

  async addFollowUp(id: string, data: { type: string; content: string; createdBy: string }) {
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
