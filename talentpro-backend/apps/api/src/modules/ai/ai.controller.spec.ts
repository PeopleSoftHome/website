import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiGenerateType } from './dto/ai-generate.dto';
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
          },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
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
});
