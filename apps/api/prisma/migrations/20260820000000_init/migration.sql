CREATE TYPE "GiftRarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');
CREATE TYPE "InventoryStatus" AS ENUM ('OWNED', 'LISTED', 'TRANSFERRED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'FAILED');

CREATE TABLE "User" (
  "id" UUID NOT NULL,
  "telegramId" BIGINT NOT NULL,
  "username" TEXT,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT,
  "avatarUrl" TEXT,
  "balance" DECIMAL(20,9) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Gift" (
  "id" UUID NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "artwork" TEXT NOT NULL DEFAULT '🎁',
  "description" TEXT NOT NULL,
  "rarity" "GiftRarity" NOT NULL,
  "price" DECIMAL(20,9) NOT NULL,
  "supply" INTEGER NOT NULL,
  "available" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Gift_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Gift_valid_supply" CHECK ("supply" >= 0 AND "available" >= 0 AND "available" <= "supply")
);

CREATE TABLE "InventoryItem" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "giftId" UUID NOT NULL,
  "status" "InventoryStatus" NOT NULL DEFAULT 'OWNED',
  "purchasedPrice" DECIMAL(20,9) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Order" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "giftId" UUID NOT NULL,
  "amount" DECIMAL(20,9) NOT NULL,
  "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");
CREATE UNIQUE INDEX "Gift_slug_key" ON "Gift"("slug");
CREATE INDEX "Gift_rarity_idx" ON "Gift"("rarity");
CREATE INDEX "Gift_createdAt_idx" ON "Gift"("createdAt");
CREATE INDEX "InventoryItem_userId_status_idx" ON "InventoryItem"("userId", "status");
CREATE INDEX "InventoryItem_giftId_idx" ON "InventoryItem"("giftId");
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
CREATE INDEX "Order_giftId_idx" ON "Order"("giftId");

ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "Gift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_giftId_fkey" FOREIGN KEY ("giftId") REFERENCES "Gift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
