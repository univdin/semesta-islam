'use client';

import React, { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';

const SUPPORT_EMAIL = 'support@ilmify.id';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [message, setMessage] = useState('');
  const [opening, setOpening] = useState(false);

  const categoryLabel =
    {
      GENERAL: 'Pertanyaan Umum Platform',
      BOOKING: 'Pengajuan & Jadwal Belajar',
      VERIFICATION: 'Verifikasi Pendidik / Lajnah',
      TECHNICAL: 'Kendala Teknis Account',
    }[category] ?? 'Pertanyaan Umum Platform';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[ILMIFY] ${categoryLabel} — dari ${name || 'Pengguna'}`);
    const body = encodeURIComponent(
      `Nama: ${name}\nEmail: ${email}\nKategori: ${categoryLabel}\n\n${message}`
    );
    setOpening(true);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    // Fallback reset after a short delay so the button is not left in a busy
    // state if the mail client opens instantly.
    setTimeout(() => setOpening(false), 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Lengkap</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="contoh: Ahmad Fauzi"
            className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F3D2E] bg-white/80"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Alamat Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contoh: ahmad@gmail.com"
            className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F3D2E] bg-white/80"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1">Kategori Pertanyaan</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F3D2E] bg-white/80"
        >
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
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tuliskan pertanyaan atau kendala Anda secara rinci..."
          className="w-full text-sm p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0F3D2E] bg-white/80 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={opening}
        className="w-full btn btn-primary text-sm py-3 inline-flex items-center justify-center gap-2"
      >
        {opening ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Mail className="w-4 h-4" />
        )}
        {opening ? 'Membuka aplikasi email…' : 'Kirim Pesan Support'}
      </button>
      <p className="text-xs text-gray-400">
        Formulir ini membuka aplikasi email Anda ke {SUPPORT_EMAIL} dengan pesan yang sudah terisi.
        Email adalah saluran bantuan resmi platform.
      </p>
    </form>
  );
}
