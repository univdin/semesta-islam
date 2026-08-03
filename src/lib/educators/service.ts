/**
 * SEMESTA ISLAM — Educator Discovery Service (DB-backed)
 * Governed by docs/03_ERD.md & docs/07_API_ENDPOINTS.md §2.3
 */

import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import { EducatorSummary, LearningMethod, VerificationStatus } from '@/types';
import {
  computeRelatedEducators,
  type RelatedEducator,
  type RelatednessCandidate,
} from '@/lib/educators/related';

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

export { isValidUuid };

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
    slug: educator.slug ?? '',
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

/**
 * Resolve an educator by its canonical slug. Null-safe; an empty or invalid
 * slug returns null. Used by the public entity URL resolver (EXP-11).
 */
export async function getEducatorBySlug(slug: string): Promise<EducatorDetail | null> {
  if (!slug || slug.length === 0) return null;
  return getEducatorDetailByLookup({ slug });
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

export interface DirectoryFilterOptions {
  expertise: string[];
  locations: string[];
}

/**
 * Directory filter options derived from real data (no hardcoded domain lists).
 * Expertise comes from distinct course categories; locations from educator
 * cities. Deterministic alphabetical ordering.
 */
export async function listDirectoryFilterOptions(): Promise<DirectoryFilterOptions> {
  const [categories, profiles] = await Promise.all([
    prisma.courseCatalog.findMany({
      select: { category: true },
      distinct: ['category'],
    }),
    prisma.userProfile.findMany({
      where: { user: { educator: { isNot: null } } },
      select: { locationCity: true },
      distinct: ['locationCity'],
    }),
  ]);

  const expertise = Array.from(
    new Set(categories.map((c) => c.category).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, 'id'));

  const locations = Array.from(
    new Set(profiles.map((p) => p.locationCity).filter((x): x is string => Boolean(x)))
  ).sort((a, b) => a.localeCompare(b, 'id'));

  return { expertise, locations };
}

export async function getEducatorIdForUser(userId: string): Promise<string | null> {
  const profile = await prisma.educatorProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return profile?.id ?? null;
}

// ---------------------------------------------------------------------------
// Discovery / search (EXP-07). Server-side, Postgres-native, deterministic.
// Filters match name/title/institution/bio/course (ILIKE, insensitive) plus
// expertise (course category), location (city) and teaching method.
// ---------------------------------------------------------------------------

export interface EducatorSearchFilters {
  q?: string;
  expertise?: string;
  location?: string;
  method?: 'all' | LearningMethod;
  sort?: 'rating' | 'reviews';
  page?: number;
  limit?: number;
}

export interface EducatorSearchResult {
  educators: EducatorSummary[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

const INSENSITIVE = { mode: 'insensitive' as const };

export async function searchEducators(
  filters: EducatorSearchFilters = {}
): Promise<EducatorSearchResult> {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(50, Math.max(1, filters.limit ?? 9));
  const skip = (page - 1) * limit;

  const where: Prisma.EducatorProfileWhereInput = {};

  if (filters.method && filters.method !== 'all') {
    where.teachingMethod = filters.method;
  }

  if (filters.location) {
    where.user = {
      profile: { locationCity: { contains: filters.location, ...INSENSITIVE } },
    };
  }

  if (filters.expertise) {
    where.courses = {
      some: { category: { contains: filters.expertise, ...INSENSITIVE } },
    };
  }

  if (filters.q) {
    const q = filters.q;
    where.OR = [
      { user: { profile: { fullName: { contains: q, ...INSENSITIVE } } } },
      { titleSuffix: { contains: q, ...INSENSITIVE } },
      { institutionName: { contains: q, ...INSENSITIVE } },
      { user: { profile: { bio: { contains: q, ...INSENSITIVE } } } },
      { courses: { some: { title: { contains: q, ...INSENSITIVE } } } },
      { courses: { some: { category: { contains: q, ...INSENSITIVE } } } },
    ];
  }

  const orderBy: Prisma.EducatorProfileOrderByWithRelationInput[] =
    filters.sort === 'reviews'
      ? [{ reviewsCount: 'desc' }, { ratingAverage: 'desc' }]
      : [{ ratingAverage: 'desc' }, { reviewsCount: 'desc' }];

  const [educators, total] = await Promise.all([
    prisma.educatorProfile.findMany({
      where,
      include: educatorInclude,
      orderBy,
      take: limit,
      skip,
    }),
    prisma.educatorProfile.count({ where }),
  ]);

  return {
    educators: educators.map(toEducatorSummary),
    total,
    page,
    limit,
    hasMore: page * limit < total,
  };
}

/**
 * Deterministic related-educator discovery (EXP-02). Shared signals:
 * course categories, verified SPECIALIZES_IN topics, institution.
 * Bounded: 3 indexed queries; never implies real affiliation.
 */
export async function getRelatedEducators(
  educatorId: string,
  limit = 6
): Promise<RelatedEducator[]> {
  const target = await getEducatorDetail(educatorId);
  if (!target) return [];

  const [allEducators, claimRows] = await Promise.all([
    listEducatorSummaries(),
    prisma.knowledgeClaim.findMany({
      where: { status: 'VERIFIED', predicate: 'SPECIALIZES_IN' },
      select: { educatorId: true, objectText: true },
    }),
  ]);

  const topicsByEducator = new Map<string, string[]>();
  for (const row of claimRows) {
    const list = topicsByEducator.get(row.educatorId) ?? [];
    list.push(row.objectText);
    topicsByEducator.set(row.educatorId, list);
  }

  const candidates: RelatednessCandidate[] = allEducators
    .filter((e) => e.id !== educatorId)
    .map((e) => ({
      id: e.id,
      slug: e.slug,
      name: e.name,
      title: e.title,
      location: e.location,
      avatar: e.avatar,
      verified: e.verified,
      expertise: e.expertise,
      institution: e.institution,
      topics: topicsByEducator.get(e.id) ?? [],
    }));

  return computeRelatedEducators(
    {
      id: educatorId,
      expertise: target.expertise,
      institution: target.institution,
      topics: topicsByEducator.get(educatorId) ?? [],
    },
    candidates,
    limit
  );
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
  slug: string;
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
  return getEducatorDetailByLookup({ id });
}

async function getEducatorDetailByLookup(
  where: { id: string } | { slug: string }
): Promise<EducatorDetail | null> {
  const educator = await prisma.educatorProfile.findUnique({
    where,
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
    slug: educator.slug ?? '',
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
