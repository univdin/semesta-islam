import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { ShieldCheck, Award, Calendar, Info } from 'lucide-react';

export const revalidate = 300;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'SEMESTA ISLAM — Platform Edukasi & Pendidik Islam Terverifikasi',
  description:
    'Temukan pendidik Islam terverifikasi: ustaz, ustazah, dan lembaga dengan kredensial, sanad, dan keilmuan yang diverifikasi Lajnah. Ajukan sesi belajar online, privat, atau majelis.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SEMESTA ISLAM — Platform Edukasi & Pendidik Islam Terverifikasi',
    description:
      'Temukan pendidik Islam terverifikasi dengan sanad keilmuan yang diverifikasi Lajnah.',
    type: 'website',
  },
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilmify.id';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'SEMESTA ISLAM',
      url: siteUrl,
      logo: `${siteUrl}/apple-touch-icon.png`,
      description:
        'Platform ekosistem pembelajaran Islam terpercaya yang menghubungkan keluarga dengan pendidik dan lembaga Islam terverifikasi.',
      areaServed: 'ID',
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'SEMESTA ISLAM',
      inLanguage: 'id-ID',
      publisher: { '@id': `${siteUrl}/#organization` },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Apa itu SEMESTA ISLAM?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'SEMESTA ISLAM adalah platform yang menghubungkan keluarga dan pembelajar dengan pendidik Islam terverifikasi — ustaz, ustazah, dan lembaga — yang kredensial, sanad, dan keilmuannya diverifikasi oleh Lajnah.',
          },
        },
        {
          '@type': 'Question',
          name: 'Bagaimana pendidik diverifikasi di SEMESTA ISLAM?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Setiap pendidik melewati verifikasi kredensial 4-lapis: validasi identitas resmi, verifikasi sanad & ijazah, rekomendasi tokoh atau lembaga, dan evaluasi etika serta integritas.',
          },
        },
        {
          '@type': 'Question',
          name: 'Metode belajar apa saja yang tersedia?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Anda dapat memilih metode belajar online (video call), privat di rumah, atau kelompok majelis sesuai kebutuhan keluarga.',
          },
        },
        {
          '@type': 'Question',
          name: 'Apakah layanan SEMESTA ISLAM tersedia di seluruh Indonesia?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ya, SEMESTA ISLAM menghubungkan pendidik dari berbagai kota di Indonesia dengan keluarga pembelajar, baik secara online maupun tatap muka.',
          },
        },
      ],
    },
  ],
};
import { EducatorCard } from '@/components/ui/EducatorCard';
import { HeroSearch } from '@/components/ui/HeroSearch';
import {
  listEducatorSummaries,
  countEducators,
  countVerifiedEducators,
  countEducatorCities,
} from '@/lib/educators/service';
import { isDemoMode } from '@/lib/auth/session';

const STEPS = [
  {
    num: '01',
    title: 'Temukan Pendidik Terverifikasi',
    desc: 'Telusuri direktori ustaz, ustazah, dan pakar studi Islam beserta silsilah keilmuan & sanad.',
  },
  {
    num: '02',
    title: 'Ajukan Sesi Belajar',
    desc: 'Pilih metode (online, privat, atau majelis) dan waktu belajar sesuai kebutuhan keluarga.',
  },
  {
    num: '03',
    title: 'Verifikasi & Konfirmasi',
    desc: 'Pendidik mengonfirmasi permohonan Anda; pengajuan tercatat di sistem secara aman.',
  },
];

export default async function HomePage() {
  const [sampleEducators, totalEducators, verifiedEducators, educatorCities] = await Promise.all([
    listEducatorSummaries({ take: 3 }),
    countEducators(),
    countVerifiedEducators(),
    countEducatorCities(),
  ]);

  const demoMode = isDemoMode();

  return (
    <main className="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {demoMode && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs px-4 py-2 flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>
            Mode demo aktif — data dan alur bersifat simulasi untuk pengembangan lokal.
          </span>
        </div>
      )}

      {/* Hero Showcase Section */}
      <section id="hero" className="hero-section">
        <div className="hero-bg-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
        </div>

        <div className="container hero-container">
          <div className="hero-badge">
            <span className="pulse-dot" />
            Platform Edukasi Islam Terverifikasi Lajnah
          </div>

          <h1 className="hero-title">
            Hubungkan Keluarga Anda dengan Pendidik Islam{' '}
            <span className="text-gradient">Terverifikasi</span>
          </h1>

          <p className="hero-subtitle">
            Membimbing generasi Rabbani melalui direktori ustaz, guru al-Qur&apos;an, dan lembaga
            keislaman yang kredensial, sanad, dan keilmuannya diverifikasi Lajnah.
          </p>

          {/* Quick Search Action Bar */}
          <HeroSearch />

          {/* Impact Stats */}
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-num">{totalEducators}</span>
              <span className="stat-desc">Pendidik Terdaftar</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">{verifiedEducators}</span>
              <span className="stat-desc">Terverifikasi Lajnah</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-num">{educatorCities}</span>
              <span className="stat-desc">Kota di Indonesia</span>
            </div>
          </div>
        </div>
      </section>

      {/* Educator Directory Section */}
      <section id="directory" className="section directory-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">Direktori Resmi</div>
            <h2 className="section-title">Pendidik & Ustaz Terverifikasi</h2>
            <p className="section-subtitle">
              Pilih pembimbing agama yang sesuai dengan kebutuhan keluarga dan metode belajar pilihan
              Anda.
            </p>
          </div>

          <div className="directory-grid">
            {sampleEducators.map((edu) => (
              <EducatorCard key={edu.id} educator={edu} />
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/directory" className="btn btn-gold">
              Lihat Seluruh Direktori Pendidik →
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works / Booking Section */}
      <section id="booking" className="section verification-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">Alur Belajar</div>
            <h2 className="section-title">Mulai Perjalanan Belajar</h2>
            <p className="section-subtitle">
              Pengajuan sesi belajar dicatat di sistem; poin internal pembelajaran dialokasikan ke
              akun sebagai apresiasi non-tunai.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="glass-panel rounded-2xl p-6 border border-gray-100"
              >
                <div className="w-10 h-10 rounded-xl bg-[#0F3D2E] text-white flex items-center justify-center font-bold text-sm mb-4">
                  {step.num}
                </div>
                <h3 className="text-base font-bold text-[#0F3D2E] mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/booking" className="btn btn-gold">
              <Calendar className="w-4 h-4 mr-2" /> Ajukan Sesi Belajar
            </Link>
          </div>
        </div>
      </section>

      {/* Verification Standard Showcase */}
      <section id="verification" className="section verification-section">
        <div className="container">
          <div className="verification-card glass-panel-glow">
            <div className="verification-content">
              <div className="badge-icon-large">
                <ShieldCheck className="w-10 h-10 text-[#D4AF37]" />
              </div>
              <h2 className="verification-title">Standar Verifikasi Kredensial 4-Lapis SEMESTA ISLAM</h2>
              <p className="verification-desc">
                Setiap pendidik melewati validasi kredensial ketat yang meliputi: Identitas Resmi,
                Sanad/Ijazah Keilmuan, Rekomendasi Lembaga/Lajnah, serta Audit Track Record Etika.
              </p>

              <div className="layers-grid">
                <div className="layer-item">
                  <div className="layer-num">01</div>
                  <h4>Validasi Identitas & KTP/Paspor</h4>
                  <p>Verifikasi data kependudukan resmi dan keaslian profil fisik.</p>
                </div>
                <div className="layer-item">
                  <div className="layer-num">02</div>
                  <h4>Verifikasi Sanad & Ijazah</h4>
                  <p>Pemeriksaan ijazah kelulusan pesantren/universitas Islam terkemuka.</p>
                </div>
                <div className="layer-item">
                  <div className="layer-num">03</div>
                  <h4>Rekomendasi Tokoh & Ormas</h4>
                  <p>Surat rekomendasi dari ulama atau lembaga dakwah terpercaya.</p>
                </div>
                <div className="layer-item">
                  <div className="layer-num">04</div>
                  <h4>Evaluasi Etika & Integritas</h4>
                  <p>Pemantauan komitmen pengajaran dan penilaian dari keluarga pembelajar.</p>
                </div>
              </div>

              <div className="text-center mt-6">
                <Link href="/educator/verification" className="btn btn-primary">
                  <Award className="w-4 h-4 mr-2" /> Portal Verifikasi Pendidik
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="main-footer">
        <div className="container footer-container">
          <div className="footer-brand">
            <Link href="/" className="brand-logo">
              <span className="brand-title">
                SEMESTA<span className="brand-accent">ISLAM</span>
              </span>
            </Link>
            <p>
              Platform digital terpercaya penghubung pembelajaran &amp; pendidikan Islam berlandaskan
              nilai Rabbani.
            </p>
          </div>
          <div className="footer-links">
            <h4>Platform</h4>
            <Link href="/">Beranda</Link>
            <Link href="/directory">Direktori Pendidik</Link>
            <Link href="/booking">Ajukan Sesi Belajar</Link>
            <Link href="/#verification">Sistem Verifikasi</Link>
            <Link href="/faq">Pertanyaan Umum (FAQ)</Link>
          </div>
          <div className="footer-links">
            <h4>Pendidik &amp; Dev</h4>
            <Link href="/educator/verification">Portal Verifikasi Pendidik</Link>
            <Link href="/developer">Developer API</Link>
            <Link href="/changelog">Catatan Perubahan</Link>
          </div>
          <div className="footer-links">
            <h4>Kebijakan &amp; Legal</h4>
            <Link href="/about">Tentang Kami</Link>
            <Link href="/contact">Hubungi Kami</Link>
            <Link href="/privacy-policy">Kebijakan Privasi</Link>
            <Link href="/terms-of-service">Syarat &amp; Ketentuan</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 SEMESTA ISLAM. Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </footer>
    </main>
  );
}
