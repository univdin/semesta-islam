-- CreateEnum
CREATE TYPE "EconomicTransactionType" AS ENUM ('EARN', 'SPEND', 'REVERSAL', 'ADJUSTMENT', 'FEE_COLLECTION', 'COMMISSION_ACCRUAL');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('INITIATED', 'AUTHORIZED', 'PENDING', 'COMPLETED', 'FAILED', 'EXPIRED', 'REFUNDED', 'REVERSED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'REFUNDED', 'FAILED');

-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "entity_id" TEXT;

-- AlterTable
ALTER TABLE "economic_ledgers" ADD COLUMN     "idempotency_key" TEXT,
ADD COLUMN     "reversal_of_id" UUID,
ADD COLUMN     "transaction_id" UUID,
ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "economic_transactions" (
    "id" UUID NOT NULL,
    "type" "EconomicTransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'INITIATED',
    "actor_user_id" UUID NOT NULL,
    "account_owner_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'POINT',
    "idempotency_key" TEXT,
    "source" TEXT NOT NULL,
    "reference" TEXT,
    "reason" TEXT,
    "reversal_of_id" UUID,
    "organization_id" UUID,
    "expires_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "economic_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "learner_user_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "provider" TEXT NOT NULL DEFAULT 'SIMULATED_INTERNAL',
    "external_id" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "idempotency_key" TEXT,
    "raw_payload" JSONB DEFAULT '{}',
    "paid_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "economic_transactions_idempotency_key_key" ON "economic_transactions"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "economic_transactions_reversal_of_id_key" ON "economic_transactions"("reversal_of_id");

-- CreateIndex
CREATE INDEX "economic_transactions_account_owner_id_status_idx" ON "economic_transactions"("account_owner_id", "status");

-- CreateIndex
CREATE INDEX "economic_transactions_actor_user_id_idx" ON "economic_transactions"("actor_user_id");

-- CreateIndex
CREATE INDEX "economic_transactions_organization_id_idx" ON "economic_transactions"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_external_id_key" ON "payments"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_idempotency_key_key" ON "payments"("idempotency_key");

-- CreateIndex
CREATE INDEX "payments_booking_id_status_idx" ON "payments"("booking_id", "status");

-- CreateIndex
CREATE INDEX "audit_logs_entity_affected_entity_id_idx" ON "audit_logs"("entity_affected", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "economic_ledgers_idempotency_key_key" ON "economic_ledgers"("idempotency_key");

-- CreateIndex
CREATE INDEX "economic_ledgers_account_owner_id_idx" ON "economic_ledgers"("account_owner_id");

-- CreateIndex
CREATE INDEX "economic_ledgers_transaction_id_idx" ON "economic_ledgers"("transaction_id");

-- AddForeignKey
ALTER TABLE "economic_ledgers" ADD CONSTRAINT "economic_ledgers_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "economic_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "economic_ledgers" ADD CONSTRAINT "economic_ledgers_reversal_of_id_fkey" FOREIGN KEY ("reversal_of_id") REFERENCES "economic_ledgers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "economic_transactions" ADD CONSTRAINT "economic_transactions_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "economic_transactions" ADD CONSTRAINT "economic_transactions_account_owner_id_fkey" FOREIGN KEY ("account_owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "economic_transactions" ADD CONSTRAINT "economic_transactions_reversal_of_id_fkey" FOREIGN KEY ("reversal_of_id") REFERENCES "economic_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_learner_user_id_fkey" FOREIGN KEY ("learner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

