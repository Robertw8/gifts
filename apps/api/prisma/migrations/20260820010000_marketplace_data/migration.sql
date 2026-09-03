CREATE TYPE "BalanceTransactionType" AS ENUM ('DEPOSIT', 'PURCHASE', 'REFUND', 'BONUS');
CREATE TYPE "BalanceTransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

CREATE TABLE "Category" (
  "id" UUID NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "artwork" TEXT NOT NULL,
  "accent" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Banner" (
  "id" UUID NOT NULL,
  "slug" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "subtitle" TEXT,
  "imageUrl" TEXT NOT NULL,
  "artwork" TEXT NOT NULL,
  "style" TEXT NOT NULL,
  "gradientFrom" TEXT NOT NULL,
  "gradientTo" TEXT NOT NULL,
  "targetPath" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "giftId" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BalanceTransaction" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "orderId" UUID,
  "type" "BalanceTransactionType" NOT NULL,
  "amount" DECIMAL(20,9) NOT NULL,
  "status" "BalanceTransactionStatus" NOT NULL DEFAULT 'COMPLETED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BalanceTransaction_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Category" ("id", "slug", "name", "artwork", "accent", "sortOrder")
VALUES ('00000000-0000-4000-8000-000000000001', 'collectibles', 'Collectibles', '🎁', '#8269df', 0);

ALTER TABLE "Gift" ADD COLUMN "categoryId" UUID;
ALTER TABLE "Gift" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Gift" ADD COLUMN "popularity" INTEGER NOT NULL DEFAULT 0;
UPDATE "Gift" SET "categoryId" = '00000000-0000-4000-8000-000000000001';
ALTER TABLE "Gift" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "InventoryItem" ADD COLUMN "orderId" UUID;

CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX "Banner_slug_key" ON "Banner"("slug");
CREATE UNIQUE INDEX "InventoryItem_orderId_key" ON "InventoryItem"("orderId");
CREATE UNIQUE INDEX "BalanceTransaction_orderId_key" ON "BalanceTransaction"("orderId");
CREATE INDEX "Gift_categoryId_idx" ON "Gift"("categoryId");
CREATE INDEX "Gift_featured_popularity_idx" ON "Gift"("featured", "popularity");
CREATE INDEX "Banner_active_sortOrder_idx" ON "Banner"("active", "sortOrder");
CREATE INDEX "Banner_giftId_idx" ON "Banner"("giftId");
CREATE INDEX "BalanceTransaction_userId_createdAt_idx" ON "BalanceTransaction"("userId", "createdAt");
CREATE INDEX "BalanceTransaction_status_idx" ON "BalanceTransaction"("status");

ALTER TABLE "Gift" ADD CONSTRAINT "Gift_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Banner" ADD CONSTRAINT "Banner_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "Gift"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BalanceTransaction" ADD CONSTRAINT "BalanceTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BalanceTransaction" ADD CONSTRAINT "BalanceTransaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
