-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DigitalPlatform" AS ENUM ('WEBSITE', 'YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'X', 'FACEBOOK', 'OTHER');

-- CreateEnum
CREATE TYPE "DigitalProfileStatus" AS ENUM ('SELF_DECLARED', 'SUBMITTED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "knowledge_claims" ADD COLUMN     "topic_id" UUID;

-- CreateTable
CREATE TABLE "topics" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "status" "TopicStatus" NOT NULL DEFAULT 'DRAFT',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_aliases" (
    "id" UUID NOT NULL,
    "topic_id" UUID NOT NULL,
    "alias" TEXT NOT NULL,

    CONSTRAINT "topic_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "digital_profiles" (
    "id" UUID NOT NULL,
    "educator_id" UUID NOT NULL,
    "platform" "DigitalPlatform" NOT NULL,
    "url" TEXT NOT NULL,
    "handle" TEXT,
    "status" "DigitalProfileStatus" NOT NULL DEFAULT 'SELF_DECLARED',
    "verified_by_id" UUID,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "digital_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_by_id" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "topics_slug_key" ON "topics"("slug");

-- CreateIndex
CREATE INDEX "topics_status_sort_order_idx" ON "topics"("status", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "topic_aliases_alias_key" ON "topic_aliases"("alias");

-- CreateIndex
CREATE INDEX "topic_aliases_topic_id_idx" ON "topic_aliases"("topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "digital_profiles_educator_id_platform_url_key" ON "digital_profiles"("educator_id", "platform", "url");

-- CreateIndex
CREATE INDEX "digital_profiles_status_idx" ON "digital_profiles"("status");

-- CreateIndex
CREATE INDEX "knowledge_claims_topic_id_idx" ON "knowledge_claims"("topic_id");

-- AddForeignKey
ALTER TABLE "knowledge_claims" ADD CONSTRAINT "knowledge_claims_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topics" ADD CONSTRAINT "topics_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_aliases" ADD CONSTRAINT "topic_aliases_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_profiles" ADD CONSTRAINT "digital_profiles_educator_id_fkey" FOREIGN KEY ("educator_id") REFERENCES "educator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_profiles" ADD CONSTRAINT "digital_profiles_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_settings" ADD CONSTRAINT "platform_settings_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
