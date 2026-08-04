import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  Building2,
  KeyRound,
  History,
  DatabaseBackup,
  Mail,
  Activity,
  Coins,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import { getServerIdentity } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ManagementIndexPage() {
  const identity = await getServerIdentity();
  if (!identity) {
    notFound();
  }
  if (!identity.roles.includes('FOUNDER_ADMIN')) {
    notFound();
  }

  const [userCount, orgCount, delegationCount, backupCount, unreadAlerts] = await Promise.all([
    prisma.user.count(),
    prisma.organization.count(),
    prisma.delegation.count({ where: { status: 'ACTIVE' } }),
    prisma.backupRecord.count(),
    prisma.integrationHealth.count({ where: { status: 'FAILED' } }),
  ]);

  const sections = [
    {
      href: '/management/people',
      icon: Users,
      title: 'Orang & Pengguna',
      desc: 'Kelola pengguna platform',
    },
    {
      href: '/management/educators',
      icon: GraduationCap,
      title: 'Pendidik',
      desc: 'Tambah & kelola profil pendidik',
    },
    {
      href: '/management/organizations',
      icon: Building2,
      title: 'Organisasi',
      desc: 'Lihat semua organisasi',
    },
    {
      href: '/management/delegations',
      icon: KeyRound,
      title: 'Delegasi',
      desc: 'Delegasikan kapabilitas ke staf',
    },
    {
      href: '/management/audit',
      icon: History,
      title: 'Audit Trail',
      desc: 'Rekam aktivitas sensitif',
    },
    {
      href: '/management/backups',
      icon: DatabaseBackup,
      title: 'Backup & Operasional',
      desc: 'Backup, verifikasi, export',
    },
    {
      href: '/management/economy',
      icon: Coins,
      title: 'Ekonomi',
      desc: 'Transaksi, ledger, penyesuaian, reversal',
    },
    {
      href: '/management/communications',
      icon: Mail,
      title: 'Komunikasi',
      desc: 'Changelog & pengumuman',
    },
    {
      href: '/management/system',
      icon: Activity,
      title: 'Sistem & Integrasi',
      desc: 'Kesehatan sistem & integrasi',
    },
    {
      href: '/management/governance',
      icon: ShieldCheck,
      title: 'Governance',
      desc: 'Preview — belum fungsional',
    },
  ];

  return (
    <main className="main-content">
      <div className="container py-8 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 font-heading">
            Management &amp; Governance
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Control plane Founder/Owner — {identity.email}
          </p>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{userCount}</p>
            <p className="text-xs text-gray-500">Pengguna</p>
          </div>
          <div className="card p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{orgCount}</p>
            <p className="text-xs text-gray-500">Organisasi</p>
          </div>
          <div className="card p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{delegationCount}</p>
            <p className="text-xs text-gray-500">Delegasi Aktif</p>
          </div>
          <div className="card p-4">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{backupCount}</p>
            <p className="text-xs text-gray-500">Backup</p>
          </div>
        </section>

        {unreadAlerts > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 text-sm px-4 py-3 rounded-xl">
            {unreadAlerts} integrasi dalam status gagal. Periksa halaman Sistem.
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {sections.map((s) => (
            <Link key={s.href} href={s.href} className="card p-5 hover:shadow-md transition-shadow flex flex-col gap-2 group">
              <s.icon className="w-6 h-6 text-[#D4AF37]" />
              <span className="font-semibold text-gray-900 dark:text-gray-50">{s.title}</span>
              <span className="text-xs text-gray-500">{s.desc}</span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
