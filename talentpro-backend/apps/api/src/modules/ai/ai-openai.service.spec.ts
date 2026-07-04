import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Subject } from 'rxjs';
import { AiOpenAiService } from './ai-openai.service';
import { ChatMessage, StreamEvent } from './ai.types';

const mockClient = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
  moderations: {
    create: jest.fn(),
  },
  images: {
    generate: jest.fn(),
  },
};

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn(() => mockClient),
}));

describe('AiOpenAiService', () => {
  let service: AiOpenAiService;
  let configGet: jest.Mock;

  const createService = async (env: Record<string, string> = {}) => {
    configGet = jest.fn((key: string, fallback?: string) => {
      const map: Record<string, string> = {
        OPENAI_API_KEY: env.OPENAI_API_KEY ?? '',
        OPENAI_MODEL: env.OPENAI_MODEL ?? 'gpt-4o-mini',
        OPENAI_BASE_URL: env.OPENAI_BASE_URL ?? '',
        OPENAI_TEMPERATURE: env.OPENAI_TEMPERATURE ?? '0.7',
        OPENAI_MAX_TOKENS: env.OPENAI_MAX_TOKENS ?? '800',
        OPENAI_TIMEOUT_MS: env.OPENAI_TIMEOUT_MS ?? '30000',
        OPENAI_IMAGE_MODEL: env.OPENAI_IMAGE_MODEL ?? '',
        OPENAI_IMAGE_SIZE: env.OPENAI_IMAGE_SIZE ?? '',
        OPENAI_IMAGE_QUALITY: env.OPENAI_IMAGE_QUALITY ?? '',
        OPENAI_IMAGE_STYLE: env.OPENAI_IMAGE_STYLE ?? '',
        AI_IMAGE_PLACEHOLDER_URL: env.AI_IMAGE_PLACEHOLDER_URL ?? '',
      };
      return map[key] || fallback;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiOpenAiService,
        {
          provide: ConfigService,
          useValue: { get: configGet },
        },
      ],
    }).compile();

    return module.get<AiOpenAiService>(AiOpenAiService);
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    service = await createService({ OPENAI_API_KEY: 'test-key' });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.name).toBe('openai');
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
        provider: 'openai',
        model: 'gpt-4o-mini',
        apiKey: 'test-key',
        temperature: 0.7,
        maxTokens: 800,
      });
    });

    it('should use defaults when optional config is missing', async () => {
      const minimal = await createService({ OPENAI_API_KEY: 'key-only' });
      const cfg = minimal.getProviderConfig();
      expect(cfg).toMatchObject({
        provider: 'openai',
        model: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 800,
        timeoutMs: 30000,
      });
    });

    it('should apply custom config values', async () => {
      const custom = await createService({
        OPENAI_API_KEY: 'custom-key',
        OPENAI_MODEL: 'gpt-4o',
        OPENAI_BASE_URL: 'https://api.example.com',
        OPENAI_TEMPERATURE: '0.3',
        OPENAI_MAX_TOKENS: '2000',
        OPENAI_TIMEOUT_MS: '10000',
      });
      const cfg = custom.getProviderConfig();
      expect(cfg).toMatchObject({
        provider: 'openai',
        model: 'gpt-4o',
        baseUrl: 'https://api.example.com',
        apiKey: 'custom-key',
        temperature: 0.3,
        maxTokens: 2000,
        timeoutMs: 10000,
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

    it('should call OpenAI with system prompt and history', async () => {
      mockClient.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'hello' } }],
      });

      const messages: ChatMessage[] = [
        { role: 'system', content: 'sys' },
        { role: 'user', content: 'first' },
        { role: 'assistant', content: 'ok' },
        { role: 'user', content: 'last' },
      ];
      const result = await service.chat(messages);

      expect(mockClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'sys' },
            { role: 'user', content: 'first' },
            { role: 'assistant', content: 'ok' },
            { role: 'user', content: 'last' },
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      );
      expect(result).toEqual({ content: 'hello', sources: [] });
    });

    it('should return empty when client is not configured', async () => {
      const unconfigured = await createService({});
      const result = await unconfigured.callOpenAI('hi', [], 'sys');
      expect(result).toEqual({ content: '', sources: [] });
    });

    it('should log usage when present', async () => {
      mockClient.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'ok' } }],
        usage: { prompt_tokens: 10, completion_tokens: 5 },
      });

      const result = await service.callOpenAI('hi', [], 'sys');
      expect(result.content).toBe('ok');
    });

    it('should return empty content when choices are missing', async () => {
      mockClient.chat.completions.create.mockResolvedValue({ choices: [] });

      const result = await service.callOpenAI('hi', [], 'sys');

      expect(result.content).toBe('');
    });

    it('should apply overrides', async () => {
      mockClient.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'ok' } }],
      });

      await service.callOpenAI('hi', [], 'sys', { model: 'gpt-4o', temperature: 0.2, maxTokens: 100 });

      expect(mockClient.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gpt-4o',
          temperature: 0.2,
          max_tokens: 100,
        }),
      );
    });

    it('should throw on OpenAI error', async () => {
      mockClient.chat.completions.create.mockRejectedValue(new Error('network'));
      await expect(service.callOpenAI('hi', [], 'sys')).rejects.toThrow('OpenAI chat error: network');
    });
  });

  describe('moderateContent', () => {
    it('should return zero risk when client is not configured', async () => {
      const unconfigured = await createService({});
      const result = await unconfigured.moderateContent('bad');
      expect(result).toEqual({ riskScore: 0, flags: [] });
    });

    it('should return zero risk when no moderation result', async () => {
      mockClient.moderations.create.mockResolvedValue({ results: [] });
      const result = await service.moderateContent('text');
      expect(result).toEqual({ riskScore: 0, flags: [] });
    });

    it('should compute risk score and flags from categories', async () => {
      mockClient.moderations.create.mockResolvedValue({
        results: [
          {
            categories: { hate: true, violence: false },
            category_scores: { hate: '0.85', violence: '0.1' },
          },
        ],
      });

      const result = await service.moderateContent('bad');
      expect(result.riskScore).toBe(0.85);
      expect(result.flags).toEqual(['hate']);
    });

    it('should fallback to zero when scores are empty', async () => {
      mockClient.moderations.create.mockResolvedValue({
        results: [{ categories: {}, category_scores: {} }],
      });

      const result = await service.moderateContent('ok');
      expect(result.riskScore).toBe(0);
      expect(result.flags).toEqual([]);
    });

    it('should catch moderation errors and return zero risk', async () => {
      mockClient.moderations.create.mockRejectedValue(new Error('fail'));
      const result = await service.moderateContent('bad');
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

    it('should emit chunks and completion', async () => {
      async function* generator() {
        yield { choices: [{ delta: { content: 'hello' } }] };
        yield { choices: [{ delta: {} }] };
        yield { choices: [{ delta: { content: ' world' } }] };
      }
      mockClient.chat.completions.create.mockResolvedValue(generator());

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

    it('should catch stream errors', async () => {
      mockClient.chat.completions.create.mockRejectedValue(new Error('stream-error'));

      const subject = new Subject<StreamEvent>();
      const error = jest.fn();
      subject.subscribe({ error });

      await service.stream([], subject);
      expect(error).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('generateImage', () => {
    it('should return placeholder when client is not configured', async () => {
      const unconfigured = await createService({});
      const result = await unconfigured.generateImage('a cat');

      expect(result.url).toBe('https://placehold.co/1024x576?text=AI+Image');
      expect(result.revisedPrompt).toBe('a cat');
    });

    it('should call OpenAI images.generate and return URL', async () => {
      mockClient.images.generate.mockResolvedValue({
        data: [
          {
            url: 'https://example.com/image.png',
            revised_prompt: 'a cute cat',
          },
        ],
      });

      const result = await service.generateImage('a cat', { size: '1024x1024', quality: 'hd', style: 'natural' });

      expect(mockClient.images.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'dall-e-3',
          prompt: 'a cat',
          n: 1,
          size: '1024x1024',
          quality: 'hd',
          style: 'natural',
          response_format: 'url',
        }),
      );
      expect(result.url).toBe('https://example.com/image.png');
      expect(result.revisedPrompt).toBe('a cute cat');
    });

    it('should use env defaults for image options', async () => {
      mockClient.images.generate.mockResolvedValue({
        data: [{ url: 'https://example.com/image2.png' }],
      });

      const custom = await createService({
        OPENAI_API_KEY: 'key',
        OPENAI_IMAGE_MODEL: 'dall-e-2',
        OPENAI_IMAGE_SIZE: '512x512',
        OPENAI_IMAGE_QUALITY: 'hd',
        OPENAI_IMAGE_STYLE: 'natural',
      });

      await custom.generateImage('prompt');

      expect(mockClient.images.generate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'dall-e-2',
          size: '512x512',
          quality: 'hd',
          style: 'natural',
        }),
      );
    });

    it('should throw when OpenAI image generation fails', async () => {
      mockClient.images.generate.mockRejectedValue(new Error('rate-limit'));

      await expect(service.generateImage('prompt')).rejects.toThrow('OpenAI image generation error: rate-limit');
    });
  });
});
