import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, History } from 'lucide-react';
import { getServerIdentity } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function ManagementAuditPage() {
  const identity = await getServerIdentity();
  if (!identity || !identity.roles.includes('FOUNDER_ADMIN')) notFound();

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      actor: { select: { email: true } },
    },
  });

  return (
    <main className="main-content">
      <div className="container py-8 max-w-5xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/management" className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 font-heading">Audit Trail</h1>
            <p className="text-sm text-gray-500">Rekam aktivitas sensitif platform (append-only)</p>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <History className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p>Belum ada aktivitas audit.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-200 dark:border-gray-800">
                  <th className="py-2 pr-4">Waktu</th>
                  <th className="py-2 pr-4">Aktor</th>
                  <th className="py-2 pr-4">Aksi</th>
                  <th className="py-2 pr-4">Entitas</th>
                  <th className="py-2">Detail</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 dark:border-gray-800/60">
                    <td className="py-2 pr-4 text-xs text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="py-2 pr-4 text-xs">{log.actor.email}</td>
                    <td className="py-2 pr-4 text-xs font-medium">{log.actionType}</td>
                    <td className="py-2 pr-4 text-xs">{log.entityAffected}</td>
                    <td className="py-2 text-xs text-gray-500 truncate max-w-[200px]">
                      {log.metadata ? JSON.stringify(log.metadata).slice(0, 120) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
