import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Subject } from 'rxjs';
import { AiAzureOpenAiService } from './ai-azure-openai.service';
import { ChatMessage, StreamEvent } from './ai.types';

const mockClient = {
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
  images: {
    generate: jest.fn(),
  },
};

jest.mock('openai', () => ({
  __esModule: true,
  AzureOpenAI: jest.fn(() => mockClient),
}));

describe('AiAzureOpenAiService', () => {
  let service: AiAzureOpenAiService;
  let configGet: jest.Mock;

  const createService = async (env: Record<string, string> = {}) => {
    configGet = jest.fn((key: string, fallback?: string) => {
      const map: Record<string, string> = {
        AZURE_OPENAI_API_KEY: env.AZURE_OPENAI_API_KEY ?? '',
        AZURE_OPENAI_ENDPOINT: env.AZURE_OPENAI_ENDPOINT ?? '',
        AZURE_OPENAI_API_VERSION: env.AZURE_OPENAI_API_VERSION ?? '',
        AZURE_OPENAI_DEPLOYMENT: env.AZURE_OPENAI_DEPLOYMENT ?? '',
        AZURE_OPENAI_MODEL: env.AZURE_OPENAI_MODEL ?? '',
        AZURE_OPENAI_TEMPERATURE: env.AZURE_OPENAI_TEMPERATURE ?? '0.7',
        AZURE_OPENAI_MAX_TOKENS: env.AZURE_OPENAI_MAX_TOKENS ?? '800',
        AZURE_OPENAI_TIMEOUT_MS: env.AZURE_OPENAI_TIMEOUT_MS ?? '30000',
        AZURE_OPENAI_IMAGE_DEPLOYMENT: env.AZURE_OPENAI_IMAGE_DEPLOYMENT ?? '',
        AZURE_OPENAI_IMAGE_SIZE: env.AZURE_OPENAI_IMAGE_SIZE ?? '',
        AZURE_OPENAI_IMAGE_QUALITY: env.AZURE_OPENAI_IMAGE_QUALITY ?? '',
        AZURE_OPENAI_IMAGE_STYLE: env.AZURE_OPENAI_IMAGE_STYLE ?? '',
        AI_IMAGE_PLACEHOLDER_URL: env.AI_IMAGE_PLACEHOLDER_URL ?? '',
      };
      return map[key] || fallback;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiAzureOpenAiService,
        {
          provide: ConfigService,
          useValue: { get: configGet },
        },
      ],
    }).compile();

    return module.get<AiAzureOpenAiService>(AiAzureOpenAiService);
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    service = await createService({
      AZURE_OPENAI_API_KEY: 'test-key',
      AZURE_OPENAI_ENDPOINT: 'https://test.openai.azure.com',
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(service.name).toBe('azure');
  });

  describe('configuration', () => {
    it('should report not configured when api key or endpoint is missing', async () => {
      const unconfigured = await createService({});
      expect(unconfigured.isConfigured()).toBe(false);
    });

    it('should report configured when api key and endpoint exist', () => {
      expect(service.isConfigured()).toBe(true);
    });

    it('should expose provider config', () => {
      const cfg = service.getProviderConfig();
      expect(cfg).toMatchObject({
        provider: 'azure',
        apiKey: 'test-key',
        baseUrl: 'https://test.openai.azure.com',
        temperature: 0.7,
        maxTokens: 800,
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

    it('should call Azure OpenAI with system prompt and history', async () => {
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
      const result = await unconfigured.chat([{ role: 'user', content: 'hi' }]);
      expect(result).toEqual({ content: '', sources: [] });
    });

    it('should throw on Azure OpenAI error', async () => {
      mockClient.chat.completions.create.mockRejectedValue(new Error('network'));
      await expect(service.chat([{ role: 'user', content: 'hi' }])).rejects.toThrow('Azure OpenAI chat error: network');
    });
  });

  describe('moderateContent', () => {
    it('should return neutral moderation result', async () => {
      const result = await service.moderateContent('text');
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

    it('should call Azure OpenAI images.generate and return URL', async () => {
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

    it('should throw when Azure OpenAI image generation fails', async () => {
      mockClient.images.generate.mockRejectedValue(new Error('rate-limit'));

      await expect(service.generateImage('prompt')).rejects.toThrow('Azure OpenAI image generation error: rate-limit');
    });
  });
});
