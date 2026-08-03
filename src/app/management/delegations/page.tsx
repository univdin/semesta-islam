import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { getServerIdentity } from '@/lib/auth/session';
import { listDelegationsForActor } from '@/lib/delegations/service';
import { prisma } from '@/lib/db';
import { DelegationForm } from './DelegationForm';

export const dynamic = 'force-dynamic';

export default async function ManagementDelegationsPage() {
  const identity = await getServerIdentity();
  if (!identity || !identity.roles.includes('FOUNDER_ADMIN')) notFound();

  const [delegations, users, organizations] = await Promise.all([
    listDelegationsForActor(identity),
    prisma.user.findMany({
      select: { id: true, email: true, profile: { select: { fullName: true } } },
      orderBy: { email: 'asc' },
      take: 200,
    }),
    prisma.organization.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <main className="main-content">
      <div className="container py-8 max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/management" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 font-heading">Delegasi</h1>
            <p className="text-sm text-gray-500">
              Berikan kapabilitas eksplisit kepada staf/co-founder tanpa memberikan otoritas Founder.
            </p>
          </div>
        </div>

        <DelegationForm users={users} organizations={organizations} />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 font-heading">Delegasi Aktif</h2>
          {delegations.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <KeyRound className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>Belum ada delegasi.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {delegations.map((d) => {
                const caps = Array.isArray(d.capabilities) ? (d.capabilities as unknown as string[]) : [];
                return (
                  <div key={d.id} className="card p-4 space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
                          {d.grantor.email} → {d.delegate.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          Dibuat {new Date(d.createdAt).toLocaleDateString('id-ID')}
                          {d.expiresAt && ` · Berakhir ${new Date(d.expiresAt).toLocaleDateString('id-ID')}`}
                        </p>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-full ${d.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                        {d.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {caps.map((c) => (
                        <span key={c} className="text-[10px] px-2 py-1 rounded-md bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                          {c}
                        </span>
                      ))}
                    </div>
                    {d.reason && <p className="text-xs text-gray-500 italic">{d.reason}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
