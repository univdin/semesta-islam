'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, BookOpen, ChevronDown } from 'lucide-react';

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [expertise, setExpertise] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.append('q', query.trim());
    if (expertise) params.append('expertise', expertise);
    if (location) params.append('location', location);
    
    const qs = params.toString();
    router.push(qs ? `/directory?${qs}` : '/directory');
  };

  return (
    <form onSubmit={handleSubmit} className="search-box-card glass-panel" role="search" aria-label="Cari pendidik">
      <div className="search-input-group flex flex-col md:flex-row gap-0">
        
        {/* Main Query Input */}
        <div className="flex-1 flex items-center min-w-0 py-1 md:border-r border-emerald-900/10 dark:border-emerald-100/10 px-1">
          <Search className="search-icon w-5 h-5 ml-1 mr-2 text-emerald-800/50 dark:text-emerald-100/50 shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama pendidik..."
            className="w-full bg-transparent border-none outline-none text-sm placeholder:text-gray-500"
            aria-label="Kata kunci pencarian"
          />
        </div>

        {/* Expertise Dropdown */}
        <div className="flex items-center min-w-[140px] py-1 border-t md:border-t-0 md:border-r border-emerald-900/10 dark:border-emerald-100/10 px-2 relative group cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
          <BookOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-300 mr-2 shrink-0" />
          <select 
            value={expertise} 
            onChange={(e) => setExpertise(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm appearance-none cursor-pointer text-gray-700 dark:text-gray-300 font-medium"
            aria-label="Filter keahlian"
          >
            <option value="">Semua Keahlian</option>
            <option value="Tahsin">Tahsin & Tajwid</option>
            <option value="Fiqh">Fiqh Ibadah</option>
            <option value="Aqidah">Aqidah</option>
            <option value="Bahasa Arab">Bahasa Arab</option>
          </select>
          <ChevronDown className="w-3 h-3 text-gray-400 absolute right-3 pointer-events-none" />
        </div>

        {/* Location Dropdown */}
        <div className="flex items-center min-w-[130px] py-1 border-t md:border-t-0 md:border-r border-emerald-900/10 dark:border-emerald-100/10 px-2 relative group cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
          <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-300 mr-2 shrink-0" />
          <select 
            value={location} 
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm appearance-none cursor-pointer text-gray-700 dark:text-gray-300 font-medium"
            aria-label="Filter lokasi"
          >
            <option value="">Semua Kota</option>
            <option value="Jakarta">Jakarta</option>
            <option value="Bandung">Bandung</option>
            <option value="Surabaya">Surabaya</option>
            <option value="Online">Online / Daring</option>
          </select>
          <ChevronDown className="w-3 h-3 text-gray-400 absolute right-3 pointer-events-none" />
        </div>

        {/* Submit Button */}
        <div className="p-1 border-t md:border-t-0 border-emerald-900/10 dark:border-emerald-100/10 flex">
          <button type="submit" className="filter-trigger-btn flex-1 md:flex-none justify-center rounded-full hover:scale-105 transition-transform" style={{ padding: '0.6rem 1.5rem', margin: '2px' }}>
            <Search className="w-4 h-4" />
            <span className="font-semibold tracking-wide">Cari</span>
          </button>
        </div>

      </div>
    </form>
  );
}
