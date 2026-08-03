-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('VISIBLE', 'HIDDEN', 'REPORTED', 'UNDER_REVIEW', 'REMOVED', 'LOCKED');

-- CreateEnum
CREATE TYPE "CommunityTargetType" AS ENUM ('EDUCATOR_PROFILE', 'TOPIC', 'QUESTION', 'ANSWER', 'COMMENT');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('HELPFUL', 'AGREE', 'ENDORSE');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'COMMENT_ADDED';
ALTER TYPE "NotificationType" ADD VALUE 'COMMENT_REPLY';
ALTER TYPE "NotificationType" ADD VALUE 'QUESTION_ANSWERED';
ALTER TYPE "NotificationType" ADD VALUE 'ANSWER_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE 'CONTENT_REPORTED';
ALTER TYPE "NotificationType" ADD VALUE 'CONTENT_MODERATED';

-- AlterTable
ALTER TABLE "knowledge_claims" ADD COLUMN     "source_comment_id" UUID;

-- CreateTable
CREATE TABLE "community_comments" (
    "id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "target_type" "CommunityTargetType" NOT NULL,
    "target_id" UUID NOT NULL,
    "parent_id" UUID,
    "body" TEXT NOT NULL,
    "status" "ModerationStatus" NOT NULL DEFAULT 'VISIBLE',
    "is_correction" BOOLEAN NOT NULL DEFAULT false,
    "correction_note" TEXT,
    "moderated_by_id" UUID,
    "moderated_at" TIMESTAMP(3),
    "edited_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_votes" (
    "id" UUID NOT NULL,
    "voter_id" UUID NOT NULL,
    "target_type" "CommunityTargetType" NOT NULL,
    "target_id" UUID NOT NULL,
    "vote_type" "VoteType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_reports" (
    "id" UUID NOT NULL,
    "reporter_id" UUID NOT NULL,
    "target_type" "CommunityTargetType" NOT NULL,
    "target_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resolved_by_id" UUID,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_questions" (
    "id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "topic_id" UUID,
    "educator_id" UUID,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "ModerationStatus" NOT NULL DEFAULT 'VISIBLE',
    "moderated_by_id" UUID,
    "moderated_at" TIMESTAMP(3),
    "edited_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_answers" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "status" "ModerationStatus" NOT NULL DEFAULT 'VISIBLE',
    "accepted_at" TIMESTAMP(3),
    "accepted_by_id" UUID,
    "moderated_by_id" UUID,
    "moderated_at" TIMESTAMP(3),
    "edited_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "community_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "community_comments_target_type_target_id_status_idx" ON "community_comments"("target_type", "target_id", "status");

-- CreateIndex
CREATE INDEX "community_comments_author_id_idx" ON "community_comments"("author_id");

-- CreateIndex
CREATE INDEX "community_comments_status_created_at_idx" ON "community_comments"("status", "created_at");

-- CreateIndex
CREATE INDEX "community_votes_target_type_target_id_idx" ON "community_votes"("target_type", "target_id");

-- CreateIndex
CREATE UNIQUE INDEX "community_votes_voter_id_target_type_target_id_vote_type_key" ON "community_votes"("voter_id", "target_type", "target_id", "vote_type");

-- CreateIndex
CREATE INDEX "community_reports_status_idx" ON "community_reports"("status");

-- CreateIndex
CREATE UNIQUE INDEX "community_reports_reporter_id_target_type_target_id_key" ON "community_reports"("reporter_id", "target_type", "target_id");

-- CreateIndex
CREATE INDEX "community_questions_status_created_at_idx" ON "community_questions"("status", "created_at");

-- CreateIndex
CREATE INDEX "community_questions_topic_id_status_idx" ON "community_questions"("topic_id", "status");

-- CreateIndex
CREATE INDEX "community_questions_educator_id_status_idx" ON "community_questions"("educator_id", "status");

-- CreateIndex
CREATE INDEX "community_answers_question_id_status_idx" ON "community_answers"("question_id", "status");

-- CreateIndex
CREATE INDEX "community_answers_author_id_idx" ON "community_answers"("author_id");

-- AddForeignKey
ALTER TABLE "knowledge_claims" ADD CONSTRAINT "knowledge_claims_source_comment_id_fkey" FOREIGN KEY ("source_comment_id") REFERENCES "community_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "community_comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_moderated_by_id_fkey" FOREIGN KEY ("moderated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_votes" ADD CONSTRAINT "community_votes_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_reports" ADD CONSTRAINT "community_reports_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_questions" ADD CONSTRAINT "community_questions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_questions" ADD CONSTRAINT "community_questions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_questions" ADD CONSTRAINT "community_questions_educator_id_fkey" FOREIGN KEY ("educator_id") REFERENCES "educator_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_questions" ADD CONSTRAINT "community_questions_moderated_by_id_fkey" FOREIGN KEY ("moderated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_answers" ADD CONSTRAINT "community_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "community_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_answers" ADD CONSTRAINT "community_answers_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_answers" ADD CONSTRAINT "community_answers_accepted_by_id_fkey" FOREIGN KEY ("accepted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_answers" ADD CONSTRAINT "community_answers_moderated_by_id_fkey" FOREIGN KEY ("moderated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
