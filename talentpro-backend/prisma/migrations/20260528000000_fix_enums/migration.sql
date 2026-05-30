-- CreateEnum
CREATE TYPE "WorkspacePlan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "WorkspaceStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DemoBookingScale" AS ENUM ('SCALE_1_10', 'SCALE_11_50', 'SCALE_51_200', 'SCALE_200_PLUS');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('WEBSITE', 'ADS', 'REFERRAL', 'ORGANIC');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('ARTICLE', 'WHITEPAPER', 'VIDEO', 'CASE_STUDY');

-- CreateEnum
CREATE TYPE "ExperimentStatus" AS ENUM ('DRAFT', 'RUNNING', 'PAUSED', 'ENDED');

-- CreateEnum
CREATE TYPE "SensitiveWordCategory" AS ENUM ('SPAM', 'AD', 'OFFENSIVE', 'POLITICAL');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('ACCESS', 'REFRESH');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('COMMENT_REPLY', 'MENTION', 'SYSTEM', 'FOLLOW_UP');

-- DropIndex
DROP INDEX "_BlogPostToTag_A_index";

-- DropIndex
DROP INDEX "_PermissionToRole_A_index";

-- DropIndex
DROP INDEX "blog_posts_deletedAt_idx";

-- DropIndex
DROP INDEX "blog_posts_slug_key";

-- DropIndex
DROP INDEX "comments_deletedAt_idx";

-- DropIndex
DROP INDEX "comments_entityType_entityId_idx";

-- DropIndex
DROP INDEX "forum_posts_deletedAt_idx";

-- DropIndex
DROP INDEX "forum_topics_deletedAt_idx";

-- DropIndex
DROP INDEX "resources_deletedAt_idx";

-- DropIndex
DROP INDEX "users_deletedAt_idx";

-- AlterTable
ALTER TABLE "demo_bookings" DROP COLUMN "scale",
ADD COLUMN     "scale" "DemoBookingScale" NOT NULL DEFAULT 'SCALE_1_10',
DROP COLUMN "source",
ADD COLUMN     "source" "LeadSource" NOT NULL DEFAULT 'WEBSITE';

-- AlterTable
ALTER TABLE "experiments" ALTER COLUMN "variantA" SET NOT NULL,
ALTER COLUMN "variantB" SET NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ExperimentStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "notifications" DROP COLUMN "type",
ADD COLUMN     "type" "NotificationType" NOT NULL;

-- AlterTable
ALTER TABLE "resources" DROP COLUMN "type",
ADD COLUMN     "type" "ResourceType" NOT NULL DEFAULT 'ARTICLE';

-- AlterTable
ALTER TABLE "sensitive_words" DROP COLUMN "category",
ADD COLUMN     "category" "SensitiveWordCategory" NOT NULL DEFAULT 'SPAM';

-- AlterTable
ALTER TABLE "token_blacklist" DROP COLUMN "type",
ADD COLUMN     "type" "TokenType" NOT NULL DEFAULT 'ACCESS';

-- AlterTable
ALTER TABLE "workspaces" DROP COLUMN "plan",
ADD COLUMN     "plan" "WorkspacePlan" NOT NULL DEFAULT 'FREE',
DROP COLUMN "status",
ADD COLUMN     "status" "WorkspaceStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_workspaceId_key" ON "blog_posts"("slug", "workspaceId");

-- CreateIndex
CREATE INDEX "comments_entityType_entityId_status_parentId_idx" ON "comments"("entityType", "entityId", "status", "parentId");

-- CreateIndex
CREATE INDEX "comments_parentId_createdAt_idx" ON "comments"("parentId", "createdAt");

-- CreateIndex
CREATE INDEX "comments_authorId_idx" ON "comments"("authorId");

-- CreateIndex
CREATE INDEX "follow_ups_bookingId_idx" ON "follow_ups"("bookingId");

-- CreateIndex
CREATE INDEX "medias_createdBy_idx" ON "medias"("createdBy");

-- CreateIndex
CREATE INDEX "nav_items_navigationId_idx" ON "nav_items"("navigationId");

-- CreateIndex
CREATE INDEX "nav_items_parentId_idx" ON "nav_items"("parentId");

-- CreateIndex
CREATE INDEX "sections_pageId_idx" ON "sections"("pageId");

-- CreateIndex
CREATE INDEX "users_roleId_idx" ON "users"("roleId");

-- AddForeignKey
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "download_records" ADD CONSTRAINT "download_records_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "download_records" ADD CONSTRAINT "download_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demo_bookings" ADD CONSTRAINT "demo_bookings_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medias" ADD CONSTRAINT "medias_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

