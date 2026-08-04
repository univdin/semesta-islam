'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { EducatorCard } from '@/components/ui/EducatorCard';
import { EducatorSummary } from '@/types';

export interface DirectoryFilters {
  q?: string;
  expertise?: string;
  location?: string;
  method?: string;
  sort?: string;
}

interface DirectoryClientProps {
  educators: EducatorSummary[];
  total: number;
  page: number;
  limit: number;
  filters: DirectoryFilters;
  expertiseOptions: string[];
  locationOptions: string[];
}

const METHOD_LABELS: Record<string, string> = {
  all: 'Semua Metode',
  ONLINE_ZOOM: 'Online (Zoom / Meet)',
  PRIVATE_HOME: 'Privat ke Rumah',
  GROUP_MAJELIS: 'Majelis / Kelompok',
};
const SORT_LABELS: Record<string, string> = {
  rating: 'Rating Tertinggi',
  reviews: 'Ulasan Terbanyak',
};

export function DirectoryClient({
  educators,
  total,
  page,
  limit,
  filters,
  expertiseOptions,
  locationOptions,
}: DirectoryClientProps) {
  const router = useRouter();
  const [q, setQ] = useState(filters.q ?? '');

  const totalPages = Math.max(1, Math.ceil(total / limit));

  function apply(overrides: Partial<DirectoryFilters> & { page?: number | string } = {}) {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());

    const expertise = overrides.expertise !== undefined ? overrides.expertise : filters.expertise;
    if (expertise) params.set('expertise', expertise);

    const location = overrides.location !== undefined ? overrides.location : filters.location;
    if (location) params.set('location', location);

    const method = overrides.method !== undefined ? overrides.method : filters.method;
    if (method && method !== 'all') params.set('method', method);

    const sort = overrides.sort !== undefined ? overrides.sort : filters.sort;
    if (sort && sort !== 'rating') params.set('sort', sort);

    const nextPage = overrides.page !== undefined ? Number(overrides.page) : page;
    if (nextPage > 1) params.set('page', String(nextPage));

    const qs = params.toString();
    router.push(qs ? `/directory?${qs}` : '/directory');
  }

  const selectClass =
    'bg-transparent border-none outline-none text-sm cursor-pointer text-gray-700 dark:text-slate-200 font-medium p-1 rounded-lg dark:hover:bg-slate-800/50 transition-colors';

  return (
    <main className="main-content pt-20">
      <div className="container py-8">
        <div className="directory-header mb-8">
          <h1 className="text-3xl font-bold text-[#0F3D2E] dark:text-[#F3E5AB] mb-2">Direktori Pendidik Islam</h1>
          <p className="text-secondary dark:text-slate-300">
            Cari dan hubungkan keluarga Anda dengan ustaz, ustazah, dan pakar studi Islam. Status
            verifikasi ditampilkan apa adanya pada setiap kartu.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="filter-bar glass-panel p-4 mb-6 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
          <form
            className="search-input-group flex-1 min-w-[280px]"
            role="search"
            aria-label="Cari pendidik"
            onSubmit={(e) => {
              e.preventDefault();
              apply({ page: '1' });
            }}
          >
            <Search className="search-icon w-5 h-5 text-gray-400 dark:text-slate-400" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama pendidik, topik, atau lembaga..."
              className="w-full bg-transparent border-none outline-none text-sm px-2 text-slate-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              aria-label="Kata kunci pencarian"
            />
          </form>

          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={filters.expertise ?? ''}
              onChange={(e) => apply({ expertise: e.target.value || undefined, page: '1' })}
              className={selectClass}
              aria-label="Filter keahlian"
            >
              <option value="" className="dark:bg-slate-900 dark:text-slate-100">Semua Keahlian</option>
              {expertiseOptions.map((opt) => (
                <option key={opt} value={opt} className="dark:bg-slate-900 dark:text-slate-100">
                  {opt}
                </option>
              ))}
            </select>

            <select
              value={filters.location ?? ''}
              onChange={(e) => apply({ location: e.target.value || undefined, page: '1' })}
              className={selectClass}
              aria-label="Filter lokasi"
            >
              <option value="" className="dark:bg-slate-900 dark:text-slate-100">Semua Kota</option>
              {locationOptions.map((opt) => (
                <option key={opt} value={opt} className="dark:bg-slate-900 dark:text-slate-100">
                  {opt}
                </option>
              ))}
            </select>

            <select
              value={filters.method ?? 'all'}
              onChange={(e) => apply({ method: e.target.value || 'all', page: '1' })}
              className={selectClass}
              aria-label="Filter metode belajar"
            >
              {Object.entries(METHOD_LABELS).map(([val, label]) => (
                <option key={val} value={val} className="dark:bg-slate-900 dark:text-slate-100">
                  {label}
                </option>
              ))}
            </select>

            <select
              value={filters.sort ?? 'rating'}
              onChange={(e) => apply({ sort: e.target.value || 'rating' })}
              className={selectClass}
              aria-label="Urutkan"
            >
              {Object.entries(SORT_LABELS).map(([val, label]) => (
                <option key={val} value={val} className="dark:bg-slate-900 dark:text-slate-100">
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-4" role="status">
          {total} pendidik ditemukan
          {(filters.q || filters.expertise || filters.location) && (
            <span> · hasil difilter di server</span>
          )}
        </p>

        {/* Results Grid */}
        {educators.length > 0 ? (
          <div className="directory-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {educators.map((edu) => (
              <EducatorCard key={edu.id} educator={edu} />
            ))}
          </div>
        ) : (
          <div className="empty-state text-center py-16 glass-panel rounded-2xl">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#0F3D2E]">Tidak Ada Pendidik Ditemukan</h3>
            <p className="text-sm text-gray-500 mt-1">
              Coba ubah kata kunci pencarian atau hapus sebagian filter.
            </p>
            <button
              type="button"
              onClick={() => router.push('/directory')}
              className="mt-4 px-4 py-2 text-sm font-semibold rounded-full bg-[#0F3D2E] text-white hover:bg-[#164f3c] transition-colors"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav
            className="mt-8 flex items-center justify-center gap-4"
            aria-label="Navigasi halaman"
          >
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => apply({ page: String(page - 1) })}
              className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-full border border-gray-200 bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </button>
            <span className="text-sm text-gray-600">
              Halaman {page} dari {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => apply({ page: String(page + 1) })}
              className="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-full border border-gray-200 bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Berikutnya <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}
