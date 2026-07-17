import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@shared/prisma/prisma.service';

export interface SemanticHit {
  refType: string;
  refId: string;
  slug: string | null;
  title: string;
  content: string;
  /** 余弦相似度（0-1，越大越相关） */
  score: number;
}

const REF_LABELS: Record<string, string> = {
  blog_post: '博客',
  product: '产品',
  industry: '行业方案',
  case_study: '客户案例',
  news: '新闻',
};

/**
 * AiEmbeddingService — 语义检索（OpenAI Embeddings + pgvector）
 *
 * 环境开关：`AI_EMBEDDING_ENABLED=true` 且配置 `OPENAI_API_KEY` 时启用；
 * 未启用时所有方法安全降级（isEnabled()=false，调用方走关键词检索）。
 * 模型维度固定 1536（text-embedding-3-small）；换模型需迁移重建向量列。
 */
@Injectable()
export class AiEmbeddingService {
  private readonly logger = new Logger(AiEmbeddingService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  isEnabled(): boolean {
    return this.config.get<string>('AI_EMBEDDING_ENABLED') === 'true'
      && Boolean(this.config.get<string>('OPENAI_API_KEY'));
  }

  static refLabel(refType: string): string {
    return REF_LABELS[refType] || refType;
  }

  /** 调用 OpenAI Embeddings API，返回与输入等长的向量数组 */
  async embed(texts: string[]): Promise<number[][]> {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    const model = this.config.get<string>('AI_EMBEDDING_MODEL') || 'text-embedding-3-small';
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, input: texts }),
    });
    if (!res.ok) {
      throw new Error(`Embeddings API ${res.status}: ${await res.text()}`);
    }
    const json = (await res.json()) as { data: Array<{ embedding: number[]; index: number }> };
    return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
  }

  /** 嵌入并 upsert 一条内容（refType+refId 唯一） */
  async indexContent(refType: string, refId: string, slug: string | null, title: string, content: string): Promise<void> {
    const [vector] = await this.embed([`${title}\n${content}`.slice(0, 8000)]);
    const literal = `[${vector.join(',')}]`;
    await this.prisma.$executeRaw`
      INSERT INTO "ai_embeddings" ("id", "refType", "refId", "slug", "title", "content", "embedding", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${refType}, ${refId}, ${slug}, ${title}, ${content}, ${literal}::vector, NOW(), NOW())
      ON CONFLICT ("refType", "refId")
      DO UPDATE SET "slug" = EXCLUDED."slug", "title" = EXCLUDED."title",
                    "content" = EXCLUDED."content", "embedding" = EXCLUDED."embedding", "updatedAt" = NOW()
    `;
  }

  /** 语义搜索：按余弦距离返回最相似的 limit 条 */
  async search(query: string, limit = 6): Promise<SemanticHit[]> {
    const [vector] = await this.embed([query]);
    const literal = `[${vector.join(',')}]`;
    const rows = await this.prisma.$queryRaw<Array<{
      refType: string; refId: string; slug: string | null; title: string; content: string; distance: number;
    }>>`
      SELECT "refType", "refId", "slug", "title", "content",
             ("embedding" <=> ${literal}::vector) AS distance
      FROM "ai_embeddings"
      ORDER BY "embedding" <=> ${literal}::vector ASC
      LIMIT ${limit}
    `;
    return rows.map((r) => ({ ...r, score: 1 - Number(r.distance) }));
  }

  /** 全量重建索引：已发布的产品/行业/博客/案例/新闻。返回各类型计数。 */
  async reindexAll(): Promise<Record<string, number>> {
    if (!this.isEnabled()) {
      this.logger.warn('AI_EMBEDDING_ENABLED 未开启或缺少 OPENAI_API_KEY，跳过索引');
      return {};
    }

    const [products, industries, posts, cases, news] = await Promise.all([
      this.prisma.product.findMany({ where: { isPublished: true }, select: { id: true, slug: true, name: true, tagline: true, description: true } }),
      this.prisma.industry.findMany({ where: { isPublished: true }, select: { id: true, slug: true, label: true, features: true } }),
      this.prisma.blogPost.findMany({ where: { status: 'PUBLISHED', deletedAt: null }, select: { id: true, slug: true, title: true, excerpt: true, content: true } }),
      this.prisma.caseStudy.findMany({ where: { status: 'PUBLISHED' }, select: { id: true, slug: true, title: true, excerpt: true } }),
      this.prisma.news.findMany({ where: { status: 'PUBLISHED', deletedAt: null }, select: { id: true, slug: true, title: true, summary: true, content: true } }),
    ]);

    const jobs: Array<[string, string, string | null, string, string]> = [
      ...products.map((p) => ['product', p.id, p.slug, p.name, `${p.tagline} ${p.description || ''}`] as const),
      ...industries.map((i) => ['industry', i.id, i.slug, i.label, JSON.stringify(i.features || [])] as const),
      ...posts.map((p) => ['blog_post', p.id, p.slug, p.title, `${p.excerpt || ''} ${p.content.slice(0, 2000)}`] as const),
      ...cases.map((c) => ['case_study', c.id, c.slug, c.title, c.excerpt] as const),
      ...news.map((n) => ['news', n.id, n.slug, n.title, `${n.summary || ''} ${n.content.slice(0, 2000)}`] as const),
    ] as Array<[string, string, string | null, string, string]>;

    const counts: Record<string, number> = {};
    for (const [refType, refId, slug, title, content] of jobs) {
      try {
        await this.indexContent(refType, refId, slug, title, content);
        counts[refType] = (counts[refType] || 0) + 1;
      } catch (e: unknown) {
        this.logger.warn(`索引失败 ${refType}/${refId}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    return counts;
  }
}
