'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  SearchCheck,
  Flag,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/components/ui/useToast';

interface QueueItem {
  id: string;
  kind: 'QUESTION' | 'ANSWER' | 'COMMENT';
  status: string;
  excerpt: string;
  authorUserId: string;
  authorName: string | null;
  moderatedById: string | null;
  moderatedAt: string | null;
  createdAt: string;
  openReportCount: number;
  accepted: boolean;
}

interface ReportSummary {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  status: string;
  resolution: string | null;
  resolvedById: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

interface Props {
  initialQueue: QueueItem[];
  initialReports: ReportSummary[];
}

const STATUS_LABELS: Record<string, string> = {
  VISIBLE: 'Terlihat',
  HIDDEN: 'Tersembunyi',
  REPORTED: 'Dilaporkan',
  UNDER_REVIEW: 'Dalam Tinjauan',
  REMOVED: 'Dihapus',
  LOCKED: 'Terkunci',
};

const KIND_LABELS: Record<string, string> = {
  QUESTION: 'Pertanyaan',
  ANSWER: 'Jawaban',
  COMMENT: 'Komentar',
};

const TARGET_LABELS: Record<string, string> = {
  EDUCATOR_PROFILE: 'Profil Pendidik',
  TOPIC: 'Topik',
  QUESTION: 'Pertanyaan',
  ANSWER: 'Jawaban',
  COMMENT: 'Komentar',
};

function formatDate(value: string | null): string {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return '-';
  }
}

async function handleResponse(res: Response): Promise<{ message?: string }> {
  const json = (await res.json()) as { success?: boolean; message?: string };
  if (!res.ok) {
    throw new Error(json.message ?? 'Terjadi kesalahan.');
  }
  return json;
}

export function CommunityModerationClient({ initialQueue, initialReports }: Props) {
  const toast = useToast();
  const router = useRouter();
  const [tab, setTab] = useState<'queue' | 'reports'>('queue');
  const [queue, setQueue] = useState(initialQueue);
  const [reports, setReports] = useState(initialReports);
  const [note, setNote] = useState('');

  const refresh = () => {
    router.refresh();
  };

  const moderate = async (item: QueueItem, status: string) => {
    const resolution = note.trim() || undefined;
    try {
      await handleResponse(
        await fetch('/api/v1/management/community/moderation', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetType: item.kind, targetId: item.id, status, note: resolution }),
        })
      );
      toast.success('Status konten diperbarui', `${item.kind} kini ${STATUS_LABELS[status]}.`);
      setNote('');
      refresh();
    } catch (e) {
      toast.error('Gagal memoderasi', (e as Error).message);
    }
  };

  const resolve = async (report: ReportSummary, status: 'RESOLVED' | 'REJECTED') => {
    const resolution = window.prompt(
      status === 'RESOLVED' ? 'Catatan penyelesaian laporan:' : 'Alasan penolakan laporan:'
    );
    if (!resolution || resolution.trim().length < 3) {
      toast.warning('Catatan minimal 3 karakter');
      return;
    }
    try {
      await handleResponse(
        await fetch('/api/v1/management/community/reports', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportId: report.id, status, resolution: resolution.trim() }),
        })
      );
      toast.success(status === 'RESOLVED' ? 'Laporan diselesaikan' : 'Laporan ditolak');
      refresh();
    } catch (e) {
      toast.error('Gagal memproses laporan', (e as Error).message);
    }
  };

  return (
    <main className="main-content pt-20">
      <div className="container py-8 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="p-2.5 rounded-xl bg-[#0F3D2E]/10 text-[#0F3D2E]">
            <ShieldCheck className="w-6 h-6" />
          </span>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#0F3D2E] dark:text-emerald-100">
              Moderasi Komunitas
            </h1>
            <p className="text-xs text-gray-500">
              Antrean peninjauan konten UGC (komentar, jawaban, pertanyaan) dan laporan pengguna.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2 mb-5">
          <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              onClick={() => setTab('queue')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === 'queue'
                  ? 'bg-[#0F3D2E] text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-gray-800'
              }`}
            >
              Antrean ({queue.length})
            </button>
            <button
              onClick={() => setTab('reports')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === 'reports'
                  ? 'bg-[#0F3D2E] text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-gray-800'
              }`}
            >
              Laporan Terbuka ({reports.length})
            </button>
          </div>
          <button onClick={refresh} className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-emerald-700">
            <RefreshCw className="w-3.5 h-3.5" /> Muat ulang
          </button>
        </div>

        {tab === 'reports' && (
          <div className="space-y-3">
            {reports.length === 0 && (
              <div className="glass-panel p-8 rounded-2xl text-center text-sm text-gray-500">
                Tidak ada laporan terbuka.
              </div>
            )}
            {reports.map((r) => (
              <div key={r.id} className="glass-panel p-4 rounded-2xl">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-lg bg-red-50 text-red-500 shrink-0">
                      <Flag className="w-4 h-4" />
                    </span>
                    <div>
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        Laporan pada <span className="font-semibold">{TARGET_LABELS[r.targetType] ?? r.targetType}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Alasan: {r.reason}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Dilaporkan {formatDate(r.createdAt)} · ID: {r.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => resolve(r, 'RESOLVED')}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Selesaikan
                    </button>
                    <button
                      onClick={() => resolve(r, 'REJECTED')}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:text-red-600"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'queue' && (
          <div className="space-y-3">
            <div className="glass-panel p-4 rounded-2xl mb-3">
              <label className="text-xs font-medium text-gray-500 block mb-1.5">
                Catatan keputusan (opsional, akan menjadi resolusi laporan terkait)
              </label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Misal: konten melanggar kebijakan…"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
            </div>

            {queue.length === 0 && (
              <div className="glass-panel p-8 rounded-2xl text-center text-sm text-gray-500">
                Antrean moderasi kosong. Konten baru yang dilaporkan atau berstatus non-terlihat akan muncul di sini.
              </div>
            )}
            {queue.map((item) => (
              <div key={`${item.kind}:${item.id}`} className="glass-panel p-4 rounded-2xl">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    <span className="p-2 rounded-lg bg-[#0F3D2E]/10 text-[#0F3D2E] shrink-0">
                      {item.kind === 'QUESTION' ? (
                        <HelpCircle className="w-4 h-4" />
                      ) : item.kind === 'ANSWER' ? (
                        <MessageSquare className="w-4 h-4" />
                      ) : (
                        <MessageSquare className="w-4 h-4" />
                      )}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                          {KIND_LABELS[item.kind]}
                        </span>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${
                          item.status === 'VISIBLE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'REMOVED'
                              ? 'bg-red-50 text-red-600 border-red-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {STATUS_LABELS[item.status] ?? item.status}
                        </span>
                        {item.openReportCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500">
                            <Flag className="w-3 h-3" /> {item.openReportCount} laporan
                          </span>
                        )}
                        {item.accepted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                            <CheckCircle2 className="w-3 h-3" /> Jawaban terbaik
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1.5">{item.excerpt}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Oleh {item.authorName ?? item.authorUserId} · {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                      onClick={() => moderate(item, 'VISIBLE')}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                      title="Pulihkan ke terlihat"
                    >
                      <Eye className="w-3.5 h-3.5" /> Pulihkan
                    </button>
                    <button
                      onClick={() => moderate(item, 'HIDDEN')}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                      title="Sembunyikan"
                    >
                      <EyeOff className="w-3.5 h-3.5" /> Sembunyikan
                    </button>
                    <button
                      onClick={() => moderate(item, 'UNDER_REVIEW')}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                      title="Tandai dalam tinjauan"
                    >
                      <SearchCheck className="w-3.5 h-3.5" /> Tinjau
                    </button>
                    <button
                      onClick={() => moderate(item, 'LOCKED')}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                      title="Kunci interaksi"
                    >
                      <Lock className="w-3.5 h-3.5" /> Kunci
                    </button>
                    <button
                      onClick={() => moderate(item, 'REMOVED')}
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      title="Hapus (soft-remove)"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
