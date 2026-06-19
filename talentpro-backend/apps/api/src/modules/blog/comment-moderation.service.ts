import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CommentStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { checkSpamPatterns, checkSuspiciousLength, calculateRiskScore } from '@/common/utils/moderation.utils';
import { getSkip, buildPaginatedResponse } from '@/common/helpers/pagination.helper';
import { AiService } from '@/modules/ai/ai.service';

@Injectable()
export class CommentModerationService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  private async ruleModerate(content: string): Promise<{ riskScore: number; flags: string[] }> {
    const sensitiveWords = await this.prisma.sensitiveWord.findMany({ where: { isActive: true } });
    const lowerContent = content.toLowerCase();
    const sensitiveFlags: string[] = [];
    const severities: number[] = [];
    for (const sw of sensitiveWords) {
      if (lowerContent.includes(sw.word.toLowerCase())) {
        sensitiveFlags.push(sw.category);
        severities.push(sw.severity);
      }
    }

    const { spamFlags } = checkSpamPatterns(content);
    const { isSuspicious } = checkSuspiciousLength(content);
    return calculateRiskScore(sensitiveFlags, spamFlags, isSuspicious, severities);
  }

  async moderateContent(content: string): Promise<{ riskScore: number; flags: string[]; autoApprove: boolean; aiRiskScore?: number; aiFlags?: string[] }> {
    const [ruleResult, aiResult] = await Promise.all([
      this.ruleModerate(content),
      this.aiService.moderateContent(content).catch(() => ({ riskScore: 0, flags: [] as string[] })),
    ]);

    const flags = Array.from(new Set([...ruleResult.flags, ...aiResult.flags]));
    const riskScore = Math.max(ruleResult.riskScore, aiResult.riskScore);
    const autoApprove = riskScore < 0.3 && flags.length === 0;

    return {
      riskScore,
      flags,
      autoApprove,
      aiRiskScore: aiResult.riskScore,
      aiFlags: aiResult.flags,
    };
  }

  async findCommentsForAdmin(filters: { status?: CommentStatus; entityType?: string; page?: number; pageSize?: number }) {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const skip = getSkip(page, pageSize);
    const where: Prisma.CommentWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.entityType) where.entityType = filters.entityType;

    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        skip,
        take: pageSize,
        where,
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          parent: { select: { id: true, content: true, author: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.comment.count({ where }),
    ]);
    return buildPaginatedResponse(data, page, pageSize, total);
  }

  async batchModerateComments(ids: string[], status: CommentStatus) {
    await this.prisma.comment.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
    return { updated: ids.length };
  }

  async moderateComment(id: string, status: CommentStatus) {
    return this.prisma.comment.update({ where: { id }, data: { status } });
  }
}
