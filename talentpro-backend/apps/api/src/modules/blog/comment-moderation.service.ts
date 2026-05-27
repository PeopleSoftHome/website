import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CommentStatus } from '@prisma/client';
import { checkSpamPatterns, checkSuspiciousLength, calculateRiskScore } from '@/common/utils/moderation.utils';

@Injectable()
export class CommentModerationService {
  constructor(private prisma: PrismaService) {}

  async moderateContent(content: string): Promise<{ riskScore: number; flags: string[]; autoApprove: boolean }> {
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
    const { riskScore, flags } = calculateRiskScore(sensitiveFlags, spamFlags, isSuspicious, severities);

    const autoApprove = riskScore < 0.3 && flags.length === 0;
    return { riskScore, flags, autoApprove };
  }

  async findCommentsForAdmin(filters: { status?: CommentStatus; entityType?: string; page?: number; pageSize?: number }) {
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const skip = (page - 1) * pageSize;
    const where: any = {};
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
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
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
