import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Megaphone, Download, Image as ImageIcon, FileText, Share2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kit Pemasaran & Aset Brand — ilmify.id',
  description:
    'Unduh aset resmi logo, panduan warna, banner media sosial, serta materi pemasaran bermartabat ilmify.id.',
  alternates: { canonical: '/marketing-kit' },
  openGraph: {
    title: 'Kit Pemasaran & Aset Brand — ilmify.id',
    description: 'Aset visual resmi, logo vector, banner social share, dan pedoman penulisan ilmify.id.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'Marketing Kit — ilmify.id' }],
  },
};

export default function MarketingKitPage() {
  return (
    <main className="main-content pt-20">
      <div className="container py-8 max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200">
            <Megaphone className="w-3.5 h-3.5" /> Kit Pemasaran &amp; Aset Brand Resmi
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#0F3D2E] tracking-tight">
            Marketing Kit &amp; Media Assets
          </h1>
          <p className="text-sm text-gray-600 max-w-xl mx-auto">
            Unduh aset visual resmi, logo vector, banner media sosial, serta pedoman penulisan bermartabat untuk kemitraan Syi'ar <strong>ilmify.id</strong>.
          </p>
        </div>

        {/* Assets Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Asset Card 1: Logo Vector */}
          <div className="glass-panel p-6 rounded-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#0F3D2E] text-[#D4AF37] flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">SVG / HD PNG</span>
            </div>
            <div>
              <h3 className="font-bold text-[#0F3D2E] text-base">Logo Resmi &amp; Icon Mark</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Vektor logo *Rub el Hizb* &amp; *Rehal* lengkap dengan varian Emerald &amp; Gold untuk media cetak maupun digital.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <a href="/logo.svg" download className="btn btn-primary text-xs py-2 px-4 inline-flex items-center">
                <Download className="w-3.5 h-3.5 mr-1.5" /> Logo (SVG)
              </a>
              <a href="/logo.png" download className="btn btn-secondary text-xs py-2 px-4 inline-flex items-center">
                <Download className="w-3.5 h-3.5 mr-1.5" /> Logo (PNG HD)
              </a>
            </div>
          </div>

          {/* Asset Card 2: OpenGraph Banner */}
          <div className="glass-panel p-6 rounded-2xl space-y-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-[#0F3D2E] text-[#D4AF37] flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full">1200 x 630 px</span>
            </div>
            <div>
              <h3 className="font-bold text-[#0F3D2E] text-base">Banner Media Sosial (OpenGraph)</h3>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Gambar pratinjau resmi untuk dibagikan di WhatsApp, Telegram, Twitter/X, dan Facebook.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <a href="/og-image.svg" download className="btn btn-gold text-xs py-2 px-4 inline-flex items-center">
                <Download className="w-3.5 h-3.5 mr-1.5" /> Unduh OG Banner (SVG)
              </a>
            </div>
          </div>
        </div>

        {/* Brand Guidelines & Terminology Standard */}
        <article className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
          <h2 className="text-lg font-bold text-[#0F3D2E] flex items-center gap-2 border-b border-gray-100 pb-3">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37]" /> Pedoman Penulisan Bermartabat (Dignified Copywriting Rules)
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Dalam mempublikasikan materi komunikasi <strong>ilmify.id</strong>, mitra diwajibkan menggunakan bahasa yang santun, Rabbani, dan menghormati posisi pendidik keislaman:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200/60 space-y-2">
              <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Istilah Resmi Bermartabat (WAJIB)
              </h4>
              <ul className="space-y-1 text-emerald-800">
                <li>• **Direktori Edukasi / Ekosistem Pembelajaran**</li>
                <li>• **Nisbah Apresiasi Kemitraan / Alokasi Layanan**</li>
                <li>• **Apresiasi Sesi Belajar / Alokasi Poin**</li>
                <li>• **Bimbingan Terkonfirmasi / Sesi Terjadwal**</li>
              </ul>
            </div>

            <div className="bg-red-50/60 p-4 rounded-xl border border-red-200/60 space-y-2">
              <h4 className="font-bold text-red-900">
                ❌ Istilah Komersial Kasar (DILARANG)
              </h4>
              <ul className="space-y-1 text-red-800">
                <li>• <s>Marketplace Edukasi / Toko Guru</s></li>
                <li>• <s>Komisi Platform / Broker Fee</s></li>
                <li>• <s>Transaksi Belajar / Pembayaran Mengaji</s></li>
                <li>• <s>Sales / Conversion / Payout Kasar</s></li>
              </ul>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
