import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import '@/styles/globals.css';
import { HeaderServer } from '@/components/ui/HeaderServer';
import { BottomNav } from '@/components/ui/BottomNav';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { DemoRoleSwitcher } from '@/components/dev/DemoRoleSwitcher';
import { isDemoMode } from '@/lib/auth/session';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://semesta-islam.vercel.app'),
  title: {
    default: 'SEMESTA ISLAM — Platform Edukasi & Pendidik Islam Terverifikasi',
    template: '%s | SEMESTA ISLAM',
  },
  description:
    'Ekosistem digital terpercaya yang menghubungkan keluarga & pembelajar dengan ustaz, ustazah, dan lembaga Islam terverifikasi sanad keilmuannya.',
  keywords: [
    'SEMESTA ISLAM',
    'Pendidik Islam Terverifikasi',
    'Cari Ustaz Online',
    'Guru Mengaji Privat',
    'Sanad Keilmuan',
    'Lajnah Verifikasi',
    'Kajian Islam',
    'Pendidikan Rabbani',
  ],
  manifest: '/site.webmanifest',
  verification: {
    google: 'yj2dv9eWQ6xhTsBLFyjaEggSi-JkTVIRwRK08kP-_TI',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'SEMESTA ISLAM — Platform Edukasi & Pendidik Islam Terverifikasi',
    description:
      'Hubungkan keluarga Anda dengan ustaz, ustazah, dan lembaga Islam terverifikasi sanad & kredensial keilmuannya oleh Lajnah.',
    siteName: 'SEMESTA ISLAM',
    locale: 'id_ID',
    type: 'website',
    url: 'https://semesta-islam.vercel.app',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'SEMESTA ISLAM — Platform Edukasi & Pendidik Islam Terverifikasi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SEMESTA ISLAM — Platform Edukasi & Pendidik Islam Terverifikasi',
    description:
      'Hubungkan keluarga Anda dengan ustaz, ustazah, dan lembaga Islam terverifikasi sanad & kredensial keilmuannya.',
    images: ['/og-image.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demoMode = isDemoMode();

  return (
    <html lang="id" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <a
          href="#main-content"
          className="skip-link"
        >
          Lewati ke konten utama
        </a>
        <ToastProvider>
          <div id="app" className="app-shell">
            <HeaderServer />
            <div id="main-content">{children}</div>
            <BottomNav />
            {demoMode && <DemoRoleSwitcher />}
          </div>
        </ToastProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
