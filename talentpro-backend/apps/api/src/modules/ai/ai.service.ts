import { Injectable, Logger } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { ChatMessage } from './ai.types';
import { AiRagService } from './ai-rag.service';
import { AiPromptService } from './ai-prompt.service';
import { AiOpenAiService } from './ai-openai.service';

/**
 * AiService — Facade
 * 组合 RAG / Prompt / OpenAI 三个子服务，对外保持统一接口
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private ragService: AiRagService,
    private promptService: AiPromptService,
    private openaiService: AiOpenAiService,
  ) {}

  async chat(message: string, history: ChatMessage[] = []) {
    const contexts = await this.ragService.retrieveContext(message);
    const systemPrompt = this.promptService.buildSystemPrompt(contexts);

    if (this.openaiService.isConfigured()) {
      return this.openaiService.callOpenAI(message, history, systemPrompt);
    }

    return this.fallbackResponse(message, contexts);
  }

  chatStream(message: string, history: ChatMessage[] = []): Observable<any> {
    const subject = new Subject<any>();

    if (!this.openaiService.isConfigured()) {
      let interval: NodeJS.Timeout | null = null;
      this.chat(message, history).then((response) => {
        const text = response.content || '';
        const chunks = text.split('');
        let index = 0;
        interval = setInterval(() => {
          if (index >= chunks.length) {
            clearInterval(interval!);
            subject.next({ data: JSON.stringify({ done: true }) });
            subject.complete();
            return;
          }
          let chunk = '';
          for (let i = 0; i < 4 && index < chunks.length; i++, index++) {
            chunk += chunks[index];
          }
          subject.next({ data: JSON.stringify({ chunk }) });
        }, 30);
      }).catch((err) => {
        if (interval) clearInterval(interval);
        subject.error(err);
      });
      return subject.asObservable();
    }

    this.ragService.retrieveContext(message).then((contexts) => {
      const systemPrompt = this.promptService.buildSystemPrompt(contexts);
      this.openaiService.streamOpenAI(message, history, systemPrompt, subject);
    }).catch((err) => subject.error(err));

    return subject.asObservable();
  }

  private fallbackResponse(message: string, contexts: string[]) {
    const lower = message.toLowerCase();

    if (lower.includes('价格') || lower.includes('收费') || lower.includes('多少钱')) {
      return {
        content: 'TalentPro 提供灵活的定价方案，根据企业规模和所选模块定价。我们的售前顾问可以为您提供详细的报价方案。建议您预约一次免费的产品演示，我们会根据您的需求给出最优方案。',
        sources: contexts.slice(0, 2),
      };
    }

    if (lower.includes('demo') || lower.includes('演示') || lower.includes('试用')) {
      return {
        content: '您可以点击页面上的「预约演示」按钮，填写基本信息后，我们的售前顾问会在 1 个工作日内与您联系，安排专属的产品演示。',
        sources: contexts.slice(0, 2),
      };
    }

    if (lower.includes('招聘') || lower.includes('面试') || lower.includes('hr')) {
      return {
        content: 'TalentPro 的招聘管理模块支持全流程数字化招聘，包括：\n\n1. AI 招聘助手 — 智能筛选简历，自动匹配岗位\n2. AI 面试官 — 结构化视频面试，自动评估候选人\n3. 招聘管理系统 — 从发布职位到 Offer 发放全流程管理\n\n' + (contexts.length > 0 ? '相关阅读：\n' + contexts.slice(0, 2).join('\n') : ''),
        sources: contexts.slice(0, 2),
      };
    }

    if (lower.includes('薪酬') || lower.includes('工资') || lower.includes('薪资')) {
      return {
        content: 'TalentPro 薪酬管理系统支持：\n\n- 多薪资方案并行管理\n- 自动算薪与个税计算\n- 与考勤、绩效数据联动\n- 银行代发对接\n\n适合中大型企业的复杂薪酬场景。',
        sources: contexts.slice(0, 2),
      };
    }

    let response = '感谢您的提问！我是 TalentPro AI 助手，专门为您解答关于我们一体化 HR SaaS 平台的问题。\n\n';
    if (contexts.length > 0) {
      response += '根据您的问题，我为您找到了以下相关信息：\n\n' + contexts.join('\n\n') + '\n\n';
    }
    response += '如果您想了解更多细节，建议预约我们的产品演示，我们的顾问会为您提供一对一的详细解答。';

    return { content: response, sources: contexts.slice(0, 2) };
  }
}
