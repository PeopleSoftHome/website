import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LlmProviderFactory } from './ai-provider.factory';
import { AiOpenAiService } from './ai-openai.service';
import { AiAzureOpenAiService } from './ai-azure-openai.service';
import { AiAnthropicService } from './ai-anthropic.service';
import { LlmProviderConfig } from './ai.types';

describe('LlmProviderFactory', () => {
  let factory: LlmProviderFactory;

  const createMockProvider = (name: string, configured: boolean) => ({
    name,
    isConfigured: jest.fn().mockReturnValue(configured),
    chat: jest.fn(),
    stream: jest.fn(),
    moderateContent: jest.fn(),
    generateImage: jest.fn(),
    getProviderConfig: jest.fn().mockReturnValue({ provider: name } as LlmProviderConfig),
  });

  const openAiService = createMockProvider('openai', true);
  const azureOpenAiService = createMockProvider('azure', false);
  const anthropicService = createMockProvider('anthropic', false);

  const createFactory = async (config: Partial<LlmProviderConfig>) => {
    openAiService.getProviderConfig.mockReturnValue({ provider: config.provider || 'openai' } as LlmProviderConfig);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmProviderFactory,
        { provide: AiOpenAiService, useValue: openAiService },
        { provide: AiAzureOpenAiService, useValue: azureOpenAiService },
        { provide: AiAnthropicService, useValue: anthropicService },
        { provide: ConfigService, useValue: { get: jest.fn() } },
      ],
    }).compile();

    return module.get<LlmProviderFactory>(LlmProviderFactory);
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    openAiService.isConfigured.mockReturnValue(true);
    azureOpenAiService.isConfigured.mockReturnValue(false);
    anthropicService.isConfigured.mockReturnValue(false);
  });

  it('should be defined', async () => {
    factory = await createFactory({ provider: 'openai' });
    expect(factory).toBeDefined();
  });

  it('should return openai service when provider is openai', async () => {
    factory = await createFactory({ provider: 'openai' });
    expect(factory.getActiveProvider()).toBe(openAiService);
  });

  it('should return azure service when provider is azure and configured', async () => {
    azureOpenAiService.isConfigured.mockReturnValue(true);
    factory = await createFactory({ provider: 'azure' });

    expect(factory.getActiveProvider()).toBe(azureOpenAiService);
  });

  it('should fall back to openai when provider is azure but not configured', async () => {
    const warnSpy = jest.spyOn(openAiService, 'isConfigured').mockReturnValue(true);
    factory = await createFactory({ provider: 'azure' });

    expect(factory.getActiveProvider()).toBe(openAiService);
    warnSpy.mockRestore();
  });

  it('should return anthropic service when provider is anthropic and configured', async () => {
    anthropicService.isConfigured.mockReturnValue(true);
    factory = await createFactory({ provider: 'anthropic' });

    expect(factory.getActiveProvider()).toBe(anthropicService);
  });

  it('should fall back to openai when provider is anthropic but not configured', async () => {
    factory = await createFactory({ provider: 'anthropic' });

    expect(factory.getActiveProvider()).toBe(openAiService);
  });

  it('should throw for openrouter provider', async () => {
    factory = await createFactory({ provider: 'openrouter' });

    expect(() => factory.getActiveProvider()).toThrow('openrouter');
  });

  it('should fall back to openai for unknown provider', async () => {
    factory = await createFactory({ provider: 'unknown' as LlmProviderConfig['provider'] });

    expect(factory.getActiveProvider()).toBe(openAiService);
  });

  describe('getProviderStatus', () => {
    it('should return status for all known providers', async () => {
      factory = await createFactory({ provider: 'openai' });

      const status = factory.getProviderStatus();

      expect(status).toEqual([
        { provider: 'openai', configured: true, active: true, fallback: undefined },
        { provider: 'azure', configured: false, active: false, fallback: undefined },
        { provider: 'anthropic', configured: false, active: false, fallback: undefined },
        { provider: 'openrouter', configured: false, active: false, fallback: undefined },
      ]);
    });

    it('should mark fallback when active provider is not configured', async () => {
      factory = await createFactory({ provider: 'azure' });
      azureOpenAiService.isConfigured.mockReturnValue(false);
      openAiService.isConfigured.mockReturnValue(true);

      const status = factory.getProviderStatus();
      const azureStatus = status.find((s) => s.provider === 'azure');

      expect(azureStatus).toEqual({ provider: 'azure', configured: false, active: true, fallback: 'openai' });
    });
  });
});
