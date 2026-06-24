import { Injectable } from '@nestjs/common';
import { Prisma, ExperimentStatus } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class ExperimentService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.experiment.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findRunning() {
    return this.prisma.experiment.findMany({
      where: { status: ExperimentStatus.RUNNING },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByKey(key: string) {
    return this.prisma.experiment.findUnique({ where: { key } });
  }

  async create(data: {
    key: string;
    name: string;
    description?: string;
    variantA: Record<string, unknown>;
    variantB: Record<string, unknown>;
    trafficSplit?: number;
  }) {
    return this.prisma.experiment.create({
      data: { ...data, status: ExperimentStatus.DRAFT, variantA: data.variantA as Prisma.InputJsonValue, variantB: data.variantB as Prisma.InputJsonValue },
    });
  }

  async updateStatus(id: string, status: ExperimentStatus) {
    return this.prisma.experiment.update({
      where: { id },
      data: { status },
    });
  }

  async recordEvent(data: {
    experimentId: string;
    variant: string;
    eventType: string;
    userId?: string;
    sessionId: string;
    properties?: Record<string, unknown>;
  }) {
    return this.prisma.experimentEvent.create({ data: { ...data, properties: data.properties as Prisma.InputJsonValue } });
  }

  async getStats(experimentId: string) {
    const [impressions, conversions] = await Promise.all([
      this.prisma.experimentEvent.groupBy({
        by: ['variant'],
        where: { experimentId, eventType: 'impression' },
        _count: { variant: true },
      }),
      this.prisma.experimentEvent.groupBy({
        by: ['variant'],
        where: { experimentId, eventType: 'conversion' },
        _count: { variant: true },
      }),
    ]);
    return { impressions, conversions };
  }
}
