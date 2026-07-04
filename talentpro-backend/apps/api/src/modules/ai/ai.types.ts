export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamEvent {
  data: string;
}

export interface LlmProviderConfig {
  provider: 'openai' | 'azure' | 'anthropic' | 'openrouter';
  model: string;
  baseUrl?: string;
  apiKey?: string;
  temperature: number;
  maxTokens: number;
  timeoutMs?: number;
}

export interface LlmProvider {
  readonly name: string;
  isConfigured(): boolean;
  chat(messages: ChatMessage[], config?: Partial<LlmProviderConfig>): Promise<{ content: string }>;
  stream(messages: ChatMessage[], subject: import('rxjs').Subject<StreamEvent>): Promise<void>;
  moderateContent(content: string): Promise<{ riskScore: number; flags: string[] }>;
  generateImage(
    prompt: string,
    options?: { size?: string; quality?: string; style?: string },
  ): Promise<{ url: string; revisedPrompt?: string }>;
}
