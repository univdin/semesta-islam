'use client';

import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { EducatorCard } from '@/components/ui/EducatorCard';
import { EducatorSummary } from '@/types';

interface DirectoryClientProps {
  educators: EducatorSummary[];
}

export function DirectoryClient({ educators }: DirectoryClientProps) {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredEducators = educators.filter((edu) => {
    const matchesSearch =
      searchQuery === '' ||
      edu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      edu.expertise.some((e) => e.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' ||
      edu.expertise.some((e) => e.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="main-content pt-20">
      <div className="container py-8">
        <div className="directory-header mb-8">
          <h1 className="text-3xl font-bold text-[#0F3D2E] mb-2">Direktori Pendidik Islam</h1>
          <p className="text-secondary">
            Cari dan hubungkan keluarga Anda dengan ustaz, ustazah, dan pakar studi Islam. Status
            verifikasi ditampilkan apa adanya pada setiap kartu.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="filter-bar glass-panel p-4 mb-8 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
          <div className="search-input-group flex-1 min-w-[280px]">
            <Search className="search-icon w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pendidik atau topik (Tahsin, Fiqh, Arab)..."
              className="w-full bg-transparent border-none outline-none text-sm px-2"
            />
          </div>

          <div className="category-tags flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {['all', 'Tahsin', 'Fiqh', 'Bahasa Arab', 'Aqidah'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`tag-btn px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#0F3D2E] text-white shadow-sm'
                    : 'bg-white/80 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat === 'all' ? 'Semua Topik' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        {filteredEducators.length > 0 ? (
          <div className="directory-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEducators.map((edu) => (
              <EducatorCard key={edu.id} educator={edu} />
            ))}
          </div>
        ) : (
          <div className="empty-state text-center py-16 glass-panel rounded-2xl">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#0F3D2E]">Tidak Ada Pendidik Ditemukan</h3>
            <p className="text-sm text-gray-500 mt-1">Coba ubah kata kunci pencarian atau filter topik Anda.</p>
          </div>
        )}
      </div>
    </main>
  );
}
