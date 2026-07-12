import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Subject } from 'rxjs';
import { AiAnthropicService } from './ai-anthropic.service';
import { ChatMessage, StreamEvent } from './ai.types';

const mockClient = {
  messages: {
    create: jest.fn(),
  },
};

jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn(() => mockClient),
}));

describe('AiAnthropicService', () => {
  let service: AiAnthropicService;
  let configGet: jest.Mock;

  const createService = async (env: Record<string, string> = {}) => {
    configGet = jest.fn((key: string, fallback?: string) => {
      const map: Record<string, string> = {
        ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY ?? '',
        ANTHROPIC_BASE_URL: env.ANTHROPIC_BASE_URL ?? '',
        ANTHROPIC_MODEL: env.ANTHROPIC_MODEL ?? '',
        ANTHROPIC_TEMPERATURE: env.ANTHROPIC_TEMPERATURE ?? '0.7',
        ANTHROPIC_MAX_TOKENS: env.ANTHROPIC_MAX_TOKENS ?? '1024',
        ANTHROPIC_TIMEOUT_MS: env.ANTHROPIC_TIMEOUT_MS ?? '30000',
        AI_IMAGE_PLACEHOLDER_URL: env.AI_IMAGE_PLACEHOLDER_URL ?? '',
      };
      return map[key] || fallback;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiAnthropicService,
        {
          provide: ConfigService,
          useValue: { get: configGet },
        },
      ],
    }).compile();

    return module.get<AiAnthropicService>(AiAnthropicService);
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    service = await createService({ ANTHROPIC_API_KEY: 'test-key' });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.name).toBe('anthropic');
  });

  describe('configuration', () => {
    it('should report not configured when api key is missing', async () => {
      const unconfigured = await createService({});
      expect(unconfigured.isConfigured()).toBe(false);
    });

    it('should report configured when api key exists', () => {
      expect(service.isConfigured()).toBe(true);
    });

    it('should expose provider config', () => {
      const cfg = service.getProviderConfig();
      expect(cfg).toMatchObject({
        provider: 'anthropic',
        apiKey: 'test-key',
        temperature: 0.7,
        maxTokens: 1024,
      });
    });
  });

  describe('chat', () => {
    it('should return empty content when no user message is found', async () => {
      const result = await service.chat([
        { role: 'system', content: 'sys' },
        { role: 'assistant', content: 'hi' },
      ]);
      expect(result).toEqual({ content: '' });
    });

    it('should call Anthropic with system prompt and history', async () => {
      mockClient.messages.create.mockResolvedValue({
        content: [{ type: 'text', text: 'hello' }],
      });

      const messages: ChatMessage[] = [
        { role: 'system', content: 'sys' },
        { role: 'user', content: 'first' },
        { role: 'assistant', content: 'ok' },
        { role: 'user', content: 'last' },
      ];
      const result = await service.chat(messages);

      expect(mockClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [
            { role: 'user', content: 'first' },
            { role: 'assistant', content: 'ok' },
            { role: 'user', content: 'last' },
          ],
          system: 'sys',
          temperature: 0.7,
          max_tokens: 1024,
        }),
      );
      expect(result).toEqual({ content: 'hello', sources: [] });
    });

    it('should return empty when client is not configured', async () => {
      const unconfigured = await createService({});
      const result = await unconfigured.chat([{ role: 'user', content: 'hi' }]);
      expect(result).toEqual({ content: '', sources: [] });
    });

    it('should throw on Anthropic error', async () => {
      mockClient.messages.create.mockRejectedValue(new Error('network'));
      await expect(service.chat([{ role: 'user', content: 'hi' }])).rejects.toThrow('Anthropic chat error: network');
    });
  });

  describe('moderateContent', () => {
    it('should return neutral moderation result', async () => {
      const result = await service.moderateContent();
      expect(result).toEqual({ riskScore: 0, flags: [] });
    });
  });

  describe('stream', () => {
    it('should error when client is not configured', async () => {
      const unconfigured = await createService({});
      const subject = new Subject<StreamEvent>();
      const error = jest.fn();
      subject.subscribe({ error });

      await unconfigured.stream([], subject);
      expect(error).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should emit text deltas and completion', async () => {
      async function* generator() {
        yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'hello' } };
        yield { type: 'content_block_delta', delta: { type: 'text_delta', text: ' world' } };
      }
      mockClient.messages.create.mockResolvedValue(generator());

      const subject = new Subject<StreamEvent>();
      const events: StreamEvent[] = [];
      const complete = jest.fn();
      subject.subscribe({ next: (v) => events.push(v), complete });

      await service.stream([{ role: 'user', content: 'hi' }], subject);

      expect(events).toEqual([
        { data: JSON.stringify({ chunk: 'hello' }) },
        { data: JSON.stringify({ chunk: ' world' }) },
        { data: JSON.stringify({ done: true }) },
      ]);
      expect(complete).toHaveBeenCalled();
    });

    it('should ignore non-text deltas', async () => {
      async function* generator() {
        yield { type: 'content_block_delta', delta: { type: 'other' } };
        yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'ok' } };
      }
      mockClient.messages.create.mockResolvedValue(generator());

      const subject = new Subject<StreamEvent>();
      const events: StreamEvent[] = [];
      subject.subscribe({ next: (v) => events.push(v) });

      await service.stream([{ role: 'user', content: 'hi' }], subject);

      expect(events).toEqual([
        { data: JSON.stringify({ chunk: 'ok' }) },
        { data: JSON.stringify({ done: true }) },
      ]);
    });

    it('should catch stream errors', async () => {
      mockClient.messages.create.mockRejectedValue(new Error('stream-error'));

      const subject = new Subject<StreamEvent>();
      const error = jest.fn();
      subject.subscribe({ error });

      await service.stream([], subject);
      expect(error).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('generateImage', () => {
    it('should return placeholder since Anthropic does not support image generation', async () => {
      const result = await service.generateImage('a cat');

      expect(result.url).toBe('https://placehold.co/1024x576?text=AI+Image');
      expect(result.revisedPrompt).toBe('a cat');
    });

    it('should use custom placeholder url when configured', async () => {
      const custom = await createService({
        ANTHROPIC_API_KEY: 'key',
        AI_IMAGE_PLACEHOLDER_URL: 'https://example.com/placeholder.png',
      });
      const result = await custom.generateImage('a cat');

      expect(result.url).toBe('https://example.com/placeholder.png');
    });
  });
});
