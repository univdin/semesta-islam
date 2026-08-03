import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan Layanan (Terms of Service) — SEMESTA ISLAM',
  description:
    'Syarat dan ketentuan penggunaan platform SEMESTA ISLAM untuk pembelajar, keluarga, pendidik, dan lembaga.',
  alternates: { canonical: '/terms-of-service' },
  openGraph: {
    title: 'Syarat & Ketentuan Layanan — SEMESTA ISLAM',
    description:
      'Ketentuan penggunaan platform dan norma etika belajar di SEMESTA ISLAM.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Syarat & Ketentuan — SEMESTA ISLAM' }],
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = '3 Agustus 2026';

  return (
    <main className="main-content pt-20">
      <div className="container py-8 max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-semibold rounded-full border border-amber-200">
            <Scale className="w-3.5 h-3.5" /> Tata Kelola &amp; Ketentuan Penggunaan
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F3D2E] tracking-tight">
            Syarat &amp; Ketentuan Layanan (Terms of Service)
          </h1>
          <p className="text-sm text-gray-500">Terakhir Diperbarui: {lastUpdated}</p>
        </div>

        {/* Legal Content Card */}
        <article className="glass-panel p-6 sm:p-10 rounded-2xl space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0F3D2E] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" /> 1. Penerimaan Ketentuan
            </h2>
            <p>
              Dengan mendaftar, mengakses, atau menggunakan layanan platform <strong>SEMESTA ISLAM</strong>, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan yang tercantum dalam Syarat &amp; Ketentuan ini. Jika Anda tidak menyetujui bagian mana pun dari ketentuan ini, Anda tidak diperkenankan menggunakan platform.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0F3D2E] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" /> 2. Peran Platform &amp; Verifikasi Lajnah
            </h2>
            <p>
              SEMESTA ISLAM beroperasi sebagai platform direktori dan penghubung digital antara pembelajar/keluarga dengan ustaz, ustazah, dan lembaga keislaman terverifikasi:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Proses Verifikasi 4-Lapis:</strong> Penelaahan kredensial, ijazah, dan sanad keilmuan dilaksanakan oleh Dewan Lajnah berdasarkan bukti dokumen yang diserahkan pendidik.</li>
              <li><strong>Independensi Pengajaran:</strong> Pendidik bertindak sebagai praktisi independen atau wakil lembaga resmi, bukan pegawai langsung dari platform SEMESTA ISLAM.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0F3D2E] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#D4AF37]" /> 3. Alur Pengajuan Sesi &amp; Ekonomi Poin Internal
            </h2>
            <p>
              Pengajuan sesi belajar di platform mencatat niat koordinasi waktu dan metode belajar. Seluruh alokasi apresiasi internal menggunakan sistem poin pembelajaran non-tunai yang diatur oleh ketentuan transaksi platform dan tidak dapat diubah menjadi mata uang tunai secara langsung tanpa mekanisme resmi.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0F3D2E] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" /> 4. Kode Etik &amp; Larangan Pengguna
            </h2>
            <p>Pengguna (baik Pembelajar maupun Pendidik) dilarang keras untuk:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li>Memalsukan identitas, dokumen ijazah, atau silsilah sanad keilmuan.</li>
              <li>Mengunggah atau menyebarkan materi yang bertentangan dengan nilai-nilai Rabbani, hukum berlaku, atau etika pengajaran Islam.</li>
              <li>Melakukan pemisatan (*harassment*), tindakan tidak sopan, atau pelanggaran privasi antar pengguna.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-200">
            <h2 className="text-lg font-bold text-[#0F3D2E]">Penutup &amp; Kontak Perubahan</h2>
            <p className="text-xs text-gray-500">
              SEMESTA ISLAM berhak memperbarui ketentuan ini dari waktu ke waktu. Pembaruan akan diumumkan melalui halaman ini. Jika ada pertanyaan, hubungi <Link href="/contact" className="text-emerald-700 font-semibold hover:underline">Tim Layanan Pengguna</Link>.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
