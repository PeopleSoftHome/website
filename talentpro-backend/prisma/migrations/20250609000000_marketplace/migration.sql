-- Marketplace enums
CREATE TYPE "AppStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'SUSPENDED', 'DEPRECATED');
CREATE TYPE "PricingModel" AS ENUM ('FREE', 'ONE_TIME', 'SUBSCRIPTION', 'USAGE_BASED', 'FREEMIUM');
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'ALIPAY', 'WECHAT_PAY', 'BANK_TRANSFER');

-- CreateTable app_categories
CREATE TABLE "app_categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "app_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable app_vendors
CREATE TABLE "app_vendors" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "website" TEXT,
    "contactEmail" TEXT,
    "revenueShareRate" DOUBLE PRECISION,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "app_vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable apps
CREATE TABLE "apps" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "description" TEXT,
    "categoryId" TEXT,
    "vendorId" TEXT,
    "iconUrl" TEXT,
    "coverImages" TEXT[],
    "pricingModel" "PricingModel" NOT NULL,
    "pricingTiers" JSONB,
    "version" TEXT NOT NULL DEFAULT '1.0.0',
    "compatibility" TEXT[],
    "integrationType" TEXT,
    "status" "AppStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredSortOrder" INTEGER,
    "installCount" INTEGER NOT NULL DEFAULT 0,
    "ratingAvg" DOUBLE PRECISION,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "workspaceId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable app_reviews
CREATE TABLE "app_reviews" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "app_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable subscriptions
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "tierName" TEXT NOT NULL,
    "pricingModel" "PricingModel" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "interval" TEXT NOT NULL DEFAULT 'month',
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "cancelledAt" TIMESTAMP(3),
    "provider" "PaymentProvider",
    "providerSubId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable orders
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "provider" "PaymentProvider",
    "providerPaymentId" TEXT,
    "invoiceRequested" BOOLEAN NOT NULL DEFAULT false,
    "invoiceNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_categories_slug_key" ON "app_categories"("slug");
CREATE INDEX "app_categories_parentId_idx" ON "app_categories"("parentId");
CREATE INDEX "app_categories_sortOrder_idx" ON "app_categories"("sortOrder");
CREATE UNIQUE INDEX "app_vendors_slug_key" ON "app_vendors"("slug");
CREATE UNIQUE INDEX "apps_slug_key" ON "apps"("slug");
CREATE INDEX "apps_workspaceId_idx" ON "apps"("workspaceId");
CREATE INDEX "apps_status_idx" ON "apps"("status");
CREATE INDEX "app_reviews_appId_idx" ON "app_reviews"("appId");
CREATE INDEX "subscriptions_appId_idx" ON "subscriptions"("appId");
CREATE INDEX "subscriptions_workspaceId_idx" ON "subscriptions"("workspaceId");
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");
CREATE INDEX "subscriptions_providerSubId_idx" ON "subscriptions"("providerSubId");
CREATE INDEX "orders_workspaceId_idx" ON "orders"("workspaceId");
CREATE INDEX "orders_status_idx" ON "orders"("status");
CREATE INDEX "orders_orderNo_idx" ON "orders"("orderNo");

-- AddForeignKey
ALTER TABLE "app_categories" ADD CONSTRAINT "app_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "app_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "apps" ADD CONSTRAINT "apps_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "app_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "apps" ADD CONSTRAINT "apps_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "app_vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "app_reviews" ADD CONSTRAINT "app_reviews_appId_fkey" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_appId_fkey" FOREIGN KEY ("appId") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
