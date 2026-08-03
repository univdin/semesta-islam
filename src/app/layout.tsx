import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
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
  title: 'SEMESTA ISLAM — Platform Edukasi & Pendidik Islam Terverifikasi',
  description: 'Ekosistem digital terpercaya yang menghubungkan keluarga & pembelajar dengan pendidik dan lembaga Islam terverifikasi.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'SEMESTA ISLAM — Platform Edukasi & Pendidik Islam Terverifikasi',
    description: 'Ekosistem digital terpercaya yang menghubungkan keluarga & pembelajar dengan pendidik dan lembaga Islam terverifikasi.',
    siteName: 'SEMESTA ISLAM',
    locale: 'id_ID',
    type: 'website',
    url: 'https://semesta-islam.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SEMESTA ISLAM — Platform Edukasi & Pendidik Islam Terverifikasi',
    description: 'Ekosistem digital terpercaya yang menghubungkan keluarga & pembelajar dengan pendidik dan lembaga Islam terverifikasi.',
  },
  robots: {
    index: true,
    follow: true,
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
      </body>
    </html>
  );
}
