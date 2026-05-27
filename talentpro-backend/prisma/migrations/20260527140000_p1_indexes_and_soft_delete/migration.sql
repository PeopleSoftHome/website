-- P1 修复：隐式连接表 A 端索引 + 软删除字段

-- 隐式连接表 A 端索引（Prisma 自动生成表，默认只有 B 端索引）
CREATE INDEX IF NOT EXISTS "_PermissionToRole_A_index" ON "_PermissionToRole"("A");
CREATE INDEX IF NOT EXISTS "_BlogPostToTag_A_index" ON "_BlogPostToTag"("A");

-- 为核心业务表添加软删除字段
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "forum_topics" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "forum_posts" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

-- 为软删除字段创建索引以加速过滤
CREATE INDEX IF NOT EXISTS "blog_posts_deletedAt_idx" ON "blog_posts"("deletedAt");
CREATE INDEX IF NOT EXISTS "forum_topics_deletedAt_idx" ON "forum_topics"("deletedAt");
CREATE INDEX IF NOT EXISTS "forum_posts_deletedAt_idx" ON "forum_posts"("deletedAt");
CREATE INDEX IF NOT EXISTS "comments_deletedAt_idx" ON "comments"("deletedAt");
CREATE INDEX IF NOT EXISTS "users_deletedAt_idx" ON "users"("deletedAt");
CREATE INDEX IF NOT EXISTS "resources_deletedAt_idx" ON "resources"("deletedAt");
