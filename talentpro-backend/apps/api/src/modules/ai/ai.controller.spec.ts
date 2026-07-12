import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiGenerateType } from './dto/ai-generate.dto';
import { RolesGuard } from '@shared/guards';
import { of } from 'rxjs';

describe('AiController', () => {
  let controller: AiController;
  let aiService: AiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: {
            chat: jest.fn(),
            chatStream: jest.fn(),
            generateContent: jest.fn(),
            loadChatSession: jest.fn(),
            appendChatMessage: jest.fn(),
            generateImage: jest.fn(),
            adminChat: jest.fn(),
            getProviderStatus: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
        {
          provide: RolesGuard,
          useValue: { canActivate: jest.fn(() => true) },
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    aiService = module.get<AiService>(AiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /ai/chat', () => {
    it('should use provided sessionId and history', async () => {
      (aiService.chat as jest.Mock).mockResolvedValue({ content: 'reply' });

      const result = await controller.chat({
        message: 'hi',
        history: [{ role: 'user', content: 'prev' }],
        sessionId: 's1',
      });

      expect(aiService.chat).toHaveBeenCalledWith('hi', [{ role: 'user', content: 'prev' }]);
      expect(aiService.loadChatSession).not.toHaveBeenCalled();
      expect(aiService.appendChatMessage).toHaveBeenCalledWith('s1', 'user', 'hi');
      expect(aiService.appendChatMessage).toHaveBeenCalledWith('s1', 'assistant', 'reply');
      expect(result).toEqual({ content: 'reply', sessionId: 's1' });
    });

    it('should generate sessionId and load history when not provided', async () => {
      (aiService.chat as jest.Mock).mockResolvedValue({ content: 'reply' });
      (aiService.loadChatSession as jest.Mock).mockResolvedValue([{ role: 'user', content: 'old' }]);

      const result = await controller.chat({ message: 'hi' });

      expect(aiService.loadChatSession).toHaveBeenCalled();
      expect(aiService.chat).toHaveBeenCalledWith('hi', [{ role: 'user', content: 'old' }]);
      expect(result.sessionId).toBeDefined();
      expect(result.content).toBe('reply');
    });

    it('should prefer provided history over loaded history', async () => {
      (aiService.chat as jest.Mock).mockResolvedValue({ content: 'reply' });

      await controller.chat({ message: 'hi', history: [{ role: 'user', content: 'new' }] });

      expect(aiService.loadChatSession).not.toHaveBeenCalled();
      expect(aiService.chat).toHaveBeenCalledWith('hi', [{ role: 'user', content: 'new' }]);
    });
  });

  describe('POST /ai/chat-stream', () => {
    it('should call chatStream with sessionId and history', () => {
      (aiService.chatStream as jest.Mock).mockReturnValue(of({ data: '{}' }));

      const result = controller.chatStream({ message: 'hi', recaptchaToken: 'token', history: [{ role: 'user', content: 'prev' }], sessionId: 's1' });

      expect(aiService.chatStream).toHaveBeenCalledWith('hi', [{ role: 'user', content: 'prev' }], 's1');
      expect(result).toBeDefined();
    });

    it('should generate sessionId when not provided', () => {
      (aiService.chatStream as jest.Mock).mockReturnValue(of({ data: '{}' }));

      controller.chatStream({ message: 'hi', recaptchaToken: 'token' });

      expect(aiService.chatStream).toHaveBeenCalledWith('hi', [], expect.any(String));
    });
  });

  describe('POST /ai/generate', () => {
    it('should delegate to generateContent', async () => {
      (aiService.generateContent as jest.Mock).mockResolvedValue({ type: 'blog', content: 'post' });

      const result = await controller.generate({ type: AiGenerateType.BLOG, prompt: 'AI 招聘' });

      expect(aiService.generateContent).toHaveBeenCalledWith({ type: 'blog', prompt: 'AI 招聘' });
      expect(result).toEqual({ type: 'blog', content: 'post' });
    });
  });

  describe('POST /ai/generate-image', () => {
    it('should delegate to generateImage with userId', async () => {
      (aiService.generateImage as jest.Mock).mockResolvedValue({
        url: '/uploads/ai-image.png',
        revisedPrompt: 'revised',
        mediaId: 'm1',
      });

      const result = await controller.generateImage(
        { prompt: 'a cat', size: '1024x1024' },
        'u1',
      );

      expect(aiService.generateImage).toHaveBeenCalledWith({
        prompt: 'a cat',
        size: '1024x1024',
        userId: 'u1',
      });
      expect(result).toEqual({
        url: '/uploads/ai-image.png',
        revisedPrompt: 'revised',
        mediaId: 'm1',
      });
    });
  });

  describe('POST /ai/admin/chat', () => {
    it('should delegate to adminChat and return sessionId', async () => {
      (aiService.adminChat as jest.Mock).mockResolvedValue({ content: 'admin reply' });

      const result = await controller.adminChat({
        message: '生成 hero 标题',
        history: [{ role: 'user', content: 'hi' }],
        context: { page: 'home' },
      });

      expect(aiService.adminChat).toHaveBeenCalledWith(
        '生成 hero 标题',
        [{ role: 'user', content: 'hi' }],
        { page: 'home' },
      );
      expect(result.content).toBe('admin reply');
      expect(result.sessionId).toBeDefined();
    });

    it('should use empty history when not provided', async () => {
      (aiService.adminChat as jest.Mock).mockResolvedValue({ content: 'ok' });

      await controller.adminChat({ message: 'help' });

      expect(aiService.adminChat).toHaveBeenCalledWith('help', [], undefined);
    });
  });

  describe('GET /ai/provider-status', () => {
    it('should delegate to getProviderStatus', async () => {
      const status = [
        { provider: 'openai', configured: true, active: true },
        { provider: 'azure', configured: false, active: false },
      ];
      (aiService.getProviderStatus as jest.Mock).mockReturnValue(status);

      const result = controller.getProviderStatus();

      expect(aiService.getProviderStatus).toHaveBeenCalled();
      expect(result).toEqual(status);
    });
  });
});
