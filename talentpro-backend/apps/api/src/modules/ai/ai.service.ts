import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Observable, Subject } from 'rxjs';
import { ChatMessage, StreamEvent, LlmProvider, ChatAction } from './ai.types';
import { AiRagService } from './ai-rag.service';
import { AiPromptService } from './ai-prompt.service';
import { LlmProviderFactory } from './ai-provider.factory';
import { PrismaService } from '@shared/prisma/prisma.service';
import { MediaService } from '@/modules/media/media.service';
import { AiGenerateImageDto } from './dto/ai-generate-image.dto';

const ACTION_PATTERNS = {
  demo: /演示|预约|demo|trial|试用|体验/,
  contact: /人工|客服|联系|留言|contact|human|agent/,
  careers: /招聘|岗位|职位|求职|career|job/,
  pricing: /价格|定价|收费|多少钱|报价|pricing|price|cost/,
} as const;

const ACTION_LABELS: Record<string, { demo: string; contact: string; careers: string; pricing: string }> = {
  zh: { demo: '预约演示', contact: '联系顾问', careers: '查看在招岗位', pricing: '查看定价' },
  en: { demo: 'Book a Demo', contact: 'Contact Us', careers: 'View Open Roles', pricing: 'View Pricing' },
  'zh-TW': { demo: '預約演示', contact: '聯繫顧問', careers: '查看在招崗位', pricing: '查看定價' },
};

/**
 * AiService — Facade
 * 组合 RAG / Prompt / LLM Provider 工厂，对外保持统一接口
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private ragService: AiRagService,
    private promptService: AiPromptService,
    private providerFactory: LlmProviderFactory,
    private prisma: PrismaService,
    private mediaService: MediaService,
  ) {}

  private get llm(): LlmProvider {
    return this.providerFactory.getActiveProvider();
  }

  async chat(message: string, history: ChatMessage[] = [], locale = 'zh') {
    const contexts = await this.ragService.retrieveContext(message);
    const systemPrompt = await this.promptService.buildSystemPrompt(contexts, locale);
    const actions = this.detectActions(message, locale);

    if (this.llm.isConfigured()) {
      const result = await this.llm.chat([
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message },
      ]);
      return { ...result, actions };
    }

    return { ...this.fallbackResponse(message, contexts), actions };
  }

  /**
   * 意图识别 → 对话内业务动作。规则驱动、确定性、不依赖 LLM，
   * 对 LLM 回复与本地 fallback 回复同样生效。
   */
  private detectActions(message: string, locale: string): ChatAction[] {
    const lower = message.toLowerCase();
    const L = ACTION_LABELS[locale] || ACTION_LABELS.zh;
    const actions: ChatAction[] = [];

    if (ACTION_PATTERNS.demo.test(lower)) actions.push({ type: 'open_demo', label: L.demo });
    if (ACTION_PATTERNS.contact.test(lower)) actions.push({ type: 'open_contact', label: L.contact });
    if (ACTION_PATTERNS.careers.test(lower)) actions.push({ type: 'link', label: L.careers, url: '/careers' });
    if (ACTION_PATTERNS.pricing.test(lower)) actions.push({ type: 'link', label: L.pricing, url: '/pricing' });

    return actions;
  }

  async moderateContent(content: string) {
    if (!this.llm.isConfigured()) {
      return { riskScore: 0, flags: [] as string[], autoApprove: true };
    }
    const ai = await this.llm.moderateContent(content);
    return {
      ...ai,
      autoApprove: ai.riskScore < 0.3 && ai.flags.length === 0,
    };
  }

  async generateContent(dto: {
    type: string;
    prompt?: string;
    content?: string;
    language?: string;
    tone?: string;
  }) {
    const { type, prompt = '', content = '', language = 'zh', tone = '专业' } = dto;

    if (this.llm.isConfigured()) {
      const userPrompt = this.buildGeneratePrompt(type, prompt, content, language, tone);
      const result = await this.llm.chat([{ role: 'user', content: userPrompt }]);
      return {
        type,
        content: result.content,
        generatedAt: new Date().toISOString(),
      };
    }

    return this.fallbackGenerate(type, prompt, content, language, tone);
  }

  async generateImage(dto: AiGenerateImageDto & { userId: string }) {
    const { prompt, userId, size, quality, style } = dto;
    const llm = this.llm;
    const result = await llm.generateImage(prompt, { size, quality, style });

    if (!llm.isConfigured()) {
      return { url: result.url, revisedPrompt: result.revisedPrompt };
    }

    const response = await fetch(result.url);
    if (!response.ok) {
      throw new Error(`Failed to download generated image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `ai-image-${Date.now()}.png`;

    const media = await this.mediaService.createFromBuffer({
      buffer,
      filename,
      originalName: filename,
      mimeType: 'image/png',
      alt: prompt,
      createdBy: userId,
    });

    return {
      url: media.url,
      revisedPrompt: result.revisedPrompt,
      mediaId: media.id,
    };
  }

  async adminChat(
    message: string,
    history: ChatMessage[] = [],
    context?: unknown,
    locale = 'zh',
  ) {
    const sections = [
      'hero',
      'brands',
      'stats',
      'products',
      'ai-family',
      'industries',
      'testimonials',
      'logos',
      'why-us',
      'resources',
      'roi-calculator',
      'cta-banner',
    ];

    const basePrompt = `你是 TalentPro 门户配置助手，专为管理员服务。` +
      `你熟悉首页所有 Section：${sections.join('、')}。` +
      `你可以根据需求生成文案、优化标题/副标题，也可以调用图片生成功能为 Section 生成配图。` +
      `回答请简洁、可操作，优先给出能直接回填到配置表单的结果。`;

    const contextBlock = context
      ? `\n\n当前页面/区块上下文：\n${JSON.stringify(context, null, 2)}`
      : '';

    const systemPrompt = `${basePrompt}${contextBlock}\n\n当前语言：${locale}`;
    const llm = this.llm;

    if (llm.isConfigured()) {
      return llm.chat([
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message },
      ]);
    }

    return {
      content: `AI 助手暂未配置。可用的首页 Section 包括：${sections.join('、')}。您可以手动编辑这些区块的配置。`,
    };
  }

  getProviderStatus() {
    return this.providerFactory.getProviderStatus();
  }

  async loadChatSession(sessionId: string): Promise<ChatMessage[]> {
    if (!sessionId) return [];
    try {
      const session = await this.prisma.aiChatSession.findUnique({ where: { sessionId } });
      const messages = Array.isArray(session?.messages) ? (session.messages as unknown as ChatMessage[]) : [];
      return messages.slice(-20);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Failed to load chat session: ${message}`);
      return [];
    }
  }

  async appendChatMessage(sessionId: string, role: ChatMessage['role'], content: string) {
    if (!sessionId) return;
    try {
      const existing = await this.prisma.aiChatSession.findUnique({ where: { sessionId } });
      const messages: ChatMessage[] = existing && Array.isArray(existing.messages)
        ? (existing.messages as unknown as ChatMessage[])
        : [];
      messages.push({ role, content });
      await this.prisma.aiChatSession.upsert({
        where: { sessionId },
        update: { messages: messages as unknown as Prisma.InputJsonValue },
        create: { sessionId, messages: messages as unknown as Prisma.InputJsonValue },
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Failed to save chat message: ${message}`);
    }
  }

  private buildGeneratePrompt(
    type: string,
    prompt: string,
    content: string,
    language: string,
    tone: string,
  ): string {
    const base = `你是一位资深 HR SaaS 内容运营专家。请以「${tone}」的口吻，用「${language}」输出。`;
    const input = prompt || content || 'TalentPro 一体化 HR SaaS 平台';

    switch (type) {
      case 'blog':
        return `${base}\n请为以下主题生成一篇博客文章，包含标题、正文和摘要：\n${input}`;
      case 'product':
        return `${base}\n请为以下产品生成营销文案，包含标题、描述、核心功能和应用场景：\n${input}`;
      case 'seo':
        return `${base}\n请为以下主题生成 SEO 标题、描述和关键词：\n${input}`;
      case 'translate':
        return `${base}\n请翻译以下内容：\n${content || prompt}`;
      case 'moderate':
        return `${base}\n请审核以下内容是否合规，指出风险并给出修改建议：\n${content || prompt}`;
      default:
        return `${base}\n${input}`;
    }
  }

  private fallbackGenerate(
    type: string,
    prompt: string,
    content: string,
    language: string,
    tone: string,
  ) {
    const input = prompt || content || 'TalentPro 一体化 HR SaaS 平台';

    switch (type) {
      case 'blog':
        return {
          type,
          title: `${input}：企业数字化 HR 的最佳实践`,
          content: `在数字化转型的浪潮中，${input} 为企业提供了从招聘、入职、考勤、薪酬到绩效的全流程解决方案。\n\n通过 AI 驱动的智能分析，HR 团队可以实时掌握人才动态，优化组织结构，提升员工体验。`,
          summary: `本文介绍了 ${input} 如何帮助企业实现 HR 数字化转型。`,
          language,
          tone,
          generatedAt: new Date().toISOString(),
        };
      case 'product':
        return {
          type,
          title: input,
          description: `${input} 是 TalentPro 平台的核心模块，致力于为中大型企业打造高效、合规、智能化的 HR 管理体验。`,
          features: ['智能招聘', '绩效考评', '薪酬算薪', '组织架构'],
          scenarios: ['中大型企业 HR 共享中心', '快速成长型企业', '跨国多法人组织'],
          language,
          tone,
          generatedAt: new Date().toISOString(),
        };
      case 'seo':
        return {
          type,
          title: `${input} - 企业级 HR SaaS 解决方案 | TalentPro`,
          description: `了解 ${input} 如何帮助企业降本增效，实现 HR 数字化管理。`,
          keywords: ['HR SaaS', '人力资源管理', '招聘系统', '薪酬管理', '绩效考核'],
          language,
          tone,
          generatedAt: new Date().toISOString(),
        };
      case 'translate':
        return {
          type,
          original: content || prompt,
          translation: `[${language}] ${content || prompt}`,
          language,
          tone,
          generatedAt: new Date().toISOString(),
        };
      case 'moderate':
        return {
          type,
          moderated: true,
          issues: [],
          suggestion: '内容暂未发现明显风险（当前为离线规则模式）。',
          language,
          tone,
          generatedAt: new Date().toISOString(),
        };
      default:
        return {
          type,
          content: input,
          language,
          tone,
          generatedAt: new Date().toISOString(),
        };
    }
  }

  chatStream(message: string, history: ChatMessage[] = [], sessionId?: string): Observable<StreamEvent> {
    const subject = new Subject<StreamEvent>();

    if (sessionId) {
      this.appendChatMessage(sessionId, 'user', message).catch(() => {});
    }

    if (!this.llm.isConfigured()) {
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

    this.ragService.retrieveContext(message).then(async (contexts) => {
      const systemPrompt = await this.promptService.buildSystemPrompt(contexts);
      this.llm.stream([
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: message },
      ], subject);
    }).catch((err) => subject.error(err));

    if (sessionId) {
      let assistantText = '';
      const originalNext = subject.next.bind(subject);
      const originalComplete = subject.complete.bind(subject);
      subject.next = (value: StreamEvent) => {
        try {
          const parsed = JSON.parse(value.data);
          if (parsed.chunk) assistantText += parsed.chunk;
        } catch {
          // ignore parse errors
        }
        return originalNext(value);
      };
      subject.complete = () => {
        this.appendChatMessage(sessionId, 'assistant', assistantText).catch(() => {});
        return originalComplete();
      };
    }

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
