-- CreateTable
CREATE TABLE "chatbot_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL DEFAULT 'default',
    "intents" JSONB NOT NULL DEFAULT '[]',
    "quickReplies" JSONB NOT NULL DEFAULT '[]',
    "fallbackCopy" TEXT NOT NULL DEFAULT '抱歉，我暂时无法理解您的问题，建议您预约演示或联系人工客服。',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chatbot_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_chat_sessions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chatbot_configs_key_key" ON "chatbot_configs"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ai_chat_sessions_sessionId_key" ON "ai_chat_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "ai_chat_sessions_sessionId_idx" ON "ai_chat_sessions"("sessionId");
