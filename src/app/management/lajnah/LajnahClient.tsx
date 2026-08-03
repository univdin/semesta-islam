'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { VerificationQueueItem } from '@/lib/verification/service';

interface LajnahClientProps {
  items: VerificationQueueItem[];
}

export function LajnahClient({ items }: LajnahClientProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const handleReview = async (item: VerificationQueueItem, targetStatus: 'UNDER_REVIEW_LAJNAH' | 'VERIFIED' | 'REJECTED') => {
    setBusyId(item.id);
    setActionStatus(null);

    const reviewNotesByTarget: Record<string, string> = {
      UNDER_REVIEW_LAJNAH: 'Dokumen mulai ditelaah oleh Lajnah Verifikasi Keilmuan.',
      VERIFIED: 'Berkas diverifikasi dan disetujui oleh Lajnah Verifikasi Keilmuan.',
      REJECTED: 'Berkas tidak memenuhi persyaratan dan ditolak oleh Lajnah Verifikasi Keilmuan.',
    };

    try {
      const res = await fetch('/api/v1/verification/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationRequestId: item.id,
          currentStatus: item.status,
          targetStatus,
          reviewNotes: reviewNotesByTarget[targetStatus],
          ethicsScore: 100,
        }),
      });

      const body = await res.json();

      if (!res.ok || !body.success) {
        setActionStatus({ kind: 'err', text: body.message || 'Gagal memproses permohonan.' });
        return;
      }

      setActionStatus({ kind: 'ok', text: `Permohonan ${item.id} berhasil diperbarui menjadi ${targetStatus}` });
      router.refresh();
    } catch {
      setActionStatus({ kind: 'err', text: 'Tidak dapat terhubung ke server.' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="main-content pt-20">
      <div className="container py-8 max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit mb-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Portal Verifikator Lajnah
            </span>
            <h1 className="text-2xl font-bold text-[#0F3D2E]">Antrean Verifikasi Kredensial & Sanad</h1>
          </div>
        </div>

        {actionStatus && (
          <div
            className={`p-3 rounded-xl text-sm mb-6 flex items-center gap-2 ${
              actionStatus.kind === 'ok'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {actionStatus.kind === 'ok' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0" />
            )}
            <span>{actionStatus.text}</span>
          </div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-2xl">
            <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#0F3D2E]">Tidak Ada Permohonan</h3>
            <p className="text-sm text-gray-500 mt-1">Belum ada pengajuan verifikasi dalam antrean.</p>
          </div>
        ) : (
          <div className="directory-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item) => (
              <div key={item.id} className="glass-panel p-5 rounded-2xl border border-gray-100 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-mono text-gray-400">{item.id}</span>
                    <h3 className="text-base font-bold text-[#0F3D2E]">{item.educatorName}</h3>
                    <p className="text-xs text-gray-500">{item.institution}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      item.status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status === 'UNDER_REVIEW_LAJNAH' ? 'UNDER REVIEW' : item.status}
                  </span>
                </div>

                <div className="bg-white/60 p-3 rounded-xl space-y-1.5 text-xs text-gray-600 font-mono">
                  <p>SHA-256: {item.layer2Sha256Hash?.substring(0, 24) ?? '-'}...</p>
                  <p className="font-sans">Rekomendasi: {item.recommenderEmail ?? '-'}</p>
                  <p className="font-sans">
                    Skor Etika: {item.ethicsScore} · Diajukan: {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>

                {item.status === 'SUBMITTED' && (
                  <div className="pt-2">
                    <button
                      onClick={() => handleReview(item, 'UNDER_REVIEW_LAJNAH')}
                      disabled={busyId === item.id}
                      className="w-full btn btn-primary py-2 text-xs flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Mulai Telaah (Under Review)
                    </button>
                  </div>
                )}

                {item.status === 'UNDER_REVIEW_LAJNAH' && (
                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => handleReview(item, 'VERIFIED')}
                      disabled={busyId === item.id}
                      className="flex-1 btn btn-primary py-2 text-xs flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Disetujui (Verified)
                    </button>
                    <button
                      onClick={() => handleReview(item, 'REJECTED')}
                      disabled={busyId === item.id}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-all disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Tolak Permohonan
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
