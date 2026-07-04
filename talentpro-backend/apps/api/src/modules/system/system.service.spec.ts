import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { SystemService } from './system.service';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('SystemService', () => {
  let service: SystemService;
  let prisma: PrismaService;
  let config: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const map: Record<string, string> = {
                NUXT_PUBLIC_RECAPTCHA_SITE_KEY: 'recaptcha-site-key',
                NUXT_PUBLIC_SENTRY_DSN: 'public-sentry-dsn',
                SENTRY_DSN: 'fallback-sentry-dsn',
              };
              return map[key] ?? undefined;
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            setting: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              upsert: jest.fn(),
              delete: jest.fn(),
            },
            auditLog: {
              findMany: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
            },
            emailTemplate: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              upsert: jest.fn(),
              delete: jest.fn(),
            },
            chatBotConfig: {
              findUnique: jest.fn(),
              upsert: jest.fn(),
            },
            sensitiveWord: {
              findMany: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SystemService>(SystemService);
    prisma = module.get<PrismaService>(PrismaService);
    config = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(config).toBeDefined();
  });

  describe('findAllSettings', () => {
    it('should return all settings and mapped values without category', async () => {
      const rows = [
        { id: 's1', key: 'siteTitle', value: 'TalentPro', category: 'general' },
        { id: 's2', key: 'sitePhone', value: '400-000-0000', category: 'general' },
      ];
      jest.spyOn(prisma.setting, 'findMany').mockResolvedValue(rows as unknown as Prisma.SettingUncheckedCreateInput[] as never);

      const result = await service.findAllSettings();

      expect(prisma.setting.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { key: 'asc' },
      });
      expect(result.data).toEqual(rows);
      expect(result.mapped).toEqual({ siteTitle: 'TalentPro', sitePhone: '400-000-0000' });
    });

    it('should filter settings by category', async () => {
      jest.spyOn(prisma.setting, 'findMany').mockResolvedValue([]);

      await service.findAllSettings('seo');

      expect(prisma.setting.findMany).toHaveBeenCalledWith({
        where: { category: 'seo' },
        orderBy: { key: 'asc' },
      });
    });
  });

  describe('findSettingByKey', () => {
    it('should return setting by key', async () => {
      const setting = { id: 's1', key: 'siteTitle', value: 'TalentPro' };
      jest.spyOn(prisma.setting, 'findUnique').mockResolvedValue(setting as never);

      const result = await service.findSettingByKey('siteTitle');

      expect(result).toEqual(setting);
    });

    it('should throw NotFoundException when setting not found', async () => {
      jest.spyOn(prisma.setting, 'findUnique').mockResolvedValue(null);

      await expect(service.findSettingByKey('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('upsertSetting', () => {
    it('should upsert setting with default category', async () => {
      const setting = { id: 's1', key: 'siteTitle', value: 'TalentPro', category: 'general' };
      jest.spyOn(prisma.setting, 'upsert').mockResolvedValue(setting as never);

      const result = await service.upsertSetting({ key: 'siteTitle', value: 'TalentPro' });

      expect(prisma.setting.upsert).toHaveBeenCalledWith({
        where: { key: 'siteTitle' },
        update: { value: 'TalentPro', category: undefined, updatedBy: undefined },
        create: { key: 'siteTitle', value: 'TalentPro', category: 'general', updatedBy: undefined },
      });
      expect(result).toEqual(setting);
    });
  });

  describe('deleteSetting', () => {
    it('should delete setting and return message', async () => {
      jest.spyOn(prisma.setting, 'delete').mockResolvedValue({} as never);

      const result = await service.deleteSetting('siteTitle');

      expect(prisma.setting.delete).toHaveBeenCalledWith({ where: { key: 'siteTitle' } });
      expect(result).toEqual({ message: 'Deleted successfully' });
    });
  });

  describe('getPublicConfig', () => {
    it('should merge settings with config values', async () => {
      const rows = [
        { key: 'sitePhone', value: '400-000-0000' },
        { key: 'copyright', value: '© 2024 TalentPro' },
        { key: 'featureFlags', value: { demo: true } },
        { key: 'hotTags', value: ['HR', 'SaaS'] },
        { key: 'socialLinks', value: [{ name: 'weibo', url: '#' }] },
        { key: 'siteTitle', value: 'TalentPro' },
        { key: 'siteDescription', value: 'Best HR SaaS' },
      ];
      jest.spyOn(prisma.setting, 'findMany').mockResolvedValue(rows as never);

      const result = await service.getPublicConfig();

      expect(prisma.setting.findMany).toHaveBeenCalledWith({
        where: { key: { in: expect.arrayContaining(['sitePhone', 'featureFlags']) } },
      });
      expect(result.recaptchaSiteKey).toBe('recaptcha-site-key');
      expect(result.sentryDsn).toBe('public-sentry-dsn');
      expect(result.sitePhone).toBe('400-000-0000');
      expect(result.hotTags).toEqual(['HR', 'SaaS']);
    });

    it('should normalize non-array list fields and fall back to defaults', async () => {
      jest.spyOn(prisma.setting, 'findMany').mockResolvedValue([]);

      const result = await service.getPublicConfig();

      expect(result.hotTags).toEqual([]);
      expect(result.socialLinks).toEqual([]);
      expect(result.featureFlags).toEqual({});
      expect(result.siteTitle).toBe('');
    });
  });

  describe('findAllAuditLogs', () => {
    it('should return paginated audit logs with filters', async () => {
      const logs = [{ id: 'a1', action: 'UPDATE', resource: 'user' }];
      jest.spyOn(prisma.auditLog, 'findMany').mockResolvedValue(logs as never);
      jest.spyOn(prisma.auditLog, 'count').mockResolvedValue(1);

      const result = await service.findAllAuditLogs(1, 20, { userId: 'u1', resource: 'user' });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          where: { userId: 'u1', resource: 'user' },
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        }),
      );
      expect(result.data).toEqual(logs);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('createAuditLog', () => {
    it('should create audit log with optional values', async () => {
      const log = { id: 'a1', action: 'UPDATE', resource: 'user' };
      jest.spyOn(prisma.auditLog, 'create').mockResolvedValue(log as never);

      const result = await service.createAuditLog({
        userId: 'u1',
        action: 'UPDATE',
        resource: 'user',
        oldValue: { name: 'A' },
        newValue: { name: 'B' },
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'u1',
          action: 'UPDATE',
          resource: 'user',
          oldValue: { name: 'A' },
          newValue: { name: 'B' },
        }),
      });
      expect(result).toEqual(log);
    });
  });

  describe('findAllEmailTemplates', () => {
    it('should return all templates ordered by key', async () => {
      const templates = [{ id: 'e1', key: 'welcome', subject: 'Welcome' }];
      jest.spyOn(prisma.emailTemplate, 'findMany').mockResolvedValue(templates as never);

      const result = await service.findAllEmailTemplates();

      expect(prisma.emailTemplate.findMany).toHaveBeenCalledWith({ orderBy: { key: 'asc' } });
      expect(result).toEqual(templates);
    });
  });

  describe('findEmailTemplateByKey', () => {
    it('should return template by key', async () => {
      const template = { id: 'e1', key: 'welcome' };
      jest.spyOn(prisma.emailTemplate, 'findUnique').mockResolvedValue(template as never);

      const result = await service.findEmailTemplateByKey('welcome');

      expect(result).toEqual(template);
    });

    it('should throw NotFoundException when template not found', async () => {
      jest.spyOn(prisma.emailTemplate, 'findUnique').mockResolvedValue(null);

      await expect(service.findEmailTemplateByKey('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('upsertEmailTemplate', () => {
    it('should upsert email template', async () => {
      const template = { id: 'e1', key: 'welcome', subject: 'Hi', body: 'Hello', html: '<p>Hello</p>' };
      jest.spyOn(prisma.emailTemplate, 'upsert').mockResolvedValue(template as never);

      const result = await service.upsertEmailTemplate({
        key: 'welcome',
        subject: 'Hi',
        body: 'Hello',
        html: '<p>Hello</p>',
      });

      expect(prisma.emailTemplate.upsert).toHaveBeenCalledWith({
        where: { key: 'welcome' },
        update: { subject: 'Hi', body: 'Hello', html: '<p>Hello</p>' },
        create: { key: 'welcome', subject: 'Hi', body: 'Hello', html: '<p>Hello</p>' },
      });
      expect(result).toEqual(template);
    });
  });

  describe('deleteEmailTemplate', () => {
    it('should delete template and return message', async () => {
      jest.spyOn(prisma.emailTemplate, 'delete').mockResolvedValue({} as never);

      const result = await service.deleteEmailTemplate('welcome');

      expect(prisma.emailTemplate.delete).toHaveBeenCalledWith({ where: { key: 'welcome' } });
      expect(result).toEqual({ message: 'Deleted successfully' });
    });
  });

  describe('getChatBotConfig', () => {
    it('should return default fallback when config does not exist', async () => {
      jest.spyOn(prisma.chatBotConfig, 'findUnique').mockResolvedValue(null);

      const result = await service.getChatBotConfig();

      expect(result.key).toBe('default');
      expect(result.intents).toEqual([]);
      expect(result.quickReplies).toEqual([]);
      expect(result.fallbackCopy).toContain('抱歉');
    });

    it('should return existing config', async () => {
      const config = { key: 'default', intents: [{ a: 1 }], quickReplies: ['q1'], fallbackCopy: 'hello' };
      jest.spyOn(prisma.chatBotConfig, 'findUnique').mockResolvedValue(config as never);

      const result = await service.getChatBotConfig();

      expect(result).toEqual(config);
    });
  });

  describe('upsertChatBotConfig', () => {
    it('should upsert chatbot config with normalized arrays', async () => {
      const config = { key: 'default', intents: [], quickReplies: [], fallbackCopy: 'fallback' };
      jest.spyOn(prisma.chatBotConfig, 'upsert').mockResolvedValue(config as never);

      const result = await service.upsertChatBotConfig({ fallbackCopy: 'fallback' });

      expect(prisma.chatBotConfig.upsert).toHaveBeenCalledWith({
        where: { key: 'default' },
        update: { intents: [], quickReplies: [], fallbackCopy: 'fallback' },
        create: { key: 'default', intents: [], quickReplies: [], fallbackCopy: 'fallback' },
      });
      expect(result).toEqual(config);
    });
  });

  describe('findAllSensitiveWords', () => {
    it('should return all sensitive words', async () => {
      const words = [{ id: 'w1', word: 'spam' }];
      jest.spyOn(prisma.sensitiveWord, 'findMany').mockResolvedValue(words as never);

      const result = await service.findAllSensitiveWords();

      expect(prisma.sensitiveWord.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
      expect(result).toEqual(words);
    });
  });

  describe('createSensitiveWord', () => {
    it('should create sensitive word with defaults', async () => {
      const word = { id: 'w1', word: 'spam', category: 'spam', severity: 2 };
      jest.spyOn(prisma.sensitiveWord, 'create').mockResolvedValue(word as never);

      const result = await service.createSensitiveWord({ word: 'spam' });

      expect(prisma.sensitiveWord.create).toHaveBeenCalledWith({
        data: { word: 'spam', category: 'spam', severity: 2 },
      });
      expect(result).toEqual(word);
    });

    it('should create sensitive word with provided category and severity', async () => {
      const word = { id: 'w1', word: 'bad', category: 'political', severity: 5 };
      jest.spyOn(prisma.sensitiveWord, 'create').mockResolvedValue(word as never);

      await service.createSensitiveWord({ word: 'bad', category: 'political', severity: 5 });

      expect(prisma.sensitiveWord.create).toHaveBeenCalledWith({
        data: { word: 'bad', category: 'political', severity: 5 },
      });
    });
  });

  describe('deleteSensitiveWord', () => {
    it('should delete sensitive word and return message', async () => {
      jest.spyOn(prisma.sensitiveWord, 'delete').mockResolvedValue({} as never);

      const result = await service.deleteSensitiveWord('w1');

      expect(prisma.sensitiveWord.delete).toHaveBeenCalledWith({ where: { id: 'w1' } });
      expect(result).toEqual({ message: 'Deleted successfully' });
    });
  });

  describe('testModeration', () => {
    it('should return autoApprove true for clean content', async () => {
      jest.spyOn(prisma.sensitiveWord, 'findMany').mockResolvedValue([]);

      const result = await service.testModeration('This is a normal post.');

      expect(result.autoApprove).toBe(true);
      expect(result.riskScore).toBe(0);
      expect(result.flags).toEqual([]);
    });

    it('should flag sensitive words', async () => {
      jest.spyOn(prisma.sensitiveWord, 'findMany').mockResolvedValue([
        { id: 'w1', word: 'badword', category: 'spam', severity: 2, isActive: true },
      ] as never);

      const result = await service.testModeration('This contains badword content.');

      expect(result.flags).toContain('spam');
      expect(result.riskScore).toBeGreaterThan(0);
      expect(result.autoApprove).toBe(false);
    });

    it('should flag spam patterns', async () => {
      jest.spyOn(prisma.sensitiveWord, 'findMany').mockResolvedValue([]);

      const result = await service.testModeration('加我微信：abc123');

      expect(result.flags).toContain('spam');
      expect(result.autoApprove).toBe(false);
    });
  });
});
