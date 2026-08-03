import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  ShieldCheck,
  Star,
  MapPin,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Info,
  FileBadge,
} from 'lucide-react';
import { getEducatorDetail } from '@/lib/educators/service';
import { isDemoMode } from '@/lib/auth/session';
import type { VerificationStatus } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const educator = await getEducatorDetail(id);
  if (!educator) {
    return { title: 'Pendidik Tidak Ditemukan — SEMESTA ISLAM' };
  }
  return {
    title: `${educator.name} — Pendidik ${educator.verified ? 'Terverifikasi' : ''} SEMESTA ISLAM`,
    description: `${educator.name}${educator.title ? `, ${educator.title}` : ''}${educator.location ? ` (${educator.location})` : ''}. Pelajari kredensial, sanad, dan profil pendidik di SEMESTA ISLAM.`,
    alternates: { canonical: `/educator/${id}` },
    openGraph: {
      title: `${educator.name} — SEMESTA ISLAM`,
      description:
        educator.expertise.length > 0
          ? `Keahlian: ${educator.expertise.join(', ')}. Profil pendidik Islam di SEMESTA ISLAM.`
          : `Profil pendidik Islam di SEMESTA ISLAM.`,
      type: 'profile',
    },
  };
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
  const resolvedParams = await params;
  const educator = await getEducatorDetail(resolvedParams.id);
  const demoMode = isDemoMode();

  if (!educator) {
    notFound();
  }

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
            url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://semesta-islam.vercel.app'}/educator/${resolvedParams.id}`,
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
      <div className="container py-8 max-w-5xl">
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
      </div>
    </main>
  );
}
