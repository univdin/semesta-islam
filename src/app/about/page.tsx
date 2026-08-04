import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, ShieldCheck, Mail, MapPin, Award, CheckCircle2, HeartHandshake } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tentang Kami (About Us) — ILMIFY',
  description:
    'Mengenal SEMESTA ISLAM: visi, misi, nilai Rabbani, dan komitmen menghubungkan keluarga dengan pendidik Islam terverifikasi Lajnah.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'Tentang Kami — ILMIFY',
    description:
      'Visi dan misi platform digital terpercaya penghubung pendidikan Islam Rabbani.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Tentang Kami — ILMIFY' }],
  },
};

export default function AboutPage() {
  return (
    <main className="main-content pt-20">
      <div className="container py-8 max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold rounded-full border border-emerald-200 dark:border-emerald-800">
            <Building2 className="w-3.5 h-3.5" /> Ekosistem Edukasi Islam Terpercaya
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F3D2E] dark:text-[#F3E5AB] tracking-tight">
            Tentang SEMESTA ISLAM
          </h1>
          <p className="text-base text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Membimbing generasi Rabbani melalui platform digital penghubung pembelajar, keluarga, pendidik, dan lembaga keislaman ber-sanad terverifikasi.
          </p>
        </div>

        {/* Story & Vision */}
        <article className="glass-panel p-6 sm:p-10 rounded-2xl space-y-8 text-gray-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0F3D2E] dark:text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#D4AF37]" /> Visi &amp; Misi Kami
            </h2>
            <p>
              <strong>SEMESTA ISLAM</strong> lahir dari kebutuhan mendasar keluarga dan pembelajar Muslim di Indonesia untuk menemukan guru agama, ustaz, ustazah, dan pembimbing Al-Qur'an yang kredibel, jelas keilmuannya, serta terverifikasi silsilah sanadnya.
            </p>
            <p>
              Kami berkomitmen membangun ekosistem digital yang teduh, aman, transparan, dan terpercaya tanpa ornamen berlebihan atau klaim yang tidak tervalidasi.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-white/70 dark:bg-slate-900/70 p-5 rounded-xl border border-emerald-900/10 dark:border-emerald-100/10 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F3D2E] text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h3 className="font-bold text-[#0F3D2E] dark:text-slate-100">Aksesibilitas Keilmuan Valid</h3>
              <p className="text-xs text-gray-600 dark:text-slate-300">
                Memudahkan keluarga Muslim menemukan pembimbing agama berkualitas untuk sesi privat, online, maupun majelis.
              </p>
            </div>

            <div className="bg-white/70 dark:bg-slate-900/70 p-5 rounded-xl border border-emerald-900/10 dark:border-emerald-100/10 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F3D2E] text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h3 className="font-bold text-[#0F3D2E] dark:text-slate-100">Standar Verifikasi Lajnah</h3>
              <p className="text-xs text-gray-600 dark:text-slate-300">
                Memastikan setiap pendidik melewati penelaahan identitas resmi, ijazah keislaman, dan sanad keilmuan 4-lapis.
              </p>
            </div>
          </section>

          <section className="space-y-4 pt-4 border-t border-gray-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-[#0F3D2E] dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" /> Empat Pilar Nilai Rabbani
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="dark:text-slate-200">Amanah &amp; Transparansi:</strong> Menjaga kejujuran data kredensial dan proses pengajuan sesi.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="dark:text-slate-200">Sanad Keilmuan:</strong> Penghormatan pada silsilah transmisi ilmu Al-Qur'an &amp; As-Sunnah.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="dark:text-slate-200">Stoic UX &amp; Anti-Slop:</strong> Antarmuka yang tenang, cepat, dan fokus pada kemanfaatan.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="dark:text-slate-200">Kemuliaan Pendidik:</strong> Memberi ruang profesional yang bermartabat bagi ustaz &amp; ustazah.
                </div>
              </div>
            </div>
          </section>
        </article>
      </div>
    </main>
  );
}
