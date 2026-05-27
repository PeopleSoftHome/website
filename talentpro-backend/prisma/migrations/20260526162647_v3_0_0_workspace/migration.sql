-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- AlterTable
ALTER TABLE "blog_posts" ADD COLUMN     "workspaceId" TEXT;

-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "workspaceId" TEXT;

-- AlterTable
ALTER TABLE "demo_bookings" ADD COLUMN     "workspaceId" TEXT;

-- AlterTable
ALTER TABLE "forum_posts" ADD COLUMN     "workspaceId" TEXT;

-- AlterTable
ALTER TABLE "forum_topics" ADD COLUMN     "workspaceId" TEXT;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "workspaceId" TEXT;

-- AlterTable
ALTER TABLE "user_activities" ADD COLUMN     "workspaceId" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "workspaceId" TEXT,
ADD COLUMN     "workspaceRole" "WorkspaceRole" DEFAULT 'MEMBER';

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_slug_key" ON "workspaces"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "workspaces_ownerId_key" ON "workspaces"("ownerId");

-- CreateIndex
CREATE INDEX "blog_posts_workspaceId_idx" ON "blog_posts"("workspaceId");

-- CreateIndex
CREATE INDEX "comments_workspaceId_idx" ON "comments"("workspaceId");

-- CreateIndex
CREATE INDEX "demo_bookings_workspaceId_idx" ON "demo_bookings"("workspaceId");

-- CreateIndex
CREATE INDEX "forum_posts_workspaceId_idx" ON "forum_posts"("workspaceId");

-- CreateIndex
CREATE INDEX "forum_topics_workspaceId_idx" ON "forum_topics"("workspaceId");

-- CreateIndex
CREATE INDEX "notifications_workspaceId_idx" ON "notifications"("workspaceId");

-- CreateIndex
CREATE INDEX "user_activities_workspaceId_idx" ON "user_activities"("workspaceId");

-- CreateIndex
CREATE INDEX "users_workspaceId_idx" ON "users"("workspaceId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
