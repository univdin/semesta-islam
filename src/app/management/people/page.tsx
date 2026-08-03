import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getServerIdentity } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ManagementPeoplePage() {
  const identity = await getServerIdentity();
  if (!identity || !identity.roles.includes('FOUNDER_ADMIN')) notFound();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      status: true,
      createdAt: true,
      profile: { select: { fullName: true } },
      roles: { select: { role: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <main className="main-content">
      <div className="container py-8 max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/management" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 font-heading">Orang &amp; Pengguna</h1>
            <p className="text-sm text-gray-500">Daftar pengguna platform</p>
          </div>
        </div>

        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="card p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#0F3D2E] text-[#D4AF37] flex items-center justify-center shrink-0">
                  {(u.profile?.fullName ?? u.email ?? '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                    {u.profile?.fullName ?? u.email}
                  </p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {u.roles.map((r) => (
                  <span key={r.role} className="text-[10px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    {r.role}
                  </span>
                ))}
                <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {u.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
