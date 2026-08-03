import React from 'react';
import Link from 'next/link';
import { Building2, ArrowRight, Users, Settings, Activity } from 'lucide-react';
import { getServerIdentity } from '@/lib/auth/session';
import { listOrganizationsForActor } from '@/lib/organizations/service';

export const dynamic = 'force-dynamic';

export default async function OrganizationPortalPage() {
  const identity = await getServerIdentity();
  if (!identity) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">Portal Organisasi</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Masuk untuk mengelola organisasi Anda.</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-[#0F3D2E] text-white px-6 py-3 rounded-xl font-semibold">
            Masuk <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const organizations = await listOrganizationsForActor(identity);

  return (
    <main className="main-content">
      <div className="container py-8 max-w-3xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 font-heading">
            Portal Organisasi
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Kelola organisasi yang Anda ikuti.
          </p>
        </header>

        {organizations.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Building2 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>Anda belum menjadi anggota organisasi mana pun.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {organizations.map((org) => (
              <Link key={org.id} href={`/organization/${org.id}`} className="card p-5 hover:shadow-md transition-shadow block">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-50">{org.name}</p>
                    <p className="text-xs text-gray-500">
                      {org.type} · Peran: {org.membershipRole} · Status: {org.status}
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="card p-4 flex flex-col gap-1">
            <Users className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-semibold text-sm">Anggota</span>
            <span className="text-xs text-gray-500">Kelola keanggotaan &amp; undangan</span>
          </div>
          <div className="card p-4 flex flex-col gap-1">
            <Activity className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-semibold text-sm">Program</span>
            <span className="text-xs text-gray-500">Kursus &amp; program</span>
          </div>
          <div className="card p-4 flex flex-col gap-1">
            <Settings className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-semibold text-sm">Pengaturan</span>
            <span className="text-xs text-gray-500">Konfigurasi organisasi</span>
          </div>
        </section>
      </div>
    </main>
  );
}
