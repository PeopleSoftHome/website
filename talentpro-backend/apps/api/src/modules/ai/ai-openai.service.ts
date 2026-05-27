import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Subject } from 'rxjs';
import { ChatMessage } from './ai.types';

@Injectable()
export class AiOpenAiService {
  private readonly logger = new Logger(AiOpenAiService.name);
  private readonly openaiKey: string | undefined;
  private readonly openaiModel: string;

  constructor(private readonly config: ConfigService) {
    this.openaiKey = this.config.get<string>('OPENAI_API_KEY');
    this.openaiModel = this.config.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
    if (!this.openaiKey) {
      this.logger.warn('OPENAI_API_KEY not configured. AI chat will use rule-based fallback.');
    }
  }

  isConfigured(): boolean {
    return !!this.openaiKey;
  }

  async callOpenAI(message: string, history: ChatMessage[], systemPrompt: string) {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map((h) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ];

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.openaiKey}`,
      },
      body: JSON.stringify({
        model: this.openaiModel,
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI error: ${err}`);
    }

    const data = await res.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      sources: [],
    };
  }

  async streamOpenAI(message: string, history: ChatMessage[], systemPrompt: string, subject: Subject<any>) {
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: 'user', content: message },
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.openaiKey}`,
        },
        body: JSON.stringify({
          model: this.openaiModel,
          messages,
          stream: true,
          max_tokens: 800,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('OpenAI stream request failed');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            subject.next({ data: JSON.stringify({ done: true }) });
            subject.complete();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const chunk = parsed.choices?.[0]?.delta?.content || '';
            if (chunk) {
              subject.next({ data: JSON.stringify({ chunk }) });
            }
          } catch {
            // ignore parse error
          }
        }
      }

      subject.next({ data: JSON.stringify({ done: true }) });
      subject.complete();
    } catch (err: any) {
      this.logger.error(`Stream error: ${err.message}`);
      subject.error(err);
    }
  }
}
