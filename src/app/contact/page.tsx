import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MapPin, MessageSquare, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hubungi Kami (Contact Us) — ILMIFY',
  description:
    'Layanan dukungan pengguna, pertanyaan verifikasi Lajnah, serta saluran komunikasi resmi SEMESTA ISLAM.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Hubungi Kami — ILMIFY',
    description:
      'Saluran komunikasi resmi dan bantuan pengguna platform SEMESTA ISLAM.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Hubungi Kami — ILMIFY' }],
  },
};

export default function ContactPage() {
  return (
    <main className="main-content pt-20">
      <div className="container py-8 max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
            <MessageSquare className="w-3.5 h-3.5" /> Layanan Bantuan &amp; Dukungan
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F3D2E] tracking-tight">
            Hubungi SEMESTA ISLAM
          </h1>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Tim kami siap membantu Anda terkait pertanyaan permohonan sesi, informasi pendaftaran pendidik, maupun verifikasi kredensial Lajnah.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Info cards */}
          <div className="space-y-4">
            <div className="glass-panel p-5 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F3D2E] text-[#D4AF37] flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-[#0F3D2E] text-sm">Surel Resmi</h3>
              <p className="text-xs text-gray-600 font-mono">support@ilmify.id</p>
              <p className="text-xs text-gray-400">Respons dalam 1x24 jam kerja.</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F3D2E] text-[#D4AF37] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-[#0F3D2E] text-sm">Sekretariat Lajnah</h3>
              <p className="text-xs text-gray-600 font-mono">lajnah@ilmify.id</p>
              <p className="text-xs text-gray-400">Khusus penelaahan berkas ijazah &amp; sanad.</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F3D2E] text-[#D4AF37] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-[#0F3D2E] text-sm">Jam Operasional Support</h3>
              <p className="text-xs text-gray-600">Senin – Jumat: 08.00 – 17.00 WIB</p>
              <p className="text-xs text-gray-400">Sabtu – Minggu: Pemantauan darurat.</p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl">
            <h2 className="text-lg font-bold text-[#0F3D2E] mb-4">Kirim Pesan Bantuan</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    placeholder="contoh: Ahmad Fauzi"
                    className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F3D2E] bg-white/80"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Alamat Email</label>
                  <input
                    type="email"
                    placeholder="contoh: ahmad@gmail.com"
                    className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F3D2E] bg-white/80"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori Pertanyaan</label>
                <select className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F3D2E] bg-white/80">
                  <option value="GENERAL">Pertanyaan Umum Platform</option>
                  <option value="BOOKING">Pengajuan &amp; Jadwal Belajar</option>
                  <option value="VERIFICATION">Verifikasi Pendidik / Lajnah</option>
                  <option value="TECHNICAL">Kendala Teknis Account</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Pesan Anda</label>
                <textarea
                  rows={4}
                  placeholder="Tuliskan pertanyaan atau kendala Anda secara rinci..."
                  className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F3D2E] bg-white/80 resize-none"
                />
              </div>

              <button
                type="button"
                className="w-full btn btn-primary text-sm py-3"
              >
                Kirim Pesan Support
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
