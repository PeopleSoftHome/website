export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * ChatAction — 对话内业务动作（服务端意图识别产出，前端渲染为按钮）
 * open_demo：打开预约演示弹窗；open_contact：打开联系/留言弹窗；link：路由跳转
 */
export interface ChatAction {
  type: 'open_demo' | 'open_contact' | 'link';
  label: string;
  url?: string;
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
