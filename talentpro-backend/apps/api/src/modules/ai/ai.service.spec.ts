import { Test, TestingModule } from '@nestjs/testing';
import { Subject } from 'rxjs';
import { AiService } from './ai.service';
import { AiRagService } from './ai-rag.service';
import { AiPromptService } from './ai-prompt.service';
import { LlmProviderFactory } from './ai-provider.factory';
import { PrismaService } from '@/common/prisma/prisma.service';
import { MediaService } from '@/modules/media/media.service';
import { ChatMessage, StreamEvent } from './ai.types';

describe('AiService', () => {
  let service: AiService;
  let ragService: AiRagService;
  let promptService: AiPromptService;
  let providerFactory: LlmProviderFactory;
  let prisma: PrismaService;
  let mediaService: MediaService;
  let llmMock: {
    isConfigured: jest.Mock;
    chat: jest.Mock;
    stream: jest.Mock;
    moderateContent: jest.Mock;
    generateImage: jest.Mock;
    name: string;
  };

  const createConfiguredLlm = () => ({
    name: 'openai',
    isConfigured: jest.fn().mockReturnValue(true),
    chat: jest.fn().mockResolvedValue({ content: 'LLM reply' }),
    stream: jest.fn().mockResolvedValue(undefined),
    moderateContent: jest.fn().mockResolvedValue({ riskScore: 0.1, flags: [] }),
    generateImage: jest.fn().mockResolvedValue({ url: 'https://example.com/image.png', revisedPrompt: 'revised' }),
  });

  const createUnconfiguredLlm = () => ({
    name: 'openai',
    isConfigured: jest.fn().mockReturnValue(false),
    chat: jest.fn(),
    stream: jest.fn(),
    moderateContent: jest.fn(),
    generateImage: jest.fn().mockResolvedValue({
      url: 'https://placehold.co/1024x576?text=AI+Image',
      revisedPrompt: 'prompt',
    }),
  });

  beforeEach(async () => {
    llmMock = createUnconfiguredLlm();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: AiRagService,
          useValue: { retrieveContext: jest.fn().mockResolvedValue(['ctx1']) },
        },
        {
          provide: AiPromptService,
          useValue: { buildSystemPrompt: jest.fn().mockResolvedValue('system') },
        },
        {
          provide: LlmProviderFactory,
          useValue: {
            getActiveProvider: jest.fn().mockReturnValue(llmMock),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            aiChatSession: { findUnique: jest.fn(), upsert: jest.fn() },
          },
        },
        {
          provide: MediaService,
          useValue: {
            createFromBuffer: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    ragService = module.get<AiRagService>(AiRagService);
    promptService = module.get<AiPromptService>(AiPromptService);
    providerFactory = module.get<LlmProviderFactory>(LlmProviderFactory);
    prisma = module.get<PrismaService>(PrismaService);
    mediaService = module.get<MediaService>(MediaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('chat', () => {
    it('should use LLM when configured', async () => {
      llmMock = createConfiguredLlm();
      (providerFactory.getActiveProvider as jest.Mock).mockReturnValue(llmMock);

      const result = await service.chat('hi', [{ role: 'user', content: 'prev' }], 'en');

      expect(ragService.retrieveContext).toHaveBeenCalledWith('hi');
      expect(promptService.buildSystemPrompt).toHaveBeenCalledWith(['ctx1'], 'en');
      expect(llmMock.chat).toHaveBeenCalledWith([
        { role: 'system', content: 'system' },
        { role: 'user', content: 'prev' },
        { role: 'user', content: 'hi' },
      ]);
      expect(result).toEqual({ content: 'LLM reply' });
    });

    it('should fall back when LLM is not configured', async () => {
      (ragService.retrieveContext as jest.Mock).mockResolvedValue([]);
      const result = await service.chat('多少钱');

      expect(llmMock.chat).not.toHaveBeenCalled();
      expect(result.content).toContain('定价');
    });
  });

  describe('moderateContent', () => {
    it('should return autoApprove true when LLM is not configured', async () => {
      const result = await service.moderateContent('text');

      expect(result).toEqual({ riskScore: 0, flags: [], autoApprove: true });
    });

    it('should compute autoApprove from LLM result', async () => {
      llmMock = createConfiguredLlm();
      llmMock.moderateContent.mockResolvedValue({ riskScore: 0.5, flags: ['hate'] });
      (providerFactory.getActiveProvider as jest.Mock).mockReturnValue(llmMock);

      const result = await service.moderateContent('bad');

      expect(result.autoApprove).toBe(false);
    });

    it('should auto approve when risk and flags are low', async () => {
      llmMock = createConfiguredLlm();
      llmMock.moderateContent.mockResolvedValue({ riskScore: 0.1, flags: [] });
      (providerFactory.getActiveProvider as jest.Mock).mockReturnValue(llmMock);

      const result = await service.moderateContent('ok');

      expect(result.autoApprove).toBe(true);
    });
  });

  describe('generateContent', () => {
    it('should use LLM when configured for blog', async () => {
      llmMock = createConfiguredLlm();
      (providerFactory.getActiveProvider as jest.Mock).mockReturnValue(llmMock);

      const result = await service.generateContent({ type: 'blog', prompt: 'AI', language: 'en', tone: 'friendly' });

      expect(llmMock.chat).toHaveBeenCalledWith([expect.objectContaining({ role: 'user', content: expect.stringContaining('AI') })]);
      expect(result).toEqual(expect.objectContaining({ type: 'blog', content: 'LLM reply' }));
    });

    it('should use LLM when configured for product', async () => {
      llmMock = createConfiguredLlm();
      (providerFactory.getActiveProvider as jest.Mock).mockReturnValue(llmMock);

      await service.generateContent({ type: 'product', content: 'Smart Payroll' });

      expect(llmMock.chat).toHaveBeenCalledWith([expect.objectContaining({ role: 'user', content: expect.stringContaining('Smart Payroll') })]);
    });

    it('should use LLM when configured for seo', async () => {
      llmMock = createConfiguredLlm();
      (providerFactory.getActiveProvider as jest.Mock).mockReturnValue(llmMock);

      await service.generateContent({ type: 'seo', prompt: 'HR digital' });

      expect(llmMock.chat).toHaveBeenCalledWith([expect.objectContaining({ role: 'user', content: expect.stringContaining('HR digital') })]);
    });

    it('should use LLM when configured for translate', async () => {
      llmMock = createConfiguredLlm();
      (providerFactory.getActiveProvider as jest.Mock).mockReturnValue(llmMock);

      await service.generateContent({ type: 'translate', content: 'Hello' });

      expect(llmMock.chat).toHaveBeenCalledWith([expect.objectContaining({ role: 'user', content: expect.stringContaining('Hello') })]);
    });

    it('should use LLM when configured for moderate', async () => {
      llmMock = createConfiguredLlm();
      (providerFactory.getActiveProvider as jest.Mock).mockReturnValue(llmMock);

      await service.generateContent({ type: 'moderate', content: 'check' });

      expect(llmMock.chat).toHaveBeenCalledWith([expect.objectContaining({ role: 'user', content: expect.stringContaining('check') })]);
    });

    it('should use LLM default prompt for unknown type', async () => {
      llmMock = createConfiguredLlm();
      (providerFactory.getActiveProvider as jest.Mock).mockReturnValue(llmMock);

      await service.generateContent({ type: 'unknown' } as unknown as { type: string; prompt?: string });

      expect(llmMock.chat).toHaveBeenCalledWith([expect.objectContaining({ role: 'user' })]);
    });

    it('should generate fallback blog content', async () => {
      const result = await service.generateContent({ type: 'blog', prompt: 'AI 招聘' }) as Record<string, unknown>;
      expect(result.type).toBe('blog');
      expect(result.title).toContain('AI 招聘');
      expect(result.content).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should generate fallback product content', async () => {
      const result = await service.generateContent({ type: 'product', prompt: '智能薪酬' }) as Record<string, unknown>;
      expect(result.type).toBe('product');
      expect(result.features).toBeInstanceOf(Array);
      expect(result.scenarios).toBeInstanceOf(Array);
    });

    it('should generate fallback seo content', async () => {
      const result = await service.generateContent({ type: 'seo', prompt: 'HR 数字化' }) as Record<string, unknown>;
      expect(result.type).toBe('seo');
      expect(result.keywords).toBeInstanceOf(Array);
    });

    it('should generate fallback translation', async () => {
      const result = await service.generateContent({ type: 'translate', content: 'Hello' }) as Record<string, unknown>;
      expect(result.type).toBe('translate');
      expect(result.translation).toBeDefined();
    });

    it('should generate fallback moderation', async () => {
      const result = await service.generateContent({ type: 'moderate', content: '正常内容' }) as Record<string, unknown>;
      expect(result.type).toBe('moderate');
      expect(result.moderated).toBe(true);
    });

    it('should generate fallback for unknown type', async () => {
      const result = await service.generateContent({ type: 'unknown' } as unknown as { type: string; prompt?: string });

      expect(result).toEqual(expect.objectContaining({ type: 'unknown', content: 'TalentPro 一体化 HR SaaS 平台' }));
    });

    it('should apply default parameters', async () => {
      const result = await service.generateContent({ type: 'blog' });

      expect(result).toEqual(expect.objectContaining({ type: 'blog', language: 'zh', tone: '专业' }));
    });
  });

  describe('generateImage', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(Buffer.from('image-data').buffer),
      }) as unknown as typeof fetch;
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('should persist media when LLM is configured', async () => {
      llmMock = createConfiguredLlm();
      (providerFactory.getActiveProvider as jest.Mock).mockReturnValue(llmMock);
      (mediaService.createFromBuffer as jest.Mock).mockResolvedValue({
        id: 'm1',
        url: '/uploads/ai-image.png',
      });

      const result = await service.generateImage({ prompt: 'a cat', userId: 'u1' });

      expect(llmMock.generateImage).toHaveBeenCalledWith('a cat', {});
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/image.png');
      expect(mediaService.createFromBuffer).toHaveBeenCalledWith(
        expect.objectContaining({
          mimeType: 'image/png',
          createdBy: 'u1',
          alt: 'a cat',
        }),
      );
      expect(result).toEqual({
        url: '/uploads/ai-image.png',
        revisedPrompt: 'revised',
        mediaId: 'm1',
      });
    });

    it('should pass size/quality/style options to LLM', async () => {
      llmMock = createConfiguredLlm();
      (providerFactory.getActiveProvider as jest.Mock).mockReturnValue(llmMock);
      (mediaService.createFromBuffer as jest.Mock).mockResolvedValue({
        id: 'm2',
        url: '/uploads/ai-image-2.png',
      });

      await service.generateImage({
        prompt: 'a dog',
        size: '512x512',
        quality: 'hd',
        style: 'natural',
        userId: 'u1',
      });

      expect(llmMock.generateImage).toHaveBeenCalledWith('a dog', {
        size: '512x512',
        quality: 'hd',
        style: 'natural',
      });
    });

    it('should return placeholder and skip persistence when LLM is not configured', async () => {
      const result = await service.generateImage({ prompt: 'a cat', userId: 'u1' });

      expect(result).toEqual({
        url: 'https://placehold.co/1024x576?text=AI+Image',
        revisedPrompt: 'prompt',
      });
      expect(global.fetch).not.toHaveBeenCalled();
      expect(mediaService.createFromBuffer).not.toHaveBeenCalled();
    });

    it('should throw when image download fails', async () => {
      llmMock = createConfiguredLlm();
      (providerFactory.getActiveProvider as jest.Mock).mockReturnValue(llmMock);
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        arrayBuffer: jest.fn(),
      });

      await expect(service.generateImage({ prompt: 'a cat', userId: 'u1' })).rejects.toThrow(
        'Failed to download generated image: 404',
      );
    });
  });

  describe('adminChat', () => {
    it('should call LLM with configuration assistant system prompt', async () => {
      llmMock = createConfiguredLlm();
      (providerFactory.getActiveProvider as jest.Mock).mockReturnValue(llmMock);
      const context = { page: 'home', sections: ['hero'] };

      const result = await service.adminChat('生成 hero 标题', [{ role: 'user', content: 'hi' }], context, 'zh');

      expect(llmMock.chat).toHaveBeenCalledWith([
        expect.objectContaining({
          role: 'system',
          content: expect.stringContaining('TalentPro 门户配置助手'),
        }),
        { role: 'user', content: 'hi' },
        { role: 'user', content: '生成 hero 标题' },
      ]);
      expect(result).toEqual({ content: 'LLM reply' });
    });

    it('should include context in system prompt when provided', async () => {
      llmMock = createConfiguredLlm();
      (providerFactory.getActiveProvider as jest.Mock).mockReturnValue(llmMock);
      const context = { page: 'home' };

      await service.adminChat('help', [], context);

      expect(llmMock.chat).toHaveBeenCalledWith([
        expect.objectContaining({
          role: 'system',
          content: expect.stringContaining('"page": "home"'),
        }),
        { role: 'user', content: 'help' },
      ]);
    });

    it('should fallback when LLM is not configured', async () => {
      const result = await service.adminChat('help');

      expect(llmMock.chat).not.toHaveBeenCalled();
      expect(result.content).toContain('AI 助手暂未配置');
    });
  });

  describe('loadChatSession', () => {
    it('should return empty array when sessionId is empty', async () => {
      const result = await service.loadChatSession('');
      expect(result).toEqual([]);
      expect(prisma.aiChatSession.findUnique).not.toHaveBeenCalled();
    });

    it('should return last 20 messages', async () => {
      const messages: ChatMessage[] = Array.from({ length: 25 }, (_, i) => ({ role: 'user', content: `m${i}` }));
      (prisma.aiChatSession.findUnique as jest.Mock).mockResolvedValue({ sessionId: 's1', messages: messages as unknown as object });

      const result = await service.loadChatSession('s1');

      expect(result.length).toBe(20);
      expect(result[0].content).toBe('m5');
    });

    it('should return empty array when session not found', async () => {
      (prisma.aiChatSession.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.loadChatSession('s1');

      expect(result).toEqual([]);
    });

    it('should return empty array when messages is not an array', async () => {
      (prisma.aiChatSession.findUnique as jest.Mock).mockResolvedValue({ sessionId: 's1', messages: 'bad' });

      const result = await service.loadChatSession('s1');

      expect(result).toEqual([]);
    });

    it('should catch errors and return empty array', async () => {
      (prisma.aiChatSession.findUnique as jest.Mock).mockRejectedValue(new Error('db'));

      const result = await service.loadChatSession('s1');

      expect(result).toEqual([]);
    });
  });

  describe('appendChatMessage', () => {
    it('should do nothing when sessionId is empty', async () => {
      await service.appendChatMessage('', 'user', 'hi');
      expect(prisma.aiChatSession.findUnique).not.toHaveBeenCalled();
    });

    it('should create session when none exists', async () => {
      (prisma.aiChatSession.findUnique as jest.Mock).mockResolvedValue(null);

      await service.appendChatMessage('s1', 'user', 'hi');

      expect(prisma.aiChatSession.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { sessionId: 's1' },
          create: expect.objectContaining({ sessionId: 's1' }),
          update: expect.objectContaining({
            messages: [{ role: 'user', content: 'hi' }],
          }),
        }),
      );
    });

    it('should append to existing messages', async () => {
      (prisma.aiChatSession.findUnique as jest.Mock).mockResolvedValue({
        sessionId: 's1',
        messages: [{ role: 'user', content: 'hi' }],
      });

      await service.appendChatMessage('s1', 'assistant', 'reply');

      expect(prisma.aiChatSession.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            messages: [{ role: 'user', content: 'hi' }, { role: 'assistant', content: 'reply' }],
          }),
        }),
      );
    });

    it('should catch errors silently', async () => {
      (prisma.aiChatSession.findUnique as jest.Mock).mockRejectedValue(new Error('db'));

      await expect(service.appendChatMessage('s1', 'user', 'hi')).resolves.toBeUndefined();
    });
  });

  describe('chatStream', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should stream fallback chunks when LLM is not configured', async () => {
      (ragService.retrieveContext as jest.Mock).mockResolvedValue([]);
      (promptService.buildSystemPrompt as jest.Mock).mockResolvedValue('system');

      const events: StreamEvent[] = [];
      const complete = jest.fn();
      const error = jest.fn();
      const sub = service.chatStream('hello world this is a test message');
      sub.subscribe({
        next: (v) => events.push(v),
        complete,
        error,
      });

      await jest.runAllTimersAsync();

      expect(events.some((e) => e.data.includes('chunk'))).toBe(true);
      expect(events.some((e) => e.data.includes('done'))).toBe(true);
      expect(complete).toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it('should persist user message when sessionId provided and LLM unconfigured', async () => {
      (ragService.retrieveContext as jest.Mock).mockResolvedValue([]);
      const appendSpy = jest.spyOn(service, 'appendChatMessage').mockResolvedValue(undefined);

      const sub = service.chatStream('hi', [], 's1');
      sub.subscribe();

      await jest.runAllTimersAsync();

      expect(appendSpy).toHaveBeenCalledWith('s1', 'user', 'hi');

      appendSpy.mockRestore();
    });

    it('should error when fallback chat fails', async () => {
      const chatSpy = jest.spyOn(service, 'chat').mockRejectedValue(new Error('chat fail'));
      const error = jest.fn();

      const sub = service.chatStream('hi');
      sub.subscribe({ error });

      await jest.runAllTimersAsync();

      expect(error).toHaveBeenCalledWith(expect.any(Error));
      chatSpy.mockRestore();
    });

    it('should use LLM stream when configured', async () => {
      llmMock = createConfiguredLlm();
      (providerFactory.getActiveProvider as jest.Mock).mockReturnValue(llmMock);
      (ragService.retrieveContext as jest.Mock).mockResolvedValue([]);

      const events: StreamEvent[] = [];
      const sub = service.chatStream('hi');
      sub.subscribe({ next: (v) => events.push(v) });

      await jest.runAllTimersAsync();

      expect(llmMock.stream).toHaveBeenCalled();
    });

    it('should persist assistant text from LLM stream when sessionId provided', async () => {
      llmMock = createConfiguredLlm();
      llmMock.stream.mockImplementation(async (_messages: ChatMessage[], subject: Subject<StreamEvent>) => {
        subject.next({ data: JSON.stringify({ chunk: 'hello' }) });
        subject.next({ data: JSON.stringify({ chunk: ' world' }) });
        subject.next({ data: JSON.stringify({ done: true }) });
        subject.complete();
      });
      (providerFactory.getActiveProvider as jest.Mock).mockReturnValue(llmMock);
      (ragService.retrieveContext as jest.Mock).mockResolvedValue([]);

      const appendSpy = jest.spyOn(service, 'appendChatMessage').mockResolvedValue(undefined);

      const events: StreamEvent[] = [];
      const sub = service.chatStream('hi', [], 's1');
      sub.subscribe({ next: (v) => events.push(v) });

      await jest.runAllTimersAsync();

      expect(appendSpy).toHaveBeenCalledWith('s1', 'assistant', 'hello world');
      appendSpy.mockRestore();
    });

    it('should emit parse errors silently when collecting assistant text', async () => {
      llmMock = createConfiguredLlm();
      llmMock.stream.mockImplementation(async (_messages: ChatMessage[], subject: Subject<StreamEvent>) => {
        subject.next({ data: 'not-json' });
        subject.next({ data: JSON.stringify({ chunk: 'ok' }) });
        subject.complete();
      });
      (providerFactory.getActiveProvider as jest.Mock).mockReturnValue(llmMock);
      (ragService.retrieveContext as jest.Mock).mockResolvedValue([]);

      const appendSpy = jest.spyOn(service, 'appendChatMessage').mockResolvedValue(undefined);

      const sub = service.chatStream('hi', [], 's1');
      sub.subscribe();

      await jest.runAllTimersAsync();

      expect(appendSpy).toHaveBeenCalledWith('s1', 'assistant', 'ok');
      appendSpy.mockRestore();
    });

    it('should error when retrieveContext fails in configured stream', async () => {
      llmMock = createConfiguredLlm();
      (providerFactory.getActiveProvider as jest.Mock).mockReturnValue(llmMock);
      (ragService.retrieveContext as jest.Mock).mockRejectedValue(new Error('rag fail'));

      const error = jest.fn();
      const sub = service.chatStream('hi');
      sub.subscribe({ error });

      await jest.runAllTimersAsync();

      expect(error).toHaveBeenCalledWith(expect.any(Error));
    });

  });

  describe('fallbackResponse', () => {
    it('should answer price question', async () => {
      const result = await service.chat('多少钱', []);
      expect(result.content).toContain('定价');
    });

    it('should answer demo question', async () => {
      const result = await service.chat('演示', []);
      expect(result.content).toContain('预约演示');
    });

    it('should answer recruitment question', async () => {
      (ragService.retrieveContext as jest.Mock).mockResolvedValue(['ctx1', 'ctx2']);
      const result = await service.chat('招聘');
      expect(result.content).toContain('招聘管理');
    });

    it('should answer salary question', async () => {
      const result = await service.chat('薪酬');
      expect(result.content).toContain('薪酬管理');
    });

    it('should answer generic question with contexts', async () => {
      (ragService.retrieveContext as jest.Mock).mockResolvedValue(['info']);
      const result = await service.chat('hello');
      expect(result.content).toContain('info');
    });

    it('should answer generic question without contexts', async () => {
      const result = await service.chat('hello', []);
      expect(result.content).toContain('TalentPro AI 助手');
    });
  });
});
