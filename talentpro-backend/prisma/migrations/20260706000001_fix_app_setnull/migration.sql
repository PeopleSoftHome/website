-- Fix Prisma SetNull warnings: categoryId and vendorId are required fields,
-- so onDelete cannot be SetNull. Use Restrict to prevent deleting referenced rows.

ALTER TABLE "apps" DROP CONSTRAINT IF EXISTS "apps_categoryId_fkey";
ALTER TABLE "apps" ADD CONSTRAINT "apps_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "app_categories"("id") ON DELETE RESTRICT;

ALTER TABLE "apps" DROP CONSTRAINT IF EXISTS "apps_vendorId_fkey";
ALTER TABLE "apps" ADD CONSTRAINT "apps_vendorId_fkey"
  FOREIGN KEY ("vendorId") REFERENCES "app_vendors"("id") ON DELETE RESTRICT;
