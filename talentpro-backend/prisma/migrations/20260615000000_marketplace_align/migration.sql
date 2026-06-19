-- AlterTable
ALTER TABLE "app_reviews" DROP COLUMN "helpfulCount",
DROP COLUMN "isVerifiedPurchase",
ADD COLUMN     "replyAt" TIMESTAMP(3),
ADD COLUMN     "replyBy" TEXT,
ADD COLUMN     "replyContent" TEXT,
ADD COLUMN     "workspaceId" TEXT;

-- AlterTable
ALTER TABLE "app_vendors" DROP COLUMN "isVerified",
DROP COLUMN "logo",
ADD COLUMN     "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "userId" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "contactEmail" SET NOT NULL,
ALTER COLUMN "revenueShareRate" SET NOT NULL,
ALTER COLUMN "revenueShareRate" SET DEFAULT 0.70;

-- AlterTable
ALTER TABLE "apps" ADD COLUMN     "demoVideoUrl" TEXT,
ADD COLUMN     "reviewNotes" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedBy" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "tagline" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "categoryId" SET NOT NULL,
ALTER COLUMN "vendorId" SET NOT NULL,
ALTER COLUMN "iconUrl" SET NOT NULL,
ALTER COLUMN "coverImages" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "compatibility" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "integrationType" SET NOT NULL,
ALTER COLUMN "integrationType" SET DEFAULT 'oauth',
ALTER COLUMN "ratingAvg" SET NOT NULL,
ALTER COLUMN "ratingAvg" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "medias" ADD COLUMN     "thumbUrl" TEXT,
ADD COLUMN     "webpUrl" TEXT;

-- CreateIndex
CREATE INDEX "app_reviews_userId_idx" ON "app_reviews"("userId");

-- CreateIndex
CREATE INDEX "app_reviews_workspaceId_idx" ON "app_reviews"("workspaceId");

-- CreateIndex
CREATE INDEX "apps_categoryId_idx" ON "apps"("categoryId");

-- CreateIndex
CREATE INDEX "apps_vendorId_idx" ON "apps"("vendorId");

-- CreateIndex
CREATE INDEX "apps_featured_featuredSortOrder_idx" ON "apps"("featured", "featuredSortOrder");

-- CreateIndex
CREATE INDEX "apps_pricingModel_idx" ON "apps"("pricingModel");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNo_key" ON "orders"("orderNo");

