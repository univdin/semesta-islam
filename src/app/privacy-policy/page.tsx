import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi (Privacy Policy) — ILMIFY',
  description:
    'Kebijakan privasi resmi SEMESTA ISLAM menjelaskan pengumpulan, penggunaan, serta perlindungan data pribadi pengguna dan pendidik.',
  alternates: { canonical: '/privacy-policy' },
  openGraph: {
    title: 'Kebijakan Privasi — ILMIFY',
    description:
      'Komitmen perlindungan data pribadi dan privasi pengguna di platform SEMESTA ISLAM.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Kebijakan Privasi — ILMIFY' }],
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = '3 Agustus 2026';

  return (
    <main className="main-content pt-20">
      <div className="container py-8 max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Standar Perlindungan Data &amp; Privasi
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F3D2E] tracking-tight">
            Kebijakan Privasi (Privacy Policy)
          </h1>
          <p className="text-sm text-gray-500">Terakhir Diperbarui: {lastUpdated}</p>
        </div>

        {/* Legal Content Card */}
        <article className="glass-panel p-6 sm:p-10 rounded-2xl space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0F3D2E] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#D4AF37]" /> 1. Pendahuluan &amp; Komitmen Privasi
            </h2>
            <p>
              Selamat datang di <strong>SEMESTA ISLAM</strong> (diselenggarakan oleh entitas pengelola platform digital SEMESTA ISLAM). Kami menghormati hak privasi Anda dan berkomitmen penuh untuk melindungi data pribadi yang Anda percayakan saat mengakses layanan direktori pendidik, pengajuan sesi belajar, serta verifikasi kredensial keilmuan.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0F3D2E] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#D4AF37]" /> 2. Data Pribadi yang Kami Kumpulkan
            </h2>
            <p>Kami mengumpulkan informasi yang Anda berikan secara langsung maupun secara otomatis saat menggunakan platform:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Data Identitas Pembelajar/Keluarga:</strong> Nama, alamat email, nomor kontak, serta preferensi lokasi dan metode belajar.</li>
              <li><strong>Data Kredensial &amp; Sanad Pendidik:</strong> Dokumen identitas resmi, ijazah pesantren/universitas, riwayat sanad keilmuan, serta surat rekomendasi lembaga untuk keperluan audit verifikasi Lajnah.</li>
              <li><strong>Data Pengajuan &amp; Aktivitas Belajar:</strong> Catatan permohonan sesi belajar, riwayat status pengajuan, serta catatan poin internal apresiasi pembelajaran.</li>
              <li><strong>Data Teknis Log &amp; Perangkat:</strong> Alamat IP, tipe peramban web, informasi cookies dasar, dan data analitik interaksi peramban.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0F3D2E] flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#D4AF37]" /> 3. Penggunaan Informasi
            </h2>
            <p>Data pribadi yang dikumpulkan digunakan semata-mata untuk tujuan operasional berikut:</p>
            <ol className="list-decimal pl-6 space-y-2 text-gray-600">
              <li>Memfasilitasi penelusuran pencocokan dan pengajuan sesi belajar antara keluarga pembelajar dan pendidik terverifikasi.</li>
              <li>Menjalankan proses validasi verifikasi 4-lapis kredensial keilmuan oleh Dewan Lajnah.</li>
              <li>Mengirimkan notifikasi status pengajuan, konfirmasi sesi, serta pembaruan penting platform.</li>
              <li>Menjaga keamanan ekosistem, mencegah tindak penyalahgunaan, dan mematuhi peraturan hukum yang berlaku di Indonesia.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0F3D2E] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" /> 4. Pengungkapan &amp; Kerahasiaan Data
            </h2>
            <p>
              SEMESTA ISLAM <strong>tidak pernah menjual, menyewakan, atau memperdagangkan</strong> data pribadi Anda kepada pihak ketiga untuk kepentingan komersial/pemasaran tanpa izin eksplisit Anda. Data Anda hanya dapat diakses oleh tim internal terotorisasi dan pihak Lajnah Verifikator yang terikat pada kewajiban kerahasiaan ketat.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-[#0F3D2E] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" /> 5. Keamanan Data &amp; Hak Pengguna
            </h2>
            <p>
              Kami menerapkan enkripsi standar industri (TLS/SSL), kontrol akses berbasis peran (RBAC), serta enkripsi basis data untuk melindungi informasi Anda. Anda berhak untuk mengakses, memperbarui, atau meminta penghapusan akun dan data pribadi Anda kapan saja dengan menghubungi tim dukungan kami.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-gray-200">
            <h2 className="text-lg font-bold text-[#0F3D2E]">Kontak Layanan Privasi</h2>
            <p className="text-xs text-gray-500">
              Jika Anda memiliki pertanyaan atau permohonan terkait Kebijakan Privasi ini, silakan hubungi kami melalui surel resmi di <code className="font-mono text-[#0F3D2E]">privacy@ilmify.id</code> atau kunjungi halaman <Link href="/contact" className="text-emerald-700 font-semibold hover:underline">Hubungi Kami</Link>.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
