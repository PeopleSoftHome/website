import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LlmProviderFactory } from './ai-provider.factory';
import { AiOpenAiService } from './ai-openai.service';
import { LlmProviderConfig } from './ai.types';

describe('LlmProviderFactory', () => {
  let factory: LlmProviderFactory;
  const openAiService = {
    getProviderConfig: jest.fn(),
    name: 'openai',
  } as unknown as AiOpenAiService;

  const createFactory = async (_config: Partial<LlmProviderConfig>) => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmProviderFactory,
        {
          provide: AiOpenAiService,
          useValue: openAiService,
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    return module.get<LlmProviderFactory>(LlmProviderFactory);
  };

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    (openAiService.getProviderConfig as jest.Mock).mockReturnValue({ provider: 'openai' } as LlmProviderConfig);
    factory = await createFactory({});
    expect(factory).toBeDefined();
  });

  it('should return openai service when provider is openai', async () => {
    (openAiService.getProviderConfig as jest.Mock).mockReturnValue({ provider: 'openai' } as LlmProviderConfig);
    factory = await createFactory({});

    expect(factory.getActiveProvider()).toBe(openAiService);
  });

  it('should return openai service for reserved azure provider', async () => {
    (openAiService.getProviderConfig as jest.Mock).mockReturnValue({ provider: 'azure' } as LlmProviderConfig);
    factory = await createFactory({});

    expect(factory.getActiveProvider()).toBe(openAiService);
  });

  it('should return openai service for reserved anthropic provider', async () => {
    (openAiService.getProviderConfig as jest.Mock).mockReturnValue({ provider: 'anthropic' } as LlmProviderConfig);
    factory = await createFactory({});

    expect(factory.getActiveProvider()).toBe(openAiService);
  });

  it('should return openai service for reserved openrouter provider', async () => {
    (openAiService.getProviderConfig as jest.Mock).mockReturnValue({ provider: 'openrouter' } as LlmProviderConfig);
    factory = await createFactory({});

    expect(factory.getActiveProvider()).toBe(openAiService);
  });

  it('should return openai service for unknown provider', async () => {
    (openAiService.getProviderConfig as jest.Mock).mockReturnValue({ provider: 'unknown' } as unknown as LlmProviderConfig);
    factory = await createFactory({});

    expect(factory.getActiveProvider()).toBe(openAiService);
  });
});
