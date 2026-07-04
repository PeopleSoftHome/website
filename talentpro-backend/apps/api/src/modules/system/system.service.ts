import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, SensitiveWordCategory } from '@prisma/client';
import { PrismaService } from '@/common/prisma/prisma.service';
import { checkSpamPatterns, checkSuspiciousLength, calculateRiskScore } from '@/common/utils/moderation.utils';
import { getSkip, buildPaginatedResponse } from '@/common/helpers/pagination.helper';

@Injectable()
export class SystemService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  // ─── Settings ───
  async findAllSettings(category?: string) {
    const where: Prisma.SettingWhereInput = {};
    if (category) where.category = category;
    const rows = await this.prisma.setting.findMany({ where, orderBy: { key: 'asc' } });
    const result: Record<string, unknown> = {};
    for (const row of rows) {
      result[row.key] = row.value;
    }
    return { data: rows, mapped: result };
  }

  async findSettingByKey(key: string) {
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    if (!setting) throw new NotFoundException('Setting not found');
    return setting;
  }

  async upsertSetting(data: { key: string; value: unknown; category?: string; updatedBy?: string }) {
    const value = data.value as Prisma.InputJsonValue;
    return this.prisma.setting.upsert({
      where: { key: data.key },
      update: { value, category: data.category, updatedBy: data.updatedBy },
      create: {
        key: data.key,
        value,
        category: data.category || 'general',
        updatedBy: data.updatedBy,
      },
    });
  }

  async deleteSetting(key: string) {
    await this.prisma.setting.delete({ where: { key } });
    return { message: 'Deleted successfully' };
  }

  async getPublicConfig() {
    const PUBLIC_SETTING_KEYS = ['sitePhone', 'copyright', 'featureFlags', 'hotTags', 'socialLinks', 'siteTitle', 'siteDescription'];
    const settings = await this.prisma.setting.findMany({
      where: { key: { in: PUBLIC_SETTING_KEYS } },
    });
    const mapped: Record<string, unknown> = {};
    for (const row of settings) {
      mapped[row.key] = row.value;
    }
    return {
      recaptchaSiteKey: this.config.get<string>('NUXT_PUBLIC_RECAPTCHA_SITE_KEY') || '',
      sentryDsn: this.config.get<string>('NUXT_PUBLIC_SENTRY_DSN') || this.config.get<string>('SENTRY_DSN') || '',
      sitePhone: mapped.sitePhone || '',
      copyright: mapped.copyright || '',
      featureFlags: mapped.featureFlags || {},
      hotTags: Array.isArray(mapped.hotTags) ? mapped.hotTags : [],
      socialLinks: Array.isArray(mapped.socialLinks) ? mapped.socialLinks : [],
      siteTitle: mapped.siteTitle || '',
      siteDescription: mapped.siteDescription || '',
    };
  }

  // ─── AuditLogs ───
  async findAllAuditLogs(page = 1, pageSize = 20, filters?: { userId?: string; resource?: string }) {
    const skip = getSkip(page, pageSize);
    const where: Prisma.AuditLogWhereInput = {};
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
    return buildPaginatedResponse(data, page, pageSize, total);
  }

  async createAuditLog(data: {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    oldValue?: Record<string, unknown>;
    newValue?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        ...data,
        oldValue: (data.oldValue || undefined) as Prisma.InputJsonValue | undefined,
        newValue: (data.newValue || undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  // ─── EmailTemplates ───
  async findAllEmailTemplates() {
    return this.prisma.emailTemplate.findMany({ orderBy: { key: 'asc' } });
  }

  async findEmailTemplateByKey(key: string) {
    const template = await this.prisma.emailTemplate.findUnique({ where: { key } });
    if (!template) throw new NotFoundException('Email template not found');
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
    return { message: 'Deleted successfully' };
  }

  // ─── ChatBot Config ───
  async getChatBotConfig() {
    const config = await this.prisma.chatBotConfig.findUnique({ where: { key: 'default' } });
    if (!config) {
      return {
        key: 'default',
        intents: [],
        quickReplies: [],
        fallbackCopy: '抱歉，我暂时无法理解您的问题，建议您预约演示或联系人工客服。',
      };
    }
    return config;
  }

  async upsertChatBotConfig(data: { intents?: unknown[]; quickReplies?: unknown[]; fallbackCopy?: string }) {
    const value = {
      intents: (Array.isArray(data.intents) ? data.intents : []) as Prisma.InputJsonValue,
      quickReplies: (Array.isArray(data.quickReplies) ? data.quickReplies : []) as Prisma.InputJsonValue,
      fallbackCopy: data.fallbackCopy || '抱歉，我暂时无法理解您的问题，建议您预约演示或联系人工客服。',
    };
    return this.prisma.chatBotConfig.upsert({
      where: { key: 'default' },
      update: value,
      create: { key: 'default', ...value },
    });
  }

  // ─── SensitiveWords ───
  async findAllSensitiveWords() {
    return this.prisma.sensitiveWord.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createSensitiveWord(data: { word: string; category?: string; severity?: number }) {
    return this.prisma.sensitiveWord.create({
      data: { word: data.word, category: (data.category || 'spam') as SensitiveWordCategory, severity: data.severity || 2 },
    });
  }

  async deleteSensitiveWord(id: string) {
    await this.prisma.sensitiveWord.delete({ where: { id } });
    return { message: 'Deleted successfully' };
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
