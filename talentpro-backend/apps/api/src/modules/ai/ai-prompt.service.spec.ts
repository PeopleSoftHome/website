import { Test, TestingModule } from '@nestjs/testing';
import { AiPromptService } from './ai-prompt.service';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('AiPromptService', () => {
  let service: AiPromptService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiPromptService,
        {
          provide: PrismaService,
          useValue: {
            setting: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AiPromptService>(AiPromptService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildSystemPrompt', () => {
    it('should return base prompt only when contexts are empty', async () => {
      (prisma.setting.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.buildSystemPrompt([], 'zh');

      expect(result).toContain('TalentPro AI 助手');
      expect(prisma.setting.findUnique).toHaveBeenCalledWith({ where: { key: 'ai.base_prompt' } });
    });

    it('should append contexts when provided', async () => {
      (prisma.setting.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.buildSystemPrompt(['ctx1', 'ctx2'], 'zh');

      expect(result).toContain('ctx1');
      expect(result).toContain('ctx2');
      expect(result).toContain('---');
    });

    it('should use zh key for default locale', async () => {
      (prisma.setting.findUnique as jest.Mock).mockResolvedValue({ value: 'zh prompt' });

      const result = await service.buildSystemPrompt([], 'zh');

      expect(result).toBe('zh prompt');
      expect(prisma.setting.findUnique).toHaveBeenCalledWith({ where: { key: 'ai.base_prompt' } });
    });

    it('should use locale-specific key for non-zh locale', async () => {
      (prisma.setting.findUnique as jest.Mock).mockResolvedValue({ value: 'en prompt' });

      const result = await service.buildSystemPrompt([], 'en');

      expect(result).toBe('en prompt');
      expect(prisma.setting.findUnique).toHaveBeenCalledWith({ where: { key: 'ai.base_prompt_en' } });
    });

    it('should use string setting value', async () => {
      (prisma.setting.findUnique as jest.Mock).mockResolvedValue({ value: 'custom prompt' });

      const result = await service.buildSystemPrompt([], 'zh');

      expect(result).toBe('custom prompt');
    });

    it('should extract text from object setting value', async () => {
      (prisma.setting.findUnique as jest.Mock).mockResolvedValue({ value: { text: 'object prompt' } });

      const result = await service.buildSystemPrompt([], 'zh');

      expect(result).toBe('object prompt');
    });

    it('should ignore whitespace-only string value', async () => {
      (prisma.setting.findUnique as jest.Mock).mockResolvedValue({ value: '   ' });

      const result = await service.buildSystemPrompt([], 'zh');

      expect(result).toContain('TalentPro AI 助手');
    });

    it('should fall back to default prompt when setting is null', async () => {
      (prisma.setting.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.buildSystemPrompt([], 'zh');

      expect(result).toContain('TalentPro AI 助手');
    });

    it('should fall back to default prompt when prisma throws', async () => {
      (prisma.setting.findUnique as jest.Mock).mockRejectedValue(new Error('db down'));

      const result = await service.buildSystemPrompt([], 'zh');

      expect(result).toContain('TalentPro AI 助手');
    });
  });
});
