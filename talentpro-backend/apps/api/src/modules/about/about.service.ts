import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class AboutService {
  constructor(private prisma: PrismaService) {}

  async findTeam(department?: string, featured?: boolean) {
    const where: Prisma.TeamMemberWhereInput = {};
    if (department) where.department = department;
    if (featured !== undefined) where.featured = featured;
    return this.prisma.teamMember.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
    });
  }

  async findPartners(type?: string) {
    const where: Prisma.PartnerWhereInput = {};
    if (type) where.type = type;
    return this.prisma.partner.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
    });
  }
}
