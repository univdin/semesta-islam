import React from 'react';
import Link from 'next/link';
import { Bell, UserRound, Building2, History, ShieldCheck, Coins, ArrowRight } from 'lucide-react';
import { getServerIdentity } from '@/lib/auth/session';
import { listNotificationsForUser, countUnreadNotifications } from '@/lib/notifications/service';
import { listOrganizationsForActor } from '@/lib/organizations/service';
import { hasRole } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function MemberDashboardPage() {
  const identity = await getServerIdentity();

  if (!identity) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2">Portal Member</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Masuk untuk melihat dasbor pribadi Anda.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-[#0F3D2E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#16533F]"
          >
            Masuk <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const [notifications, unread, organizations] = await Promise.all([
    listNotificationsForUser(identity.userId),
    countUnreadNotifications(identity.userId),
    listOrganizationsForActor(identity),
  ]);

  const isLearner = hasRole(identity, 'LEARNER');
  const isEducator = hasRole(identity, 'EDUCATOR');
  const isVerifier = hasRole(identity, 'LAJNAH_VERIFIER');
  const isFounder = hasRole(identity, 'FOUNDER_ADMIN');

  return (
    <main className="main-content">
      <div className="container py-8 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50 font-heading">
            Portal Member
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {identity.email} · {identity.roles.join(', ')}
          </p>
        </header>

        {/* Quick modules */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/member/notifications" className="card p-4 flex flex-col gap-1 hover:shadow-md transition-shadow">
            <Bell className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-semibold text-sm">Notifikasi</span>
            <span className="text-xs text-gray-500">{unread} belum dibaca</span>
          </Link>
          <Link href="/member/profile" className="card p-4 flex flex-col gap-1 hover:shadow-md transition-shadow">
            <UserRound className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-semibold text-sm">Profil</span>
            <span className="text-xs text-gray-500">Kelola data pribadi</span>
          </Link>
          <Link href="/member/organizations" className="card p-4 flex flex-col gap-1 hover:shadow-md transition-shadow">
            <Building2 className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-semibold text-sm">Organisasi</span>
            <span className="text-xs text-gray-500">{organizations.length} terhubung</span>
          </Link>
          <Link href="/member/activity" className="card p-4 flex flex-col gap-1 hover:shadow-md transition-shadow">
            <History className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-semibold text-sm">Aktivitas</span>
            <span className="text-xs text-gray-500">Riwayat Anda</span>
          </Link>
          <Link href="/member/points" className="card p-4 flex flex-col gap-1 hover:shadow-md transition-shadow">
            <Coins className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-semibold text-sm">Poin Saya</span>
            <span className="text-xs text-gray-500">Saldo &amp; Transaksi</span>
          </Link>
        </section>

        {/* Role-aware canonical portals */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 font-heading">
            Portal Sesuai Peran
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {isLearner && (
              <Link href="/learner/activity" className="card p-5 flex justify-between items-center hover:shadow-md transition-shadow">
                <div>
                  <p className="font-semibold">Aktivitas Saya (Pembelajar)</p>
                  <p className="text-xs text-gray-500">Pengajuan sesi &amp; Poin Internal</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </Link>
            )}
            {isEducator && (
              <Link href="/educator/workspace" className="card p-5 flex justify-between items-center hover:shadow-md transition-shadow">
                <div>
                  <p className="font-semibold">Ruang Pendidik</p>
                  <p className="text-xs text-gray-500">Pengajuan sesi &amp; jadwal</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </Link>
            )}
            {isEducator && (
              <Link href="/educator/verification" className="card p-5 flex justify-between items-center hover:shadow-md transition-shadow">
                <div>
                  <p className="font-semibold">Verifikasi Lajnah</p>
                  <p className="text-xs text-gray-500">Status berkas &amp; Sanad Keilmuan</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </Link>
            )}
            {isVerifier && (
              <Link href="/management/lajnah" className="card p-5 flex justify-between items-center hover:shadow-md transition-shadow">
                <div>
                  <p className="font-semibold">Portal Lajnah</p>
                  <p className="text-xs text-gray-500">Antrean verifikasi</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </Link>
            )}
            {isFounder && (
              <Link href="/management" className="card p-5 flex justify-between items-center hover:shadow-md transition-shadow">
                <div>
                  <p className="font-semibold">Governance &amp; Operasional</p>
                  <p className="text-xs text-gray-500">Delegasi, audit, backup, sistem</p>
                </div>
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              </Link>
            )}
          </div>
        </section>

        {/* Recent notifications */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 font-heading">Notifikasi Terbaru</h2>
            <Link href="/member/notifications" className="text-sm text-[#0F3D2E] dark:text-emerald-400 font-medium">
              Lihat semua
            </Link>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada notifikasi.</p>
          ) : (
            <div className="space-y-2">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="card p-4 flex gap-3 items-start">
                  <Bell className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-50">{n.title}</p>
                    {n.body && <p className="text-xs text-gray-500">{n.body}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
