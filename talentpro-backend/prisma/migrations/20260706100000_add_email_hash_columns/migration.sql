-- Add emailHash columns to support HMAC-SHA256 hash index for encrypted emails
ALTER TABLE "users" ADD COLUMN "emailHash" TEXT;
ALTER TABLE "workspace_invites" ADD COLUMN "emailHash" TEXT;

-- Drop plaintext email indexes/constraints that become ineffective after encryption
DROP INDEX IF EXISTS "users_email_idx";
DROP INDEX IF EXISTS "workspace_invites_email_idx";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_email_workspaceId_key";

-- Add hash-based indexes and unique constraint
CREATE INDEX "users_emailHash_idx" ON "users"("emailHash");
CREATE INDEX "workspace_invites_emailHash_idx" ON "workspace_invites"("emailHash");
ALTER TABLE "users" ADD CONSTRAINT "users_emailHash_workspaceId_key" UNIQUE ("emailHash", "workspaceId");
