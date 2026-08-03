-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('DRAFT', 'UNVERIFIED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ClaimPredicate" AS ENUM ('GRADUATED_FROM', 'HOLDS_CREDENTIAL', 'HAS_SANAD_IN', 'SPECIALIZES_IN', 'AFFILIATED_WITH', 'AUTHORED');

-- AlterTable
ALTER TABLE "verification_requests" ADD COLUMN     "verified_at" TIMESTAMP(3),
ADD COLUMN     "verified_by_id" UUID;

-- CreateTable
CREATE TABLE "sources" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "publisher" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidences" (
    "id" UUID NOT NULL,
    "source_id" UUID,
    "url" TEXT NOT NULL,
    "sha256" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_claims" (
    "id" UUID NOT NULL,
    "educator_id" UUID NOT NULL,
    "predicate" "ClaimPredicate" NOT NULL,
    "object_text" TEXT NOT NULL,
    "object_type" TEXT,
    "status" "ClaimStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "confidence" DOUBLE PRECISION,
    "source_id" UUID,
    "evidence_id" UUID,
    "verified_by_id" UUID,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "evidences_source_id_idx" ON "evidences"("source_id");

-- CreateIndex
CREATE INDEX "knowledge_claims_educator_id_status_idx" ON "knowledge_claims"("educator_id", "status");

-- CreateIndex
CREATE INDEX "knowledge_claims_predicate_idx" ON "knowledge_claims"("predicate");

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidences" ADD CONSTRAINT "evidences_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_claims" ADD CONSTRAINT "knowledge_claims_educator_id_fkey" FOREIGN KEY ("educator_id") REFERENCES "educator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_claims" ADD CONSTRAINT "knowledge_claims_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_claims" ADD CONSTRAINT "knowledge_claims_evidence_id_fkey" FOREIGN KEY ("evidence_id") REFERENCES "evidences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_claims" ADD CONSTRAINT "knowledge_claims_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
