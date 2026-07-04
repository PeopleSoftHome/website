import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { JobRepository } from './job.repository';

@Injectable()
export class CareersService {
  constructor(
    private prisma: PrismaService,
    private jobRepo: JobRepository,
  ) {}

  async findAll(type?: string, department?: string, location?: string, page = 1, pageSize = 20) {
    const where: Prisma.JobWhereInput = { status: 'open', deletedAt: null };
    if (type) where.type = type;
    if (department) where.department = department;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    return this.jobRepo.findAll({
      page,
      pageSize,
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    const data = await this.jobRepo.findOne(id);
    if (data.status !== 'open' || data.deletedAt) {
      throw new NotFoundException('Job not found or closed');
    }
    return data;
  }

  async apply(jobId: string, dto: { name: string; email: string; phone?: string; resumeUrl?: string; coverLetter?: string; portfolioUrl?: string }) {
    const job = await this.prisma.job.findFirst({ where: { id: jobId, status: 'open' } });
    if (!job) throw new NotFoundException('Job not found or closed');
    return this.prisma.jobApplication.create({
      data: { jobId, ...dto },
    });
  }

  async findDepartments() {
    const rows = await this.prisma.job.groupBy({
      by: ['department'],
      where: { status: 'open', deletedAt: null },
      _count: { department: true },
    });
    return rows.map((r) => ({ name: r.department, count: r._count.department }));
  }
}
