import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class AboutService {
  constructor(private prisma: PrismaService) {}

  async findTeam(department?: string, featured?: boolean) {
    const where: any = {};
    if (department) where.department = department;
    if (featured !== undefined) where.featured = featured;
    return this.prisma.teamMember.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
    });
  }

  async findPartners(type?: string) {
    const where: any = {};
    if (type) where.type = type;
    return this.prisma.partner.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
    });
  }
}
