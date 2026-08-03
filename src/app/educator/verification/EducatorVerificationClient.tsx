'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, Clock, RotateCcw, Loader2, Info, UserX } from 'lucide-react';

interface VerificationStatusData {
  requestId: string;
  educatorId: string;
  status: string;
  layer1KtpUrl: string | null;
  layer2IjazahUrl: string | null;
  layer2Sha256Hash: string | null;
  recommenderEmail: string | null;
  reviewNotes: string | null;
  ethicsScore: number;
  createdAt: string;
  updatedAt: string;
}

interface EducatorVerificationClientProps {
  educatorId: string | null;
  demoFallback: boolean;
  identityEmail: string | null;
}

export function EducatorVerificationClient({
  educatorId,
  demoFallback,
  identityEmail,
}: EducatorVerificationClientProps) {
  const [data, setData] = useState<VerificationStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [showResubmitForm, setShowResubmitForm] = useState(false);
  const [resubmitting, setResubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const [form, setForm] = useState({
    ktpNumber: '',
    ktpDocumentUrl: '',
    ijazahDocumentUrl: '',
    recommenderEmail: '',
    recommenderInstitution: '',
  });

  const fetchStatus = async () => {
    if (!educatorId) return;
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch(`/api/v1/verification/status?educatorId=${educatorId}`);
      const body = await res.json();
      if (!res.ok || !body.success) {
        setLoadError(body.message || 'Gagal mengambil status verifikasi.');
        setData(null);
        return;
      }
      setData(body.data);
    } catch {
      setLoadError('Tidak dapat terhubung ke server.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!educatorId) {
      setLoading(false);
      return;
    }
    fetchStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [educatorId]);

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResubmitting(true);
    setActionMessage(null);

    const payload = {
      verificationRequestId: data!.requestId,
      currentStatus: data!.status,
      educatorId,
      ...form,
      ijazahSha256Hash: data!.layer2Sha256Hash ?? '',
      qiraahSanadName: undefined,
    };

    try {
      const res = await fetch('/api/v1/verification/resubmit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await res.json();

      if (!res.ok || !body.success) {
        setActionMessage({ kind: 'err', text: body.message || 'Gagal mengirim ulang berkas.' });
        return;
      }

      setActionMessage({ kind: 'ok', text: 'Berkas berhasil dikirim ulang ke antrean Lajnah.' });
      setShowResubmitForm(false);
      await fetchStatus();
    } catch {
      setActionMessage({ kind: 'err', text: 'Tidak dapat terhubung ke server.' });
    } finally {
      setResubmitting(false);
    }
  };

  return (
    <main className="main-content pt-20">
      <div className="container py-8 max-w-3xl">
        <div className="glass-panel p-6 md:p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#E6F4ED] rounded-xl text-[#0F3D2E]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0F3D2E]">Portal Verifikasi Pendidik</h1>
              <p className="text-xs text-gray-500">Status Kredensial 4-Lapis & Sanad Keilmuan Anda</p>
            </div>
          </div>

          {!educatorId && !loading && (
            <div className="text-center py-10 space-y-3">
              <div className="mx-auto w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                <UserX className="w-7 h-7" />
              </div>
              <h2 className="text-base font-bold text-[#0F3D2E]">
                {identityEmail ? 'Tidak Ada Profil Pendidik' : 'Silakan Masuk Terlebih Dahulu'}
              </h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                {identityEmail
                  ? 'Akun Anda belum terhubung ke profil pendidik mana pun. Hubungi administrator untuk menghubungkan profil pendidik Anda.'
                  : 'Portal verifikasi menampilkan status kredensial pendidik Anda. Masuk sebagai pendidik (atau pilih identitas demo pendidik dalam mode demo) untuk melanjutkan.'}
              </p>
            </div>
          )}

          {educatorId && loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-10">
              <Loader2 className="w-5 h-5 animate-spin" /> Memuat status verifikasi...
            </div>
          )}

          {educatorId && !loading && loadError && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{loadError}</span>
            </div>
          )}

          {educatorId && !loading && data && (
            <>
              {demoFallback && (
                <div className="mb-6 flex items-start gap-1.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Menampilkan status pendidik demo. Masuk sebagai akun pendidik untuk melihat
                    status verifikasi milik Anda sendiri.
                  </span>
                </div>
              )}

              {actionMessage && (
                <div
                  className={`p-3 rounded-xl text-sm mb-6 flex items-center gap-2 ${
                    actionMessage.kind === 'ok'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{actionMessage.text}</span>
                </div>
              )}

              {/* Status Display Card */}
              <div className="bg-white/80 border border-gray-100 rounded-2xl p-6 mb-6 space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-400 uppercase">ID Permohonan: {data.requestId}</span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                      data.status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : data.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {data.status === 'VERIFIED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {data.status === 'SUBMITTED' && <Clock className="w-3.5 h-3.5" />}
                    {data.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <strong className="text-[#0F3D2E]">Waktu Pengajuan:</strong>{' '}
                    {new Date(data.createdAt).toLocaleString()}
                  </p>
                  <p>
                    <strong className="text-[#0F3D2E]">Waktu Pembaruan:</strong>{' '}
                    {new Date(data.updatedAt).toLocaleString()}
                  </p>
                  <p>
                    <strong className="text-[#0F3D2E]">Email Rekomendasi:</strong>{' '}
                    {data.recommenderEmail ?? '-'}
                  </p>
                  <p className="font-mono text-xs text-gray-500">
                    <strong>SHA-256 Fingerprint:</strong> {data.layer2Sha256Hash ?? '-'}
                  </p>
                </div>

                {data.reviewNotes && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                    <div>
                      <strong className="block font-semibold mb-0.5">Catatan Lajnah Verifikator:</strong>
                      <span>{data.reviewNotes}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Resubmit */}
              {(data.status === 'REJECTED' || data.status === 'REVOKED') &&
                (showResubmitForm ? (
                  <form onSubmit={handleResubmit} className="space-y-4 bg-white/70 border border-gray-100 rounded-2xl p-6">
                    <h2 className="text-sm font-bold text-[#0F3D2E]">Kirim Ulang Berkas Verifikasi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        required
                        value={form.ktpNumber}
                        onChange={(e) => setForm({ ...form, ktpNumber: e.target.value })}
                        placeholder="Nomor KTP (16 digit)"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F3D2E]"
                      />
                      <input
                        required
                        value={form.recommenderEmail}
                        onChange={(e) => setForm({ ...form, recommenderEmail: e.target.value })}
                        placeholder="Email pemberi rekomendasi"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F3D2E]"
                      />
                      <input
                        required
                        value={form.ktpDocumentUrl}
                        onChange={(e) => setForm({ ...form, ktpDocumentUrl: e.target.value })}
                        placeholder="URL dokumen KTP"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F3D2E]"
                      />
                      <input
                        required
                        value={form.ijazahDocumentUrl}
                        onChange={(e) => setForm({ ...form, ijazahDocumentUrl: e.target.value })}
                        placeholder="URL dokumen Ijazah"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F3D2E]"
                      />
                      <input
                        required
                        value={form.recommenderInstitution}
                        onChange={(e) => setForm({ ...form, recommenderInstitution: e.target.value })}
                        placeholder="Nama institusi pemberi rekomendasi"
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0F3D2E] md:col-span-2"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={resubmitting}
                        className="btn btn-primary py-2.5 px-5 text-sm font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50"
                      >
                        <RotateCcw className="w-4 h-4" />
                        {resubmitting ? 'Mengirim Ulang...' : 'Kirim Ulang Berkas'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowResubmitForm(false)}
                        className="py-2.5 px-5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowResubmitForm(true)}
                    className="btn btn-primary py-3 px-6 text-sm font-semibold rounded-xl flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Kirim Ulang Berkas Verifikasi
                  </button>
                ))}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
