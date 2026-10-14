'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Search, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { addDays, format } from 'date-fns';

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
      className="w-full max-w-4xl bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl border border-border flex flex-col md:flex-row items-stretch gap-3 md:gap-4"
    >
      {/* Date Pickers Container: Full Vertical on Mobile, Row on Desktop */}
      <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
        {/* Tanggal Sewa */}
        <div className="w-full flex-1 bg-gray-50 hover:bg-gray-100/90 transition-colors rounded-xl px-3.5 py-2.5 border border-border/80">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Tanggal Sewa (Pickup)
          </label>
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
            className="w-full bg-transparent text-base md:text-sm font-bold text-text outline-none cursor-pointer min-h-[36px]"
            required
          />
        </div>

        <div className="hidden sm:block text-text-muted font-bold text-xs">→</div>

        {/* Tanggal Kembali */}
        <div className="w-full flex-1 bg-gray-50 hover:bg-gray-100/90 transition-colors rounded-xl px-3.5 py-2.5 border border-border/80">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-text-muted mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            Tanggal Kembali (Return)
          </label>
          <input
            type="date"
            value={localEnd}
            min={localStart}
            onChange={(e) => setLocalEnd(e.target.value)}
            className="w-full bg-transparent text-base md:text-sm font-bold text-text outline-none cursor-pointer min-h-[36px]"
            required
          />
        </div>
      </div>

      {/* Button Submit: Full Width on Mobile, Auto on Desktop */}
      <button
        type="submit"
        className="w-full md:w-auto px-8 py-3.5 min-h-[48px] bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2 group shrink-0 active:scale-95"
      >
        <Search className="w-4 h-4" />
        <span>Cari Peralatan</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </form>
  );
}
