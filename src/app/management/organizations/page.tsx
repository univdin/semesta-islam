import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Building2 } from 'lucide-react';
import { getServerIdentity } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ManagementOrganizationsPage() {
  const identity = await getServerIdentity();
  if (!identity || !identity.roles.includes('FOUNDER_ADMIN')) notFound();

  const organizations = await prisma.organization.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      type: true,
      status: true,
      createdAt: true,
      _count: { select: { memberships: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="main-content">
      <div className="container py-8 max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/management" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 font-heading">Organisasi</h1>
            <p className="text-sm text-gray-500">Semua organisasi platform</p>
          </div>
        </div>

        {organizations.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Building2 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>Belum ada organisasi.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {organizations.map((org) => (
              <Link key={org.id} href={`/organization/${org.id}`} className="card p-4 flex items-center justify-between gap-3 hover:shadow-md transition-shadow">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-50 truncate">{org.name}</p>
                  <p className="text-xs text-gray-500">
                    {org.type} · {org.slug} · {org._count.memberships} anggota
                  </p>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 shrink-0">
                  {org.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
