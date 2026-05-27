import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { checkSpamPatterns, checkSuspiciousLength, calculateRiskScore } from '@/common/utils/moderation.utils';

@Injectable()
export class SystemService {
  constructor(private prisma: PrismaService) {}

  // ─── Settings ───
  async findAllSettings(category?: string) {
    const where: any = {};
    if (category) where.category = category;
    const rows = await this.prisma.setting.findMany({ where, orderBy: { key: 'asc' } });
    const result: Record<string, any> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return { data: rows, mapped: result };
  }

  async findSettingByKey(key: string) {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException('设置项不存在');
    return setting;
  }

  async upsertSetting(data: { key: string; value: any; category?: string; updatedBy?: string }) {
    return this.prisma.setting.upsert({
      where: { key: data.key },
      update: { value: data.value, category: data.category, updatedBy: data.updatedBy },
      create: {
        key: data.key,
        value: data.value,
        category: data.category || 'general',
        updatedBy: data.updatedBy,
      },
    });
  }

  async deleteSetting(key: string) {
    await this.prisma.setting.delete({ where: { key } });
    return { message: '删除成功' };
  }

  // ─── AuditLogs ───
  async findAllAuditLogs(page = 1, pageSize = 20, filters?: { userId?: string; resource?: string }) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.resource) where.resource = filters.resource;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: pageSize,
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { data, meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
  }

  async createAuditLog(data: {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        ...data,
        oldValue: data.oldValue || undefined,
        newValue: data.newValue || undefined,
      },
    });
  }

  // ─── EmailTemplates ───
  async findAllEmailTemplates() {
    return this.prisma.emailTemplate.findMany({ orderBy: { key: 'asc' } });
  }

  async findEmailTemplateByKey(key: string) {
    const template = await this.prisma.emailTemplate.findUnique({ where: { key } });
    if (!template) throw new NotFoundException('邮件模板不存在');
    return template;
  }

  async upsertEmailTemplate(data: { key: string; subject: string; body: string; html?: string }) {
    return this.prisma.emailTemplate.upsert({
      where: { key: data.key },
      update: { subject: data.subject, body: data.body, html: data.html },
      create: data,
    });
  }

  async deleteEmailTemplate(key: string) {
    await this.prisma.emailTemplate.delete({ where: { key } });
    return { message: '删除成功' };
  }

  // ─── SensitiveWords ───
  async findAllSensitiveWords() {
    return this.prisma.sensitiveWord.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createSensitiveWord(data: { word: string; category?: string; severity?: number }) {
    return this.prisma.sensitiveWord.create({
      data: { word: data.word, category: data.category || 'spam', severity: data.severity || 2 },
    });
  }

  async deleteSensitiveWord(id: string) {
    await this.prisma.sensitiveWord.delete({ where: { id } });
    return { message: '删除成功' };
  }

  async testModeration(content: string) {
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
    return { riskScore, flags, autoApprove: riskScore < 0.3 && flags.length === 0 };
  }
}
