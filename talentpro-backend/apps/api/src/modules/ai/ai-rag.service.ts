import { Injectable, Logger, Optional } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';
import { MEILISEARCH_CLIENT } from '../meilisearch/meilisearch.module';
import { AiEmbeddingService } from './ai-embedding.service';

@Injectable()
export class AiRagService {
  private readonly logger = new Logger(AiRagService.name);

  constructor(
    @Inject(MEILISEARCH_CLIENT) private readonly meili: MeiliSearch,
    @Optional() private readonly embedding?: AiEmbeddingService,
  ) {}

  /**
   * 检索上下文：语义检索（pgvector，启用时）优先，关键词检索（Meilisearch）补充；
   * 按标题去重，语义结果排在前面。任何一路失败都静默降级，不阻断对话。
   */
  async retrieveContext(query: string): Promise<string[]> {
    const contexts: string[] = [];
    const seen = new Set<string>();

    if (this.embedding?.isEnabled()) {
      try {
        const hits = await this.embedding.search(query, 6);
        for (const h of hits) {
          const text = `【${AiEmbeddingService.refLabel(h.refType)}】${h.title}：${h.content.slice(0, 200)}`;
          contexts.push(text);
          seen.add(h.title);
        }
      } catch (e: unknown) {
        this.logger.debug(`Semantic retrieval skipped: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    const keywordHits = await this.retrieveKeyword(query);
    for (const text of keywordHits) {
      // 语义结果已覆盖的标题跳过（关键词格式为 【类型】标题（slug）：…）
      if ([...seen].some((title) => title && text.includes(title))) continue;
      contexts.push(text);
    }

    return contexts;
  }

  /** 关键词检索（原 Meilisearch 多索引实现） */
  private async retrieveKeyword(query: string): Promise<string[]> {
    const contexts: string[] = [];

    const indexes: Array<{ index: string; label: string; limit: number; format: (h: Record<string, string>) => string }> = [
      {
        index: 'products',
        label: '产品',
        limit: 3,
        format: (h) => `【产品】${h.name}（${h.slug}）：${h.tagline}${h.description ? ' — ' + h.description.slice(0, 200) : ''}`,
      },
      {
        index: 'industries',
        label: '行业方案',
        limit: 2,
        format: (h) => `【行业方案】${h.label}（${h.slug}）：${h.description ? h.description.slice(0, 200) : ''}`,
      },
      {
        index: 'ai_cards',
        label: 'AI 能力',
        limit: 2,
        format: (h) => `【AI 能力】${h.title}（${h.slug}）：${h.description ? h.description.slice(0, 200) : ''}`,
      },
      {
        index: 'resources',
        label: '资源',
        limit: 2,
        format: (h) => `【资源】${h.title}（${h.slug}）：${h.excerpt || h.description || ''}`,
      },
      {
        index: 'case_studies',
        label: '客户案例',
        limit: 2,
        format: (h) => `【客户案例】${h.title}（${h.slug}）：${h.excerpt || ''}`,
      },
      {
        index: 'news',
        label: '新闻',
        limit: 2,
        format: (h) => `【新闻】${h.title}（${h.slug}）：${h.summary || ''}`,
      },
      {
        index: 'pages',
        label: '页面',
        limit: 2,
        format: (h) => `【页面】${h.title}（${h.slug}）`,
      },
      {
        index: 'blog_posts',
        label: '博客',
        limit: 2,
        format: (h) => `【博客】${h.title}（${h.slug}）：${h.excerpt || h.content?.slice(0, 200) || ''}`,
      },
    ];

    for (const cfg of indexes) {
      try {
        const res = await this.meili.index(cfg.index).search(query, { limit: cfg.limit });
        res.hits.forEach((h) => contexts.push(cfg.format(h)));
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        this.logger.debug(`Meilisearch index ${cfg.index} retrieval skipped: ${message}`);
      }
    }

    return contexts;
  }
}
