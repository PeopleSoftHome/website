-- 补齐 marketplace 迁移中遗漏的 apps.tags 列
-- schema.prisma 中 App.tags 已声明为 String[] @default([])

ALTER TABLE "apps" ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT '{}';
