import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Users } from 'lucide-react';
import { getServerIdentity } from '@/lib/auth/session';
import { listOrganizationsForActor } from '@/lib/organizations/service';

export const dynamic = 'force-dynamic';

export default async function MemberOrganizationsPage() {
  const identity = await getServerIdentity();
  if (!identity) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <p className="text-gray-500">Silakan <Link href="/login" className="text-[#0F3D2E] underline">masuk</Link> terlebih dahulu.</p>
      </div>
    );
  }

  const organizations = await listOrganizationsForActor(identity);

  return (
    <main className="main-content">
      <div className="container py-8 max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/member" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 font-heading">Organisasi Saya</h1>
            <p className="text-sm text-gray-500">Keanggotaan organisasi / institusi Anda</p>
          </div>
        </div>

        {organizations.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Building2 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>Anda belum bergabung dengan organisasi mana pun.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {organizations.map((org) => (
              <Link key={org.id} href={`/organization/${org.id}`} className="card p-5 flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-50">{org.name}</p>
                  <p className="text-xs text-gray-500">
                    {org.type} · Peran: {org.membershipRole}
                  </p>
                </div>
                <Users className="w-5 h-5 text-gray-400" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
