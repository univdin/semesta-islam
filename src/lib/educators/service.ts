/**
 * SEMESTA ISLAM — Educator Discovery Service (DB-backed)
 * Governed by docs/03_ERD.md & docs/07_API_ENDPOINTS.md §2.3
 */

import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import { EducatorSummary, LearningMethod, VerificationStatus } from '@/types';

const EDUCATOR_METHOD_LABELS: Record<LearningMethod, string> = {
  ONLINE_ZOOM: 'Online (Zoom / Google Meet)',
  PRIVATE_HOME: 'Privat Tatap Muka di Rumah',
  GROUP_MAJELIS: 'Majelis / Kelompok Belajar',
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

const educatorInclude = {
  user: { include: { profile: true } },
  courses: { select: { title: true, category: true } },
} satisfies Prisma.EducatorProfileInclude;

type EducatorWithProfile = Prisma.EducatorProfileGetPayload<{
  include: typeof educatorInclude;
}>;

function toEducatorSummary(educator: EducatorWithProfile): EducatorSummary {
  const profile = educator.user.profile;
  const categories = Array.from(new Set(educator.courses.map((c) => c.category)));

  return {
    id: educator.id,
    name: profile?.fullName ?? educator.user.email,
    title: educator.titleSuffix ?? '',
    location: profile?.locationCity ?? '',
    rating: educator.ratingAverage,
    reviewsCount: educator.reviewsCount,
    expertise: categories,
    avatar: profile?.avatarUrl ?? '',
    verified: educator.verifiedStatus === 'VERIFIED',
    verifiedStatus: educator.verifiedStatus,
    institution: educator.institutionName ?? '',
    method: EDUCATOR_METHOD_LABELS[educator.teachingMethod],
  };
}

export async function listEducatorSummaries(options: { take?: number } = {}): Promise<EducatorSummary[]> {
  const educators = await prisma.educatorProfile.findMany({
    include: educatorInclude,
    orderBy: [{ ratingAverage: 'desc' }, { reviewsCount: 'desc' }],
    take: options.take,
  });

  return educators.map(toEducatorSummary);
}

export async function getEducatorSummary(id: string): Promise<EducatorSummary | null> {
  if (!isValidUuid(id)) return null;
  const educator = await prisma.educatorProfile.findUnique({
    where: { id },
    include: educatorInclude,
  });

  return educator ? toEducatorSummary(educator) : null;
}

export async function countEducators(): Promise<number> {
  return prisma.educatorProfile.count();
}

export async function countVerifiedEducators(): Promise<number> {
  return prisma.educatorProfile.count({ where: { verifiedStatus: 'VERIFIED' } });
}

export async function countEducatorCities(): Promise<number> {
  const profiles = await prisma.userProfile.findMany({
    where: { user: { educator: { isNot: null } } },
    select: { locationCity: true },
    distinct: ['locationCity'],
  });
  return profiles.filter((p) => p.locationCity).length;
}

export async function getEducatorIdForUser(userId: string): Promise<string | null> {
  const profile = await prisma.educatorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return profile?.id ?? null;
}

export interface SanadDetail {
  id: string;
  qiraahType: string;
  chainDescription: string;
  verifiedByLajnah: boolean;
  createdAt: Date;
}

export interface CredentialDetail {
  id: string;
  badgeType: string;
  issuedAt: Date;
}

export interface VerificationDetail {
  status: VerificationStatus;
  createdAt: Date;
  updatedAt: Date;
  reviewNotes: string | null;
  verifiedByName: string | null;
  verifiedAt: Date | null;
}

export interface EducatorDetail {
  id: string;
  name: string;
  title: string;
  location: string;
  rating: number;
  reviewsCount: number;
  expertise: string[];
  avatar: string;
  verified: boolean;
  verifiedStatus: VerificationStatus;
  institution: string;
  method: string;
  bio: string;
  sanad: SanadDetail[];
  credentials: CredentialDetail[];
  verification: VerificationDetail | null;
  courses: { id: string; title: string; category: string }[];
}

export async function getEducatorDetail(id: string): Promise<EducatorDetail | null> {
  if (!isValidUuid(id)) return null;
  const educator = await prisma.educatorProfile.findUnique({
    where: { id },
    include: {
      user: { include: { profile: true } },
      sanadRecords: { orderBy: { createdAt: 'asc' } },
      courses: { select: { id: true, title: true, category: true } },
      badges: { orderBy: { issuedAt: 'asc' } },
      verifications: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          verifiedBy: { select: { email: true, profile: { select: { fullName: true } } } },
        },
      },
    },
  });

  if (!educator) return null;

  const profile = educator.user.profile;
  const categories = Array.from(new Set(educator.courses.map((c) => c.category)));
  const latestVerification = educator.verifications[0];

  return {
    id: educator.id,
    name: profile?.fullName ?? educator.user.email,
    title: educator.titleSuffix ?? '',
    location: profile?.locationCity ?? '',
    rating: educator.ratingAverage,
    reviewsCount: educator.reviewsCount,
    expertise: categories,
    avatar: profile?.avatarUrl ?? '',
    verified: educator.verifiedStatus === 'VERIFIED',
    verifiedStatus: latestVerification?.status ?? educator.verifiedStatus,
    institution: educator.institutionName ?? '',
    method: EDUCATOR_METHOD_LABELS[educator.teachingMethod],
    bio: profile?.bio ?? '',
    sanad: educator.sanadRecords.map((s) => ({
      id: s.id,
      qiraahType: s.qiraahType,
      chainDescription: s.chainDescription,
      verifiedByLajnah: s.verifiedByLajnah,
      createdAt: s.createdAt,
    })),
    credentials: educator.badges.map((b) => ({
      id: b.id,
      badgeType: b.badgeType,
      issuedAt: b.issuedAt,
    })),
    verification: latestVerification
      ? {
          status: latestVerification.status,
          createdAt: latestVerification.createdAt,
          updatedAt: latestVerification.updatedAt,
          reviewNotes: latestVerification.reviewNotes,
          verifiedByName:
            latestVerification.verifiedBy?.profile?.fullName ??
            latestVerification.verifiedBy?.email ??
            null,
          verifiedAt: latestVerification.verifiedAt,
        }
      : null,
    courses: educator.courses.map((c) => ({ id: c.id, title: c.title, category: c.category })),
  };
}
