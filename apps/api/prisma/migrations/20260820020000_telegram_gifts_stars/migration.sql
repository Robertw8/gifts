CREATE TYPE "GiftSource" AS ENUM ('TELEGRAM', 'INTERNAL');
CREATE TYPE "StarsPaymentStatus" AS ENUM ('PENDING', 'PRECHECKOUT_APPROVED', 'PAID', 'FAILED');

ALTER TABLE "Gift"
  ADD COLUMN "source" "GiftSource" NOT NULL DEFAULT 'INTERNAL',
  ADD COLUMN "telegramGiftId" TEXT,
  ADD COLUMN "telegramStarCount" INTEGER,
  ADD COLUMN "telegramUpgradeStarCount" INTEGER,
  ADD COLUMN "telegramFileId" TEXT,
  ADD COLUMN "telegramFileUniqueId" TEXT,
  ADD COLUMN "telegramIsPremium" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "telegramRaw" JSONB,
  ADD COLUMN "telegramSyncedAt" TIMESTAMP(3);

ALTER TABLE "InventoryItem"
  ADD COLUMN "source" "GiftSource" NOT NULL DEFAULT 'INTERNAL';

ALTER TABLE "Order"
  ADD COLUMN "source" "GiftSource" NOT NULL DEFAULT 'INTERNAL';

CREATE TABLE "StarsPayment" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "balanceTransactionId" UUID,
  "invoicePayload" TEXT NOT NULL,
  "starCount" INTEGER NOT NULL,
  "status" "StarsPaymentStatus" NOT NULL DEFAULT 'PENDING',
  "telegramPaymentChargeId" TEXT,
  "providerPaymentChargeId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "paidAt" TIMESTAMP(3),
  CONSTRAINT "StarsPayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Gift_telegramGiftId_key" ON "Gift"("telegramGiftId");
CREATE INDEX "Gift_source_available_idx" ON "Gift"("source", "available");
CREATE UNIQUE INDEX "StarsPayment_balanceTransactionId_key" ON "StarsPayment"("balanceTransactionId");
CREATE UNIQUE INDEX "StarsPayment_invoicePayload_key" ON "StarsPayment"("invoicePayload");
CREATE UNIQUE INDEX "StarsPayment_telegramPaymentChargeId_key" ON "StarsPayment"("telegramPaymentChargeId");
CREATE INDEX "StarsPayment_userId_createdAt_idx" ON "StarsPayment"("userId", "createdAt");
CREATE INDEX "StarsPayment_status_idx" ON "StarsPayment"("status");

ALTER TABLE "StarsPayment"
  ADD CONSTRAINT "StarsPayment_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StarsPayment"
  ADD CONSTRAINT "StarsPayment_balanceTransactionId_fkey"
  FOREIGN KEY ("balanceTransactionId") REFERENCES "BalanceTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
