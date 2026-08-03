import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Users, ShieldCheck } from 'lucide-react';
import { getServerIdentity } from '@/lib/auth/session';
import { getOrganizationDetail } from '@/lib/organizations/service';
import { CAPABILITIES } from '@/lib/auth/permissions';
import { can } from '@/lib/auth/authorization';
import { MemberInviteForm } from './MemberInviteForm';

export const dynamic = 'force-dynamic';

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const identity = await getServerIdentity();
  if (!identity) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <p className="text-gray-500">Silakan <Link href="/login" className="text-[#0F3D2E] underline">masuk</Link> terlebih dahulu.</p>
      </div>
    );
  }

  let org;
  try {
    org = await getOrganizationDetail(identity, id);
  } catch {
    notFound();
  }

  const myMembership = org.memberships.find((m) => m.userId === identity.userId);
  const canInvite = await can({
    actor: identity,
    capability: CAPABILITIES.MEMBERS_INVITE,
    organizationId: id,
  });

  return (
    <main className="main-content">
      <div className="container py-8 max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/organization" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 font-heading">{org.name}</h1>
            <p className="text-sm text-gray-500">
              {org.type} · Peran Anda: {myMembership?.role ?? '—'}
            </p>
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 font-heading flex items-center gap-2">
              <Users className="w-5 h-5 text-[#D4AF37]" /> Anggota ({org.memberships.length})
            </h2>
            {canInvite && (
              <MemberInviteForm organizationId={id} />
            )}
          </div>

          <div className="space-y-2">
            {org.memberships.map((m) => (
              <div key={m.id} className="card p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#0F3D2E] text-[#D4AF37] flex items-center justify-center shrink-0">
                    {(m.user?.profile?.fullName ?? m.user?.email ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                      {m.user?.profile?.fullName ?? m.user?.email}
                    </p>
                    <p className="text-xs text-gray-500">{m.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {m.role}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {myMembership && myMembership.role !== 'ORG_MEMBER' && (
          <section className="card p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Anda memiliki peran manajerial di organisasi ini. Kelola anggota dan pengaturan melalui panel organisasi.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
