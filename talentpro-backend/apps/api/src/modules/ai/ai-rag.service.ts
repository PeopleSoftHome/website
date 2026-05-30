import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { MeiliSearch } from 'meilisearch';
import { MEILISEARCH_CLIENT } from '../meilisearch/meilisearch.module';

@Injectable()
export class AiRagService {
  private readonly logger = new Logger(AiRagService.name);

  constructor(
    @Inject(MEILISEARCH_CLIENT) private readonly meili: MeiliSearch,
  ) {}

  async retrieveContext(query: string): Promise<string[]> {
    const contexts: string[] = [];
    try {
      const productRes = await this.meili.index('products').search(query, { limit: 3 });
      productRes.hits.forEach((h) => {
        contexts.push(`【产品】${h.name}：${h.tagline}${h.description ? ' — ' + h.description.slice(0, 200) : ''}`);
      });

      const blogRes = await this.meili.index('blog_posts').search(query, { limit: 2 });
      blogRes.hits.forEach((h) => {
        contexts.push(`【博客】${h.title}：${h.excerpt || h.content?.slice(0, 200) || ''}`);
      });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Meilisearch retrieval failed: ${message}`);
    }
    return contexts;
  }
}
