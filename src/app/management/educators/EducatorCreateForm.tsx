'use client';

import React, { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/useToast';
import { useRouter } from 'next/navigation';

const METHOD_LABELS: Record<string, string> = {
  ONLINE_ZOOM: 'Online (Zoom / Google Meet)',
  PRIVATE_HOME: 'Privat Tatap Muka di Rumah',
  GROUP_MAJELIS: 'Majelis / Kelompok Belajar',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted (dalam antrean Lajnah)',
  VERIFIED: 'Terverifikasi (tampil publik)',
  REJECTED: 'Ditolak',
};

export function EducatorCreateForm() {
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    fullName: '',
    titlePrefix: 'Ustadz',
    titleSuffix: '',
    institutionName: '',
    locationCity: '',
    bio: '',
    teachingMethod: 'ONLINE_ZOOM',
    verificationStatus: 'SUBMITTED',
    createVerificationRequest: true,
    phone: '',
  });

  const set = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    if (!form.email || !form.fullName) {
      toast.error('Lengkapi Email dan Nama Lengkap.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/management/educators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.message ?? 'Gagal membuat profil pendidik.');
      }
      toast.success('Profil pendidik dibuat.', data?.data?.slug ? `Slug: ${data.data.slug}` : undefined);
      setForm({
        email: '',
        fullName: '',
        titlePrefix: 'Ustadz',
        titleSuffix: '',
        institutionName: '',
        locationCity: '',
        bio: '',
        teachingMethod: 'ONLINE_ZOOM',
        verificationStatus: 'SUBMITTED',
        createVerificationRequest: true,
        phone: '',
      });
      router.refresh();
    } catch (err) {
      toast.error('Gagal.', err instanceof Error ? err.message : undefined);
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/40';

  return (
    <div className="card p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Email*</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            className={inputCls}
            placeholder="nama@email.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Nama Lengkap*</label>
          <input
            required
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            className={inputCls}
            placeholder="Ustadz Nama Lengkap"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Gelar Depan</label>
          <input
            value={form.titlePrefix}
            onChange={(e) => set('titlePrefix', e.target.value)}
            className={inputCls}
            placeholder="Ustadz / Ustadzah / Dr."
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Gelar Belakang</label>
          <input
            value={form.titleSuffix}
            onChange={(e) => set('titleSuffix', e.target.value)}
            className={inputCls}
            placeholder="Pakar Fiqh / Pengajar Tahsin"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Institusi / Afiliasi</label>
          <input
            value={form.institutionName}
            onChange={(e) => set('institutionName', e.target.value)}
            className={inputCls}
            placeholder="Pesantren / Universitas"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Kota</label>
          <input
            value={form.locationCity}
            onChange={(e) => set('locationCity', e.target.value)}
            className={inputCls}
            placeholder="Jakarta Selatan"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Metode Belajar</label>
          <select
            value={form.teachingMethod}
            onChange={(e) => set('teachingMethod', e.target.value)}
            className={inputCls}
          >
            {Object.entries(METHOD_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Status Verifikasi Awal</label>
          <select
            value={form.verificationStatus}
            onChange={(e) => set('verificationStatus', e.target.value)}
            className={inputCls}
          >
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700">Bio Singkat</label>
        <textarea
          value={form.bio}
          onChange={(e) => set('bio', e.target.value)}
          className={inputCls}
          rows={3}
          placeholder="Riwayat pendidikan dan keilmuan..."
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-slate-600">
        <input
          type="checkbox"
          checked={form.createVerificationRequest}
          onChange={(e) => set('createVerificationRequest', e.target.checked)}
          className="accent-emerald-700"
        />
        Buat pengajuan verifikasi Lajnah otomatis (status SUBMITTED)
      </label>

      <button
        onClick={submit}
        disabled={loading}
        className="w-full flex justify-center items-center gap-2 rounded-xl bg-[#0F3D2E] text-white text-sm font-bold py-3 hover:bg-[#16533F] disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Profil Pendidik'}
      </button>
    </div>
  );
}
