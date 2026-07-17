-- 语义 RAG：pgvector 扩展 + 内容向量表
-- 前置：数据库需安装 pgvector（官方镜像 pgvector/pgvector:pg16 或 CREATE EXTENSION 权限）
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "ai_embeddings" (
    "id" TEXT NOT NULL,
    "refType" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "slug" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_embeddings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ai_embeddings_refType_refId_key" ON "ai_embeddings"("refType", "refId");
CREATE INDEX "ai_embeddings_refType_idx" ON "ai_embeddings"("refType");

-- 余弦相似度近似索引（pgvector ≥ 0.5.0）
CREATE INDEX "ai_embeddings_embedding_hnsw" ON "ai_embeddings" USING hnsw ("embedding" vector_cosine_ops);
