-- CreateEnum
CREATE TYPE "AttributionActorType" AS ENUM ('ORGANIC', 'SOCIAL', 'CREATOR', 'MEMBER', 'AMBASSADOR', 'AFFILIATE', 'PARTNER', 'INSTITUTION');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('ACCRUED', 'APPROVED', 'SETTLED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DelegationStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'REMOVED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CONFIRMED', 'BOOKING_INQUIRED', 'VERIFICATION_SUBMITTED', 'VERIFICATION_REVIEWED', 'VERIFICATION_REJECTED', 'MEMBER_INVITED', 'DELEGATION_GRANTED', 'DELEGATION_REVOKED', 'ANNOUNCEMENT', 'SYSTEM_ALERT');

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('ORG_OWNER', 'ORG_ADMIN', 'ORG_MANAGER', 'ORG_STAFF', 'ORG_MEMBER');

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('INSTITUTION', 'COMMUNITY', 'PARTNER');

-- CreateEnum
CREATE TYPE "PermissionScope" AS ENUM ('PLATFORM', 'ORGANIZATION', 'RESOURCE', 'SELF');

-- CreateEnum
CREATE TYPE "XpActionType" AS ENUM ('QUALIFIED_VISIT', 'QUALIFIED_REFERRAL_ACTIVATION', 'DIAGNOSTIC_COMPLETED', 'LEARNING_MODULE_COMPLETED', 'COMMUNITY_KHIDMAH', 'REVERSAL_FRAUD');

-- CreateTable
CREATE TABLE "attribution_records" (
    "id" UUID NOT NULL,
    "actor_user_id" UUID,
    "actor_type" "AttributionActorType" NOT NULL,
    "landing_path" TEXT NOT NULL,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "campaign_code" TEXT,
    "fraud_signals" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attribution_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backup_records" (
    "id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "manifest" JSONB DEFAULT '{}',
    "backup_size" INTEGER,
    "checksum" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "backup_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_records" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "campaign_type" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "changelog_entries" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT,
    "version" TEXT,
    "audience" TEXT NOT NULL DEFAULT 'public',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "author_user_id" UUID NOT NULL,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "changelog_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commission_ledgers" (
    "id" UUID NOT NULL,
    "affiliate_id" UUID NOT NULL,
    "booking_id" UUID,
    "accrued_amount" DOUBLE PRECISION NOT NULL,
    "approved_amount" DOUBLE PRECISION,
    "status" "CommissionStatus" NOT NULL DEFAULT 'ACCRUED',
    "payout_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commission_ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delegations" (
    "id" UUID NOT NULL,
    "grantor_user_id" UUID NOT NULL,
    "delegate_user_id" UUID NOT NULL,
    "organization_id" UUID,
    "capabilities" JSONB NOT NULL DEFAULT '[]',
    "status" "DelegationStatus" NOT NULL DEFAULT 'ACTIVE',
    "starts_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "revoked_by" UUID,

    CONSTRAINT "delegations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_health" (
    "id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DISCONNECTED',
    "last_success_at" TIMESTAMP(3),
    "last_failure_at" TIMESTAMP(3),
    "error_code" TEXT,
    "error_message" TEXT,
    "latency_ms" INTEGER,
    "quota_status" TEXT,
    "metadata" JSONB DEFAULT '{}',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_health_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_jobs" (
    "id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "last_error" TEXT,
    "payload" JSONB DEFAULT '{}',
    "result" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "integration_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "read_at" TIMESTAMP(3),
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_memberships" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "role" "OrganizationRole" NOT NULL DEFAULT 'ORG_MEMBER',
    "status" "MembershipStatus" NOT NULL DEFAULT 'INVITED',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "organization_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL DEFAULT 'INSTITUTION',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "owner_user_id" UUID NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reputation_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "consistency_score" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "contribution_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "integrity_score" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "derived_standing" TEXT NOT NULL DEFAULT 'CONTRIBUTOR_INITIATE',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reputation_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "role" "OrganizationRole" NOT NULL,
    "scope" "PermissionScope" NOT NULL DEFAULT 'ORGANIZATION',
    "organization_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "xp_ledgers" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "event_id" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "action_type" "XpActionType" NOT NULL,
    "source" TEXT NOT NULL,
    "reference" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xp_ledgers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "backup_records_provider_created_at_idx" ON "backup_records"("provider" ASC, "created_at" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "campaign_records_code_key" ON "campaign_records"("code" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "changelog_entries_slug_key" ON "changelog_entries"("slug" ASC);

-- CreateIndex
CREATE INDEX "delegations_delegate_user_id_idx" ON "delegations"("delegate_user_id" ASC);

-- CreateIndex
CREATE INDEX "delegations_grantor_user_id_idx" ON "delegations"("grantor_user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "integration_health_provider_key" ON "integration_health"("provider" ASC);

-- CreateIndex
CREATE INDEX "integration_jobs_provider_status_idx" ON "integration_jobs"("provider" ASC, "status" ASC);

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id" ASC, "read_at" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "organization_memberships_user_id_organization_id_key" ON "organization_memberships"("user_id" ASC, "organization_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "reputation_profiles_user_id_key" ON "reputation_profiles"("user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_permission_id_role_organization_id_key" ON "role_permissions"("permission_id" ASC, "role" ASC, "organization_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "xp_ledgers_idempotency_key_key" ON "xp_ledgers"("idempotency_key" ASC);

-- AddForeignKey
ALTER TABLE "attribution_records" ADD CONSTRAINT "attribution_records_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "changelog_entries" ADD CONSTRAINT "changelog_entries_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_ledgers" ADD CONSTRAINT "commission_ledgers_affiliate_id_fkey" FOREIGN KEY ("affiliate_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_ledgers" ADD CONSTRAINT "commission_ledgers_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "booking_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delegations" ADD CONSTRAINT "delegations_delegate_user_id_fkey" FOREIGN KEY ("delegate_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delegations" ADD CONSTRAINT "delegations_grantor_user_id_fkey" FOREIGN KEY ("grantor_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delegations" ADD CONSTRAINT "delegations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reputation_profiles" ADD CONSTRAINT "reputation_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "xp_ledgers" ADD CONSTRAINT "xp_ledgers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

