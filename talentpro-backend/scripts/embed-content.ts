/**
 * 语义索引重建脚本（手动/定时任务）
 *
 * 用法：
 *   AI_EMBEDDING_ENABLED=true OPENAI_API_KEY=sk-... npm run ai:embed
 *
 * 前置：
 *   1. 数据库启用 pgvector（migration 20260718000000_semantic_rag_embeddings）
 *   2. OPENAI_API_KEY 有效（模型默认 text-embedding-3-small，AI_EMBEDDING_MODEL 可覆盖）
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../apps/api/src/app.module';
import { AiEmbeddingService } from '../apps/api/src/modules/ai/ai-embedding.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  const service = app.get(AiEmbeddingService);

  if (!service.isEnabled()) {
    console.error('未启用：请设置 AI_EMBEDDING_ENABLED=true 与 OPENAI_API_KEY');
    await app.close();
    process.exit(2);
  }

  console.log('开始重建语义索引...');
  const counts = await service.reindexAll();
  console.log('完成：', JSON.stringify(counts, null, 2));
  await app.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
