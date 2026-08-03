import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell } from 'lucide-react';
import { getServerIdentity } from '@/lib/auth/session';
import { listNotificationsForUser } from '@/lib/notifications/service';
import { NotificationReadAllButton } from './NotificationReadAllButton';

export const dynamic = 'force-dynamic';

const TYPE_LABELS: Record<string, string> = {
  BOOKING_CONFIRMED: 'Sesi Dikonfirmasi',
  BOOKING_INQUIRED: 'Pengajuan Sesi',
  VERIFICATION_SUBMITTED: 'Verifikasi Dikirim',
  VERIFICATION_REVIEWED: 'Verifikasi Ditinjau',
  VERIFICATION_REJECTED: 'Verifikasi Ditolak',
  MEMBER_INVITED: 'Undangan Organisasi',
  DELEGATION_GRANTED: 'Delegasi Diberikan',
  DELEGATION_REVOKED: 'Delegasi Dicabut',
  ANNOUNCEMENT: 'Pengumuman',
  SYSTEM_ALERT: 'Peringatan Sistem',
};

export default async function MemberNotificationsPage() {
  const identity = await getServerIdentity();
  if (!identity) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <p className="text-gray-500">Silakan <Link href="/login" className="text-[#0F3D2E] underline">masuk</Link> terlebih dahulu.</p>
      </div>
    );
  }

  const notifications = await listNotificationsForUser(identity.userId);

  return (
    <main className="main-content">
      <div className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/member" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 font-heading">Notifikasi</h1>
              <p className="text-sm text-gray-500">Notifikasi dalam aplikasi Anda</p>
            </div>
          </div>
          {notifications.some((n) => !n.readAt) && (
            <NotificationReadAllButton userId={identity.userId} />
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>Belum ada notifikasi.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`card p-4 flex gap-3 items-start ${n.readAt ? 'opacity-70' : ''}`}
              >
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.readAt ? 'bg-gray-300' : 'bg-[#D4AF37]'}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                      {TYPE_LABELS[n.type] ?? n.type}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {new Date(n.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">{n.title}</p>
                  {n.body && <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
