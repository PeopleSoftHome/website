import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { Prisma, ExperimentStatus } from '@prisma/client';
import { PrismaService } from '@shared/prisma/prisma.service';

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

  /**
   * 实验分流：按 `${key}:${sessionId}` 做确定性哈希分桶（同一会话恒定同组），
   * 并按 trafficSplit（B 组占比）返回变体配置；首次指派记录一次 impression（幂等）。
   * 实验不存在或非 RUNNING 时返回 null，调用方按默认文案渲染。
   */
  async assign(key: string, sessionId: string, segment?: string) {
    const exp = await this.prisma.experiment.findUnique({ where: { key } });
    if (!exp || exp.status !== ExperimentStatus.RUNNING || !sessionId) return null;

    const hex = createHash('md5').update(`${key}:${sessionId}`).digest('hex').slice(0, 8);
    const bucket = parseInt(hex, 16) / 0xffffffff;
    const variant = bucket < exp.trafficSplit ? 'B' : 'A';

    const existing = await this.prisma.experimentEvent.findFirst({
      where: { experimentId: exp.id, sessionId, eventType: 'impression' },
      select: { id: true },
    });
    if (!existing) {
      await this.recordEvent({
        experimentId: exp.id,
        variant,
        eventType: 'impression',
        sessionId,
        // 分群信号（如 new:mobile:zh）随曝光入库，支撑后续分群分析
        properties: segment ? { segment } : undefined,
      });
    }

    return {
      experimentId: exp.id,
      key: exp.key,
      variant,
      config: (variant === 'A' ? exp.variantA : exp.variantB) as Record<string, unknown>,
    };
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
