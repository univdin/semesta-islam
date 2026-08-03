import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { HelpCircle, ShieldCheck, Calendar, BookOpen, UserCheck, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pertanyaan Umum (FAQ) — SEMESTA ISLAM',
  description:
    'Jawaban atas pertanyaan umum seputar pencarian pendidik, standar verifikasi sanad Lajnah, serta alur pengajuan sesi belajar di SEMESTA ISLAM.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Pertanyaan Umum (FAQ) — SEMESTA ISLAM',
    description:
      'Pusat bantuan dan jawaban atas pertanyaan umum platform SEMESTA ISLAM.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'FAQ — SEMESTA ISLAM' }],
  },
};

const FAQS = [
  {
    category: 'Verifikasi & Kredensial Lajnah',
    items: [
      {
        q: 'Bagaimana pendidik diverifikasi di SEMESTA ISLAM?',
        a: 'Setiap ustaz, ustazah, maupun perwakilan lembaga melewati proses verifikasi 4-lapis: validasi data identifikasi kependudukan (KTP/Paspor), keabsahan ijazah/kelulusan pesantren/universitas, silsilah sanad keilmuan, serta rekomendasi ormas/tokoh agama.',
      },
      {
        q: 'Apa yang dimaksud dengan Sanad Keilmuan yang Terverifikasi?',
        a: 'Sanad keilmuan adalah silsilah keterikatan pengajaran ilmu Al-Qur\'an atau Hadits yang menyambung hingga Rasulullah SAW. Lajnah menelaah dokumen sanad yang diunggah pendidik sebelum memberikan badge verifikasi resmi.',
      },
    ],
  },
  {
    category: 'Pengajuan & Sesi Belajar',
    items: [
      {
        q: 'Apakah pengajuan sesi belajar dikenakan biaya langsung?',
        a: 'Pengajuan sesi belajar di platform bersifat pencatatan permohonan koordinasi jadwal dan metode belajar. Sistem mengalokasikan poin apresiasi pembelajaran internal non-tunai yang tercatat transparan di akun pengguna.',
      },
      {
        q: 'Metode belajar apa saja yang dapat dipilih?',
        a: 'Anda dapat memilih metode Tatap Muka Online (via Zoom/Video Call), Guru Datang Privat ke Rumah (khusus area terjangkau), atau Majelis Kelompok Terbimbing.',
      },
    ],
  },
  {
    category: 'Akun & Pendaftaran Pendidik',
    items: [
      {
        q: 'Bagaimana cara ustaz atau lembaga mendaftar sebagai Pendidik?',
        a: 'Calon pendidik dapat mendaftar melalui Portal Verifikasi Pendidik (/educator/verification), mengisi profil kelengkapan mengajar, serta mengunggah ijazah dan dokumen sanad untuk ditelaah oleh Lajnah.',
      },
    ],
  },
];

export default function FAQPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.flatMap((cat) =>
      cat.items.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      }))
    ),
  };

  return (
    <main className="main-content pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container py-8 max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
            <HelpCircle className="w-3.5 h-3.5" /> Pusat Bantuan &amp; FAQ
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F3D2E] tracking-tight">
            Pertanyaan Yang Sering Diajukan
          </h1>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Temukan jawaban lengkap seputar cara kerja direktori, alur pengajuan sesi, dan standar verifikasi kredensial SEMESTA ISLAM.
          </p>
        </div>

        {/* FAQ Accordion Lists */}
        <div className="space-y-6">
          {FAQS.map((cat, idx) => (
            <section key={idx} className="glass-panel p-6 sm:p-8 rounded-2xl space-y-4">
              <h2 className="text-lg font-bold text-[#0F3D2E] border-b border-gray-100 pb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37]" /> {cat.category}
              </h2>
              <div className="space-y-4">
                {cat.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="bg-white/60 p-4 sm:p-5 rounded-xl border border-emerald-900/10 space-y-2">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex items-start gap-2">
                      <span className="text-[#D4AF37] font-bold">Q:</span> {item.q}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 pl-6 leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="text-center pt-4">
          <p className="text-xs text-gray-500">
            Punya pertanyaan lain yang belum terjawab? <Link href="/contact" className="text-emerald-700 font-semibold hover:underline">Hubungi Tim Bantuan Kami →</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
