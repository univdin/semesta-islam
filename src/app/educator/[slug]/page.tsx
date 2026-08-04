import React from 'react';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  ShieldCheck,
  MapPin,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Info,
  FileBadge,
  GraduationCap,
  Building2,
  Users,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { getEducatorDetail, getEducatorBySlug, getRelatedEducators } from '@/lib/educators/service';
import { resolveEducatorSegment } from '@/lib/educators/resolve';
import { getKnowledgeOverview, listClaimsForEducator } from '@/lib/knowledge/service';
import { resolveTopicBySlugOrAlias } from '@/lib/topics/service';
import { listVerifiedProfileUrls } from '@/lib/identity/service';
import { isDemoMode } from '@/lib/auth/session';
import { CommunitySection } from '@/components/community/CommunitySection';
import type { VerificationStatus } from '@/types';
import type { ClaimPredicate } from '@prisma/client';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resolution = await resolveEducatorSegment(slug, {
    bySlug: getEducatorBySlug,
    byId: getEducatorDetail,
  });
  const educator = resolution.educator;
  if (!educator) {
    return { title: 'Pendidik Tidak Ditemukan — SEMESTA ISLAM' };
  }
  const canonicalSlug = resolution.matchedBy === 'uuid' ? educator.slug : slug;
  const baseMetadata: Metadata = {
    title: `${educator.name} — Pendidik ${educator.verified ? 'Terverifikasi' : 'Belum Terverifikasi'} — ILMIFY`,
    description: `${educator.name}${educator.title ? `, ${educator.title}` : ''}${educator.location ? ` (${educator.location})` : ''}. Pelajari kredensial, sanad, dan profil pendidik di SEMESTA ISLAM.`,
    alternates: { canonical: `/educator/${canonicalSlug}` },
    openGraph: {
      title: `${educator.name} — ILMIFY`,
      description:
        educator.expertise.length > 0
          ? `Keahlian: ${educator.expertise.join(', ')}. Profil pendidik Islam di SEMESTA ISLAM.`
          : `Profil pendidik Islam di SEMESTA ISLAM.`,
      type: 'profile',
      images: [
        {
          url: educator.avatar || '/og-image.svg',
          width: 600,
          height: 600,
          alt: `${educator.name} — ILMIFY`,
        },
      ],
    },
  };

  // Unverified educators are not indexable trust entities: exclude them from
  // search engines until Lajnah verification completes (trust-gate contract
  // mirrored in the directory and sitemap).
  if (!educator.verified) {
    return { ...baseMetadata, robots: { index: false, follow: false } };
  }

  return baseMetadata;
}

const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  VERIFIED: 'Terverifikasi Lajnah',
  SUBMITTED: 'Menunggu Verifikasi Lajnah',
  UNDER_REVIEW_LAJNAH: 'Sedang Ditelaah Lajnah',
  REJECTED: 'Verifikasi Ditolak',
  DRAFT: 'Belum Diverifikasi',
  REVOKED: 'Verifikasi Dicabut',
};

const VERIFICATION_EXPLANATIONS: Record<VerificationStatus, string> = {
  VERIFIED:
    'Profil pendidik ini telah melalui proses penelaahan kredensial oleh Lajnah SEMESTA ISLAM dan dinyatakan terverifikasi.',
  SUBMITTED:
    'Pengajuan verifikasi telah diterima dan sedang menunggu penelaahan Lajnah SEMESTA ISLAM.',
  UNDER_REVIEW_LAJNAH:
    'Berkas kredensial sedang ditelaah oleh Lajnah SEMESTA ISLAM.',
  REJECTED:
    'Pengajuan verifikasi tidak disetujui pada penelaahan Lajnah SEMESTA ISLAM.',
  DRAFT: 'Profil ini belum mengajukan verifikasi Lajnah SEMESTA ISLAM.',
  REVOKED: 'Status verifikasi pendidik ini telah dicabut oleh Lajnah SEMESTA ISLAM.',
};

const VERIFICATION_STYLES: Record<VerificationStatus, string> = {
  VERIFIED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  SUBMITTED: 'bg-amber-50 text-amber-800 border-amber-200',
  UNDER_REVIEW_LAJNAH: 'bg-blue-50 text-blue-800 border-blue-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
  DRAFT: 'bg-gray-100 text-gray-600 border-gray-200',
  REVOKED: 'bg-gray-100 text-gray-600 border-gray-200',
};

const QIRAAH_LABELS: Record<string, string> = {
  HAFSH_AN_ASHIM: "Qira'ah Hafsh 'an 'Ashim",
  QIRAAT_SANAD: 'Sanad Qira\'at',
  HADITS_SANAD: 'Sanad Hadits',
  TAHSIN: 'Tahsin Al-Qur\'an',
  TAJWID: 'Tajwid & Tahfidz',
};

const CREDENTIAL_LABELS: Record<string, string> = {
  LAJNAH_VERIFIED: 'Kredensial Terverifikasi Lajnah',
  SANAD_VERIFIED: 'Sanad Terverifikasi Lajnah',
};

const CLAIM_PREDICATE_LABELS: Record<ClaimPredicate, string> = {
  GRADUATED_FROM: 'Lulusan',
  HOLDS_CREDENTIAL: 'Memegang kredensial',
  HAS_SANAD_IN: 'Sanad dalam',
  SPECIALIZES_IN: 'Spesialisasi',
  AFFILIATED_WITH: 'Berafiliasi dengan',
  AUTHORED: 'Menulis / mengarang',
};

function formatDate(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function VerificationBadge({ status }: { status: VerificationStatus }) {
  const Icon =
    status === 'VERIFIED'
      ? CheckCircle2
      : status === 'REJECTED' || status === 'REVOKED'
        ? XCircle
        : Clock;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
        VERIFICATION_STYLES[status]
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
      {VERIFICATION_LABELS[status]}
    </span>
  );
}

export default async function EducatorProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const resolution = await resolveEducatorSegment(slug, {
    bySlug: getEducatorBySlug,
    byId: getEducatorDetail,
  });
  const educator = resolution.educator;
  const demoMode = isDemoMode();

  if (!educator) {
    notFound();
  }

  if (resolution.matchedBy === 'uuid') {
    const canonicalSlug = educator.slug || slug;
    permanentRedirect(`/educator/${canonicalSlug}`);
  }

  const [verifiedClaims, knowledgeOverview, relatedEducators] = await Promise.all([
    listClaimsForEducator(educator.id, { onlyVerified: true }),
    getKnowledgeOverview(educator.id),
    getRelatedEducators(educator.id, 6),
  ]);
  const sameAsUrls = await listVerifiedProfileUrls(educator.id);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilmify.id';
  const profileUrl = `${siteUrl}/educator/${slug}`;
  const topicNames = Array.from(
    new Set([
      ...educator.expertise,
      ...verifiedClaims
        .filter((c) => c.predicate === 'SPECIALIZES_IN')
        .map((c) => c.objectText),
    ])
  );
  const topicSlugs = await Promise.all(
    topicNames.map(async (name) => {
      const resolved = await resolveTopicBySlugOrAlias(name);
      return resolved ? { name, slug: resolved.slug } : { name, slug: null };
    })
  );
  const educationClaims = verifiedClaims.filter((c) => c.predicate === 'GRADUATED_FROM');
  const affiliationClaims = verifiedClaims.filter((c) => c.predicate === 'AFFILIATED_WITH');
  const hasInstitution =
    educator.institution && !affiliationClaims.some((c) => c.objectText === educator.institution);

  return (
    <main className="main-content pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: educator.name,
            jobTitle: educator.title,
            address: educator.location
              ? { '@type': 'PostalAddress', addressLocality: educator.location, addressCountry: 'ID' }
              : undefined,
            url: profileUrl,
            sameAs: sameAsUrls.length > 0 ? sameAsUrls : undefined,
            knowsAbout: topicNames,
            aggregateRating: educator.reviewsCount > 0
              ? {
                  '@type': 'AggregateRating',
                  ratingValue: educator.rating,
                  reviewCount: educator.reviewsCount,
                }
              : undefined,
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Beranda', item: siteUrl },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Direktori Pendidik',
                item: `${siteUrl}/directory`,
              },
              { '@type': 'ListItem', position: 3, name: educator.name, item: profileUrl },
            ],
          }),
        }}
      />
      <div className="container py-8 max-w-5xl">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
            <li>
              <Link href="/" className="hover:text-emerald-800">
                Beranda
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-3 h-3 text-gray-300" />
            </li>
            <li>
              <Link href="/directory" className="hover:text-emerald-800">
                Direktori Pendidik
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-3 h-3 text-gray-300" />
            </li>
            <li className="text-gray-700 font-medium truncate max-w-[220px]" aria-current="page">
              {educator.name}
            </li>
          </ol>
        </nav>

        {demoMode && (
          <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
            <span>
              Mode demo — profil ini menampilkan data pendidik simulasi yang diunggah untuk pengembangan
              lokal. Bukan data pengguna riil.
            </span>
          </div>
        )}

        {/* Hero */}
        <div className="glass-panel p-6 md:p-8 rounded-2xl mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <div className="relative shrink-0">
              <img
                src={educator.avatar}
                alt={educator.name}
                className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-[#0F3D2E]"
              />
              {educator.verified && (
                <div className="absolute bottom-1 right-1 bg-[#D4AF37] p-1.5 rounded-full text-white shadow-md">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
                <VerificationBadge status={educator.verifiedStatus} />
                <span className="bg-amber-50 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full">
                  {educator.institution}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-[#0F3D2E]">{educator.name}</h1>
              <p className="text-gray-600 font-medium mt-1">{educator.title}</p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" /> {educator.location}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-gray-400" /> {educator.method}
                </span>

              </div>

              {topicNames.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-4">
                  {topicSlugs.map(({ name, slug: topicSlug }) => (
                    <Link
                      key={name}
                      href={
                        topicSlug
                          ? `/topics/${topicSlug}`
                          : `/directory?expertise=${encodeURIComponent(name)}`
                      }
                      className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                    >
                      {name}
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link
                  href={`/booking?educatorId=${educator.id}`}
                  className="btn btn-primary text-sm py-3 px-6 inline-flex items-center justify-center"
                >
                  <Calendar className="w-4 h-4 mr-2" /> Ajukan Sesi Belajar
                </Link>
                <Link
                  href="/directory"
                  className="btn btn-secondary text-sm py-3 px-6 inline-flex items-center justify-center"
                >
                  Cari Pendidik Lain
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {educator.bio && (
              <section className="glass-panel p-6 rounded-2xl">
                <h2 className="text-lg font-bold text-[#0F3D2E] mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#D4AF37]" /> Profil & Riwayat Ringkas
                </h2>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">{educator.bio}</p>
              </section>
            )}

            {/* Verification / Trust */}
            <section className="glass-panel p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-[#0F3D2E] mb-1 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" /> Verifikasi Lajnah
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Status penelaahan kredensial oleh Lajnah SEMESTA ISLAM. Sanad, kredensial, dan reputasi
                adalah hal yang terpisah dari verifikasi ini.
              </p>

              <div className="flex flex-col gap-3">
                <VerificationBadge status={educator.verifiedStatus} />
                <p className="text-sm text-gray-700 leading-relaxed">
                  {VERIFICATION_EXPLANATIONS[educator.verifiedStatus]}
                </p>
                {educator.verification && (
                  <p className="text-xs text-gray-400">
                    Terakhir diperbarui {formatDate(educator.verification.updatedAt)}
                  </p>
                )}
                {educator.verification?.status === 'VERIFIED' &&
                  educator.verification.verifiedByName && (
                    <p className="text-xs font-medium text-emerald-700">
                      Diverifikasi oleh {educator.verification.verifiedByName}
                      {educator.verification.verifiedAt
                        ? ` · ${formatDate(educator.verification.verifiedAt)}`
                        : ''}
                    </p>
                  )}
                {educator.verification?.reviewNotes && (
                  <div className="bg-white/60 border border-emerald-900/10 rounded-xl p-3 text-sm text-gray-700">
                    <p className="text-xs font-semibold text-[#0F3D2E] mb-1">Catatan Lajnah</p>
                    {educator.verification.reviewNotes}
                  </div>
                )}
              </div>
            </section>

            {/* Sanad */}
            <section className="glass-panel p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-[#0F3D2E] mb-1 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#D4AF37]" /> Sanad Keilmuan
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Rangkaian hubungan keilmuan yang tercatat pada profil pendidik.
              </p>
              {educator.sanad.length > 0 ? (
                <ul className="space-y-3">
                  {educator.sanad.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 bg-white/60 p-4 rounded-xl border border-emerald-900/10"
                    >
                      <div className="bg-[#E6F4ED] text-[#0F3D2E] p-1.5 rounded-lg shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{item.chainDescription}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {QIRAAH_LABELS[item.qiraahType] ?? item.qiraahType}
                          </span>
                          {item.verifiedByLajnah ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Sanad terverifikasi Lajnah
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                              <Clock className="w-3 h-3" /> Belum terverifikasi
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  Belum ada sanad keilmuan yang tercatat untuk pendidik ini.
                </p>
              )}
            </section>

            {/* Education (verified GRADUATED_FROM claims) */}
            {educationClaims.length > 0 && (
              <section className="glass-panel p-6 rounded-2xl">
                <h2 className="text-lg font-bold text-[#0F3D2E] mb-1 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#D4AF37]" /> Pendidikan
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  Riwayat pendidikan yang tervalidasi dengan sumber. Hanya klaim terverifikasi yang
                  ditampilkan.
                </p>
                <ul className="space-y-3">
                  {educationClaims.map((claim) => (
                    <li
                      key={claim.id}
                      className="flex items-start gap-3 bg-white/60 p-4 rounded-xl border border-emerald-900/10"
                    >
                      <div className="bg-[#E6F4ED] text-[#0F3D2E] p-1.5 rounded-lg shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{claim.objectText}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                          </span>
                          {claim.verifiedByName && (
                            <span> · oleh {claim.verifiedByName}</span>
                          )}
                          {claim.verifiedAt && <span> · {formatDate(claim.verifiedAt)}</span>}
                          {claim.source?.title && <span> · {claim.source.title}</span>}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Affiliations (verified AFFILIATED_WITH claims) */}
            {(affiliationClaims.length > 0 || hasInstitution) && (
              <section className="glass-panel p-6 rounded-2xl">
                <h2 className="text-lg font-bold text-[#0F3D2E] mb-1 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#D4AF37]" /> Afiliasi & Kelembagaan
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  Lembaga atau organisasi terkait yang tervalidasi dengan sumber.
                </p>
                <ul className="space-y-3">
                  {affiliationClaims.map((claim) => (
                    <li
                      key={claim.id}
                      className="flex items-start gap-3 bg-white/60 p-4 rounded-xl border border-emerald-900/10"
                    >
                      <div className="bg-[#E6F4ED] text-[#0F3D2E] p-1.5 rounded-lg shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{claim.objectText}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                          </span>
                          {claim.verifiedByName && (
                            <span> · oleh {claim.verifiedByName}</span>
                          )}
                          {claim.source?.title && <span> · {claim.source.title}</span>}
                        </p>
                      </div>
                    </li>
                  ))}
                  {hasInstitution && (
                    <li className="flex items-start gap-3 bg-white/60 p-4 rounded-xl border border-emerald-900/10">
                      <div className="bg-[#E6F4ED] text-[#0F3D2E] p-1.5 rounded-lg shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{educator.institution}</p>
                    </li>
                  )}
                </ul>
              </section>
            )}

            {/* Credential */}
            <section className="glass-panel p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-[#0F3D2E] mb-1 flex items-center gap-2">
                <FileBadge className="w-5 h-5 text-[#D4AF37]" /> Kredensial
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Kredensial yang tercatat dan diverifikasi pada profil pendidik.
              </p>
              {educator.credentials.length > 0 ? (
                <ul className="space-y-3">
                  {educator.credentials.map((credential) => (
                    <li
                      key={credential.id}
                      className="flex items-center gap-3 bg-white/60 p-4 rounded-xl border border-emerald-900/10"
                    >
                      <div className="bg-[#D4AF37]/15 text-[#B08A2E] p-1.5 rounded-lg shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">
                          {CREDENTIAL_LABELS[credential.badgeType] ?? credential.badgeType}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Diterbitkan {formatDate(credential.issuedAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  Belum ada kredensial yang ditampilkan untuk pendidik ini.
                </p>
              )}
            </section>

            {/* Knowledge Claims (verified only, provenance-backed) */}
            <section className="glass-panel p-6 rounded-2xl">
              <h2 className="text-lg font-bold text-[#0F3D2E] mb-1 flex items-center gap-2">
                <FileBadge className="w-5 h-5 text-[#D4AF37]" /> Klaim Keilmuan & Sumber
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Fakta keilmuan yang terverifikasi, lengkap dengan sumber & bukti pendukung. Hanya klaim
                terverifikasi yang ditampilkan kepada publik.
                {knowledgeOverview.evidenceCount > 0 && (
                  <span className="font-medium text-gray-600">
                    {' '}· {knowledgeOverview.evidenceCount} klaim terverifikasi
                  </span>
                )}
              </p>
              {verifiedClaims.length > 0 ? (
                <ul className="space-y-3">
                  {verifiedClaims.map((claim) => (
                    <li
                      key={claim.id}
                      className="bg-white/60 p-4 rounded-xl border border-emerald-900/10"
                    >
                      <div className="flex flex-wrap items-baseline gap-1.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#B08A2E]">
                          {CLAIM_PREDICATE_LABELS[claim.predicate]}
                        </span>
                        <p className="text-sm font-semibold text-gray-800">{claim.objectText}</p>
                      </div>
                      <div className="mt-2 space-y-1 text-xs text-gray-500">
                        {claim.source && (
                          <p className="flex items-start gap-1.5">
                            <span className="text-gray-400">Sumber:</span>
                            {claim.source.url ? (
                              <a
                                href={claim.source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-800 underline underline-offset-2 hover:text-emerald-600"
                              >
                                {claim.source.title}
                              </a>
                            ) : (
                              <span>{claim.source.title}</span>
                            )}
                          </p>
                        )}
                        <p className="flex flex-wrap items-center gap-x-2">
                          <span className="inline-flex items-center gap-1 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" /> Terverifikasi Lajnah
                          </span>
                          {claim.verifiedByName && <span>oleh {claim.verifiedByName}</span>}
                          {claim.verifiedAt && (
                            <span>{formatDate(claim.verifiedAt)}</span>
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  Belum ada klaim keilmuan terverifikasi yang ditampilkan untuk pendidik ini.
                </p>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Programs */}
            <section className="glass-panel p-6 rounded-2xl">
              <h2 className="text-base font-bold text-[#0F3D2E] mb-4">
                Program Belajar Ditawarkan
              </h2>
              {educator.courses.length > 0 ? (
                <div className="space-y-3">
                  {educator.courses.map((course) => (
                    <div
                      key={course.id}
                      className="p-3 bg-white/70 rounded-xl border border-gray-100 text-sm font-medium text-gray-800"
                    >
                      {course.title}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Belum ada program belajar yang tercatat.
                </p>
              )}
            </section>

            {/* Related Educators (deterministic shared-signal projection) */}
            {relatedEducators.length > 0 && (
              <section className="glass-panel p-6 rounded-2xl">
                <h2 className="text-base font-bold text-[#0F3D2E] mb-1 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#D4AF37]" /> Pendidik Terkait
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  Berdasarkan kesamaan bidang, topik, atau kelembagaan. Bukan pernyataan afiliasi
                  langsung.
                </p>
                <ul className="space-y-3">
                  {relatedEducators.map((rel) => (
                    <li key={rel.id}>
                      <Link
                        href={`/educator/${rel.slug}`}
                        className="flex items-center gap-3 p-2 -m-2 rounded-xl hover:bg-emerald-50 transition-colors"
                      >
                        {rel.avatar && (
                          <img
                            src={rel.avatar}
                            alt={rel.name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-100"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">
                            {rel.name}
                          </p>
                          <p className="text-[11px] text-gray-500 leading-snug">{rel.reason}</p>
                        </div>
                        {rel.verified && (
                          <span className="shrink-0 text-emerald-700">
                            <ShieldCheck className="w-4 h-4" />
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Verified digital profiles */}
            {sameAsUrls.length > 0 && (
              <section className="glass-panel p-6 rounded-2xl">
                <h2 className="text-base font-bold text-[#0F3D2E] mb-3 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#D4AF37]" /> Profil Digital Terverifikasi
                </h2>
                <ul className="space-y-2">
                  {sameAsUrls.map((url) => (
                    <li key={url}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-800 hover:text-emerald-600 break-all"
                      >
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Booking CTA */}
            <section className="glass-panel p-6 rounded-2xl bg-[#0F3D2E] border-[#0F3D2E]">
              <h2 className="text-base font-bold text-white mb-2">Siap Mengajukan Sesi?</h2>
              <p className="text-xs text-emerald-200 leading-relaxed mb-4">
                Ajukan jadwal bimbingan dengan {educator.name} dan mulai perjalanan belajar Anda.
              </p>
              <Link
                href={`/booking?educatorId=${educator.id}`}
                className="w-full inline-flex items-center justify-center text-sm font-semibold py-3 rounded-xl bg-[#D4AF37] text-[#0F3D2E] hover:bg-[#C49F2F] transition-colors"
              >
                <Calendar className="w-4 h-4 mr-2" /> Ajukan Sesi Belajar
              </Link>
            </section>
          </div>
        </div>

        <div className="mt-8">
          <CommunitySection
            targetType="EDUCATOR_PROFILE"
            targetId={educator.id}
            context={{ educatorId: educator.id }}
          />
        </div>
      </div>
    </main>
  );
}
