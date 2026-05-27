-- v3.0.0 High Value Features Migration
-- Generated manually since database is offline

-- New CMS tables
CREATE TABLE "stats" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "suffix" TEXT,
    "prefix" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stats_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "stats_key_key" UNIQUE ("key")
);

CREATE TABLE "client_logos" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "industry" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "client_logos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "why_us_tabs" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT,
    "metrics" JSONB DEFAULT '[]',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "why_us_tabs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "why_us_tabs_slug_key" UNIQUE ("slug")
);

CREATE TABLE "ai_cards" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "features" JSONB DEFAULT '[]',
    "color" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_cards_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ai_cards_slug_key" UNIQUE ("slug")
);

-- Download gating
CREATE TABLE "download_records" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "phone" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "download_records_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "download_records_resourceId_idx" ON "download_records"("resourceId");
CREATE INDEX "download_records_userId_idx" ON "download_records"("userId");

-- A/B Testing
CREATE TABLE "experiments" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "variantA" JSONB DEFAULT '{}',
    "variantB" JSONB DEFAULT '{}',
    "trafficSplit" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "winner" TEXT,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "experiments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "experiments_key_key" UNIQUE ("key")
);

CREATE TABLE "experiment_events" (
    "id" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "properties" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "experiment_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "experiment_events_experimentId_variant_eventType_idx" ON "experiment_events"("experimentId", "variant", "eventType");
CREATE INDEX "experiment_events_sessionId_idx" ON "experiment_events"("sessionId");

-- AI Content Moderation
CREATE TABLE "sensitive_words" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'spam',
    "severity" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sensitive_words_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "sensitive_words_word_key" UNIQUE ("word")
);

-- Token Blacklist
CREATE TABLE "token_blacklist" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'access',
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "token_blacklist_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "token_blacklist_token_key" UNIQUE ("token")
);
CREATE INDEX "token_blacklist_token_idx" ON "token_blacklist"("token");
CREATE INDEX "token_blacklist_userId_idx" ON "token_blacklist"("userId");

-- Alter existing tables
ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "requiresLeadInfo" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "aiRiskScore" DOUBLE PRECISION;
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "aiFlags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "abVariant" TEXT;
