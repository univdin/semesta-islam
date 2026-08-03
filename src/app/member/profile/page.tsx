import React from 'react';
import Link from 'next/link';
import { ArrowLeft, UserRound } from 'lucide-react';
import { getServerIdentity } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { ProfileForm } from './ProfileForm';

export const dynamic = 'force-dynamic';

export default async function MemberProfilePage() {
  const identity = await getServerIdentity();
  if (!identity) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <p className="text-gray-500">Silakan <Link href="/login" className="text-[#0F3D2E] underline">masuk</Link> terlebih dahulu.</p>
      </div>
    );
  }

  const profile = await prisma.userProfile.findUnique({ where: { userId: identity.userId } });

  return (
    <main className="main-content">
      <div className="container py-8 max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/member" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 font-heading">Profil</h1>
            <p className="text-sm text-gray-500">Data pribadi Anda</p>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#0F3D2E] text-[#D4AF37] flex items-center justify-center">
                <UserRound className="w-7 h-7" />
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-50">{profile?.fullName ?? 'Belum diisi'}</p>
              <p className="text-xs text-gray-500">{identity.email}</p>
              <p className="text-xs text-gray-400">{identity.roles.join(', ')}</p>
            </div>
          </div>

          <ProfileForm profile={profile} />
        </div>
      </div>
    </main>
  );
}
