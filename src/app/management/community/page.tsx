import { ShieldAlert } from 'lucide-react';
import { getServerIdentity } from '@/lib/auth/session';
import { listModerationQueue } from '@/lib/community/moderation';
import { listReports } from '@/lib/community/reports';
import { CommunityModerationClient } from './CommunityModerationClient';

export const dynamic = 'force-dynamic';

export default async function CommunityModerationPage() {
  const identity = await getServerIdentity();

  if (!identity) {
    return (
      <main className="main-content pt-20">
        <div className="container py-8 max-w-2xl">
          <div className="glass-panel p-8 rounded-2xl text-center space-y-3">
            <div className="mx-auto w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-[#0F3D2E]">Akses Ditolak</h1>
            <p className="text-sm text-gray-600">Silakan masuk untuk mengakses portal moderasi komunitas.</p>
          </div>
        </div>
      </main>
    );
  }

  let queue;
  let reports;
  try {
    queue = await listModerationQueue(identity);
    reports = await listReports(identity, { status: 'OPEN' });
  } catch {
    return (
      <main className="main-content pt-20">
        <div className="container py-8 max-w-2xl">
          <div className="glass-panel p-8 rounded-2xl text-center space-y-3">
            <div className="mx-auto w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-[#0F3D2E]">Akses Ditolak</h1>
            <p className="text-sm text-gray-600">
              Moderasi komunitas memerlukan kapabilitas content.manage (FOUNDER_ADMIN atau yang didelegasikan).
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <CommunityModerationClient
      initialQueue={queue.map((item) => ({
        ...item,
        moderatedAt: item.moderatedAt ? item.moderatedAt.toISOString() : null,
        createdAt: item.createdAt.toISOString(),
      }))}
      initialReports={reports.map((r) => ({
        ...r,
        resolvedAt: r.resolvedAt ? r.resolvedAt.toISOString() : null,
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  );
}
