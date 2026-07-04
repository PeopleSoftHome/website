import { Test, TestingModule } from '@nestjs/testing';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { UpsertEmailTemplateDto } from './dto/upsert-email-template.dto';
import { CreateSensitiveWordDto } from './dto/create-sensitive-word.dto';
import { TestModerationDto } from './dto/test-moderation.dto';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

describe('SystemController', () => {
  let controller: SystemController;
  let systemService: SystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemController],
      providers: [
        {
          provide: SystemService,
          useValue: {
            findAllSettings: jest.fn(),
            findSettingByKey: jest.fn(),
            upsertSetting: jest.fn(),
            deleteSetting: jest.fn(),
            getPublicConfig: jest.fn(),
            findAllAuditLogs: jest.fn(),
            createAuditLog: jest.fn(),
            findAllEmailTemplates: jest.fn(),
            findEmailTemplateByKey: jest.fn(),
            upsertEmailTemplate: jest.fn(),
            deleteEmailTemplate: jest.fn(),
            findAllSensitiveWords: jest.fn(),
            createSensitiveWord: jest.fn(),
            deleteSensitiveWord: jest.fn(),
            testModeration: jest.fn(),
            getChatBotConfig: jest.fn(),
            upsertChatBotConfig: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SystemController>(SystemController);
    systemService = module.get<SystemService>(SystemService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Settings', () => {
    it('findAllSettings should delegate to service', async () => {
      const expected = { data: [], mapped: {} };
      jest.spyOn(systemService, 'findAllSettings').mockResolvedValue(expected);

      const result = await controller.findAllSettings('general');

      expect(systemService.findAllSettings).toHaveBeenCalledWith('general');
      expect(result).toEqual(expected);
    });

    it('findSettingByKey should delegate to service', async () => {
      const expected = { key: 'siteTitle', value: 'TalentPro' };
      jest.spyOn(systemService, 'findSettingByKey').mockResolvedValue(expected as never);

      const result = await controller.findSettingByKey('siteTitle');

      expect(systemService.findSettingByKey).toHaveBeenCalledWith('siteTitle');
      expect(result).toEqual(expected);
    });

    it('upsertSetting should delegate to service', async () => {
      const dto: UpsertSettingDto = { key: 'siteTitle', value: 'TalentPro', category: 'general' };
      const expected = { id: 's1', ...dto };
      jest.spyOn(systemService, 'upsertSetting').mockResolvedValue(expected as never);

      const result = await controller.upsertSetting(dto);

      expect(systemService.upsertSetting).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });

    it('deleteSetting should delegate to service', async () => {
      const expected = { message: 'Deleted successfully' };
      jest.spyOn(systemService, 'deleteSetting').mockResolvedValue(expected);

      const result = await controller.deleteSetting('siteTitle');

      expect(systemService.deleteSetting).toHaveBeenCalledWith('siteTitle');
      expect(result).toEqual(expected);
    });

    it('getPublicConfig should delegate to service', async () => {
      const expected = { siteTitle: 'TalentPro' };
      jest.spyOn(systemService, 'getPublicConfig').mockResolvedValue(expected as never);

      const result = await controller.getPublicConfig();

      expect(systemService.getPublicConfig).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('AuditLogs', () => {
    it('findAllAuditLogs should pass pagination and filters', async () => {
      const expected = { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };
      jest.spyOn(systemService, 'findAllAuditLogs').mockResolvedValue(expected);

      const result = await controller.findAllAuditLogs({ page: 1, pageSize: 20 }, 'u1', 'user');

      expect(systemService.findAllAuditLogs).toHaveBeenCalledWith(1, 20, { userId: 'u1', resource: 'user' });
      expect(result).toEqual(expected);
    });

    it('createAuditLog should delegate to service', async () => {
      const dto: CreateAuditLogDto = { action: 'UPDATE', resource: 'user' };
      const expected = { id: 'a1', ...dto };
      jest.spyOn(systemService, 'createAuditLog').mockResolvedValue(expected as never);

      const result = await controller.createAuditLog(dto);

      expect(systemService.createAuditLog).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('EmailTemplates', () => {
    it('findAllEmailTemplates should delegate to service', async () => {
      const expected = [{ id: 'e1', key: 'welcome' }];
      jest.spyOn(systemService, 'findAllEmailTemplates').mockResolvedValue(expected as never);

      const result = await controller.findAllEmailTemplates();

      expect(systemService.findAllEmailTemplates).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });

    it('findEmailTemplateByKey should delegate to service', async () => {
      const expected = { id: 'e1', key: 'welcome' };
      jest.spyOn(systemService, 'findEmailTemplateByKey').mockResolvedValue(expected as never);

      const result = await controller.findEmailTemplateByKey('welcome');

      expect(systemService.findEmailTemplateByKey).toHaveBeenCalledWith('welcome');
      expect(result).toEqual(expected);
    });

    it('upsertEmailTemplate should delegate to service', async () => {
      const dto: UpsertEmailTemplateDto = { key: 'welcome', subject: 'Hi', body: 'Hello' };
      const expected = { id: 'e1', ...dto };
      jest.spyOn(systemService, 'upsertEmailTemplate').mockResolvedValue(expected as never);

      const result = await controller.upsertEmailTemplate(dto);

      expect(systemService.upsertEmailTemplate).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });

    it('deleteEmailTemplate should delegate to service', async () => {
      const expected = { message: 'Deleted successfully' };
      jest.spyOn(systemService, 'deleteEmailTemplate').mockResolvedValue(expected);

      const result = await controller.deleteEmailTemplate('welcome');

      expect(systemService.deleteEmailTemplate).toHaveBeenCalledWith('welcome');
      expect(result).toEqual(expected);
    });
  });

  describe('SensitiveWords', () => {
    it('findAllSensitiveWords should delegate to service', async () => {
      const expected = [{ id: 'w1', word: 'spam' }];
      jest.spyOn(systemService, 'findAllSensitiveWords').mockResolvedValue(expected as never);

      const result = await controller.findAllSensitiveWords();

      expect(systemService.findAllSensitiveWords).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });

    it('createSensitiveWord should delegate to service', async () => {
      const dto: CreateSensitiveWordDto = { word: 'spam' };
      const expected = { id: 'w1', ...dto };
      jest.spyOn(systemService, 'createSensitiveWord').mockResolvedValue(expected as never);

      const result = await controller.createSensitiveWord(dto);

      expect(systemService.createSensitiveWord).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });

    it('deleteSensitiveWord should delegate to service', async () => {
      const expected = { message: 'Deleted successfully' };
      jest.spyOn(systemService, 'deleteSensitiveWord').mockResolvedValue(expected);

      const result = await controller.deleteSensitiveWord('w1');

      expect(systemService.deleteSensitiveWord).toHaveBeenCalledWith('w1');
      expect(result).toEqual(expected);
    });

    it('testModeration should delegate to service', async () => {
      const dto: TestModerationDto = { content: 'test' };
      const expected = { riskScore: 0, flags: [], autoApprove: true };
      jest.spyOn(systemService, 'testModeration').mockResolvedValue(expected);

      const result = await controller.testModeration(dto);

      expect(systemService.testModeration).toHaveBeenCalledWith('test');
      expect(result).toEqual(expected);
    });
  });

  describe('ChatBotConfig', () => {
    it('getChatBotConfig should delegate to service', async () => {
      const expected = { key: 'default', intents: [] };
      jest.spyOn(systemService, 'getChatBotConfig').mockResolvedValue(expected as never);

      const result = await controller.getChatBotConfig();

      expect(systemService.getChatBotConfig).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });

    it('upsertChatBotConfig should delegate to service', async () => {
      const dto = { intents: [{ a: 1 }], quickReplies: ['q1'], fallbackCopy: 'hello' };
      const expected = { key: 'default', ...dto };
      jest.spyOn(systemService, 'upsertChatBotConfig').mockResolvedValue(expected as never);

      const result = await controller.upsertChatBotConfig(dto);

      expect(systemService.upsertChatBotConfig).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });
});
