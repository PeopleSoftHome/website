import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { AiRagService } from './ai-rag.service';
import { AiPromptService } from './ai-prompt.service';
import { LlmProviderFactory } from './ai-provider.factory';
import { PrismaService } from '@/common/prisma/prisma.service';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: AiRagService,
          useValue: { retrieveContext: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: AiPromptService,
          useValue: { buildSystemPrompt: jest.fn().mockReturnValue('system') },
        },
        {
          provide: LlmProviderFactory,
          useValue: {
            getActiveProvider: jest.fn().mockReturnValue({
              isConfigured: jest.fn().mockReturnValue(false),
              chat: jest.fn(),
              stream: jest.fn(),
              moderateContent: jest.fn(),
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            aiChatSession: { findUnique: jest.fn(), upsert: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should generate fallback blog content', async () => {
    const result: any = await service.generateContent({ type: 'blog', prompt: 'AI 招聘' });

    expect(result.type).toBe('blog');
    expect(result.title).toContain('AI 招聘');
    expect(result.content).toBeDefined();
    expect(result.summary).toBeDefined();
  });

  it('should generate fallback product content', async () => {
    const result: any = await service.generateContent({ type: 'product', prompt: '智能薪酬' });

    expect(result.type).toBe('product');
    expect(result.features).toBeInstanceOf(Array);
    expect(result.scenarios).toBeInstanceOf(Array);
  });

  it('should generate fallback seo content', async () => {
    const result: any = await service.generateContent({ type: 'seo', prompt: 'HR 数字化' });

    expect(result.type).toBe('seo');
    expect(result.keywords).toBeInstanceOf(Array);
  });

  it('should generate fallback translation', async () => {
    const result: any = await service.generateContent({ type: 'translate', content: 'Hello' });

    expect(result.type).toBe('translate');
    expect(result.translation).toBeDefined();
  });

  it('should generate fallback moderation', async () => {
    const result: any = await service.generateContent({ type: 'moderate', content: '正常内容' });

    expect(result.type).toBe('moderate');
    expect(result.moderated).toBe(true);
  });
});
