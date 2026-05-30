-- 修复 User.email 全局唯一索引，支持多租户
-- 将单字段唯一索引改为复合唯一索引 (email, workspaceId)

-- 1. 删除旧的全局唯一索引
DROP INDEX IF EXISTS "users_email_key";

-- 2. 创建新的复合唯一索引
CREATE UNIQUE INDEX "users_email_workspaceId_key" ON "users"("email", "workspaceId");

-- 3. 添加普通索引加速 email 查询（替代被删除的唯一索引的查询加速作用）
CREATE INDEX "users_email_idx" ON "users"("email");
