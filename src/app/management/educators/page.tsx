import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, GraduationCap, Users } from 'lucide-react';
import { getServerIdentity } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { EducatorCreateForm } from './EducatorCreateForm';

export const dynamic = 'force-dynamic';

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  SUBMITTED: 'bg-amber-50 text-amber-800',
  UNDER_REVIEW_LAJNAH: 'bg-blue-50 text-blue-800',
  VERIFIED: 'bg-emerald-50 text-emerald-800',
  REJECTED: 'bg-red-50 text-red-700',
  REVOKED: 'bg-gray-100 text-gray-600',
};

export default async function ManagementEducatorsPage() {
  const identity = await getServerIdentity();
  if (!identity || !identity.roles.includes('FOUNDER_ADMIN')) notFound();

  const educators = await prisma.educatorProfile.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      verifiedStatus: true,
      institutionName: true,
      user: {
        select: {
          email: true,
          profile: { select: { fullName: true } },
        },
      },
    },
  });

  return (
    <main className="main-content">
      <div className="container py-8 max-w-5xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/management" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading">Pendidik</h1>
            <p className="text-sm text-gray-500">
              Kelola profil pendidik tanpa akses database langsung. Data yang dibuat di sini bersifat
              riil dan tunduk pada kebijakan publikasi terverifikasi.
            </p>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#0F3D2E]" /> Tambah Pendidik
          </h2>
          <EducatorCreateForm />
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#0F3D2E]" /> Daftar Pendidik ({educators.length})
          </h2>
          {educators.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada profil pendidik.</p>
          ) : (
            <div className="space-y-2">
              {educators.map((e) => (
                <div key={e.id} className="card p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {e.user.profile?.fullName ?? e.user.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {e.user.email} {e.institutionName ? ` · ${e.institutionName}` : ''}
                    </p>
                    {e.slug && (
                      <p className="text-[11px] text-gray-400 font-mono truncate">/{e.slug}</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 text-[10px] px-2 py-1 rounded-full font-medium ${STATUS_BADGE[e.verifiedStatus] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {e.verifiedStatus.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
