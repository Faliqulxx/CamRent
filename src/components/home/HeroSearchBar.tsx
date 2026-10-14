'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { addDays, format } from 'date-fns';

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

export default function HeroSearchBar() {
  const router = useRouter();
  const { startDate, endDate, setDateRange } = useCart();

  const [localStart, setLocalStart] = useState(startDate);
  const [localEnd, setLocalEnd] = useState(endDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDateRange(localStart, localEnd);
    router.push(`/catalog?start=${localStart}&end=${localEnd}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl bg-white rounded-2xl sm:rounded-full p-2 sm:p-2.5 shadow-2xl border border-white/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3"
    >
      {/* Tanggal Sewa */}
      <div className="relative flex-1 flex items-center gap-3 px-4 py-2 hover:bg-gray-50/80 rounded-xl sm:rounded-full transition-colors cursor-pointer group">
        <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#165a3d] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Calendar className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Tanggal Sewa
          </span>
          <span className="block text-sm font-bold text-gray-900 truncate">
            {formatDisplayDate(localStart) || 'Pilih tanggal'}
          </span>
        </div>
        <input
          type="date"
          value={localStart}
          min={format(new Date(), 'yyyy-MM-dd')}
          onChange={(e) => {
            setLocalStart(e.target.value);
            if (e.target.value >= localEnd) {
              setLocalEnd(format(addDays(new Date(e.target.value), 2), 'yyyy-MM-dd'));
            }
          }}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          required
          aria-label="Tanggal Sewa"
        />
      </div>

      {/* Vertical Divider */}
      <div className="hidden sm:block w-px h-8 bg-gray-200" />

      {/* Tanggal Kembali */}
      <div className="relative flex-1 flex items-center gap-3 px-4 py-2 hover:bg-gray-50/80 rounded-xl sm:rounded-full transition-colors cursor-pointer group">
        <div className="w-9 h-9 rounded-full bg-emerald-50 text-[#165a3d] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Calendar className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Tanggal Kembali
          </span>
          <span className="block text-sm font-bold text-gray-900 truncate">
            {formatDisplayDate(localEnd) || 'Pilih tanggal'}
          </span>
        </div>
        <input
          type="date"
          value={localEnd}
          min={localStart}
          onChange={(e) => setLocalEnd(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          required
          aria-label="Tanggal Kembali"
        />
      </div>

      {/* Cari Peralatan Button */}
      <button
        type="submit"
        className="w-full sm:w-auto px-7 py-3 min-h-[46px] bg-[#165a3d] hover:bg-[#124b32] text-white font-bold text-sm rounded-xl sm:rounded-full transition-all shadow-md shadow-[#165a3d]/20 flex items-center justify-center gap-2 group shrink-0 active:scale-95"
      >
        <Search className="w-4 h-4" />
        <span>Cari Peralatan</span>
      </button>
    </form>
  );
}
