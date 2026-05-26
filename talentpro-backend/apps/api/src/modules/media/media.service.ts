import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, pageSize = 20, mimeType?: string) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (mimeType) where.mimeType = { startsWith: mimeType };
    const [data, total] = await Promise.all([
      this.prisma.media.findMany({
        skip,
        take: pageSize,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.media.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async findOne(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException('媒体文件不存在');
    return media;
  }

  async create(data: {
    filename: string;
    originalName: string;
    url: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
    alt?: string;
    createdBy: string;
  }) {
    return this.prisma.media.create({ data });
  }

  async update(id: string, data: Partial<{ alt: string; originalName: string }>) {
    return this.prisma.media.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.prisma.media.delete({ where: { id } });
    return { message: '删除成功' };
  }

  async getStats() {
    const total = await this.prisma.media.count();
    const byType = await this.prisma.media.groupBy({
      by: ['mimeType'],
      _count: { mimeType: true },
      _sum: { size: true },
    });
    return { total, byType };
  }
}
