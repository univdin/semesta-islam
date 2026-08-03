import React from 'react';

export const metadata = {
  title: 'Ambassador Syi\'ar Komunitas — ILMIFY',
  description: 'Pusat Syi\'ar Komunitas SEMESTA ISLAM: Menyebarkan manfaat dan menghubungkan penuntut ilmu.',
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilmify.id';

export default function AmbassadorPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Banner */}
        <div className="bg-emerald-950 text-white rounded-2xl p-6 sm:p-8 space-y-3 shadow-md">
          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 font-medium text-xs rounded-full border border-amber-400/30">
            Capability 06: Ambassador & Community System
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-serif">
            Menjadi Bagian dari Syi'ar Ilmu & Khidmah Komunitas
          </h1>
          <p className="text-sm text-emerald-100/80 max-w-2xl">
            Ambassador Syi'ar adalah anggota aktif komunitas yang membantu menyebarkan manfaat literasi Islam dan rekomendasi guru ber-sanad.
          </p>
        </div>

        {/* Multi-Actor Link Generator & Toolkit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-semibold text-emerald-950">Generator Link Syi'ar Unik</h3>
            <p className="text-xs text-slate-600">
              Buat link atribusi syi'ar untuk membagikan konten diagnostik atau program pembelajaran ke komunitas Anda.
            </p>
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-700">Tujuan Halaman:</label>
              <select className="w-full border border-slate-200 rounded-xl p-2.5 text-xs">
                <option value="/discovery">Diagnostik Pembelajaran (/discovery)</option>
                <option value="/directory">Katalog Guru Ber-Sanad (/directory)</option>
              </select>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono break-all text-emerald-900">
              {`${siteUrl}/discovery?ref=AMBASSADOR_USER_KEY`}
            </div>
            <button
              type="button"
              className="w-full py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white font-medium text-xs rounded-xl transition"
            >
              Salin Link Syi'ar Unik
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-semibold text-emerald-950">Toolkit Pesan Syi'ar WhatsApp</h3>
            <p className="text-xs text-slate-600">
              Gunakan template pesan yang santun, informatif, dan bebas dari klaim komersialisasi berlebihan.
            </p>
            <div className="p-3 bg-emerald-50/50 border border-emerald-900/10 rounded-xl text-xs text-slate-700 space-y-2">
              <p className="font-semibold text-emerald-950">Template Syi'ar Diagnostik:</p>
              <p>
                "Assalamu'alaikum wr. wb. Bagi bapak/ibu yang ingin berkonsultasi mengenai kebutuhan pembelajaran Al-Qur'an dan ilmu agama untuk keluarga, SEMESTA ISLAM menyediakan diagnostik online gratis untuk rekomendasi guru ber-sanad..."
              </p>
            </div>
            <button
              type="button"
              className="w-full py-2.5 border border-emerald-900 text-emerald-900 hover:bg-emerald-50 font-medium text-xs rounded-xl transition"
            >
              Salin Template Pesan WA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
