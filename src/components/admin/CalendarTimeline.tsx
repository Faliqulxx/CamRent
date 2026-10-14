'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ChevronDown,
  Layers,
  Info,
} from 'lucide-react';
import {
  addDays,
  subDays,
  format,
  eachDayOfInterval,
  isSameDay,
  parseISO,
} from 'date-fns';
import { id } from 'date-fns/locale';
import { formatDate } from '@/lib/utils';

export interface CalendarUnitData {
  unitId: string;
  code: string;
  productName: string;
  productId: string;
  status: string;
  bookings: {
    rentalId: string;
    code: string;
    startDate: string;
    endDate: string;
    cleaningDays: number;
    status: string;
    customerName: string;
  }[];
  maintenances: {
    id: string;
    issue: string;
    startDate: string;
    expectedReadyDate: string;
    status: string;
  }[];
}

interface CalendarTimelineProps {
  units: CalendarUnitData[];
  products: { id: string; name: string }[];
}

export default function CalendarTimeline({ units, products }: CalendarTimelineProps) {
  const [currentBaseDate, setCurrentBaseDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'WEEK' | 'MONTH'>('WEEK');
  const [selectedProductFilter, setSelectedProductFilter] = useState('');
  const [selectedRentalPopup, setSelectedRentalPopup] = useState<any>(null);

  const daysCount = viewMode === 'WEEK' ? 7 : 14;
  const days = eachDayOfInterval({
    start: currentBaseDate,
    end: addDays(currentBaseDate, daysCount - 1),
  });

  const filteredUnits = selectedProductFilter
    ? units.filter((u) => u.productId === selectedProductFilter)
    : units;

  const navigatePrev = () => {
    setCurrentBaseDate((prev) => subDays(prev, daysCount));
  };

  const navigateNext = () => {
    setCurrentBaseDate((prev) => addDays(prev, daysCount));
  };

  // Helper to determine day status for unit
  const getUnitDayStatus = (unit: CalendarUnitData, day: Date) => {
    // 1. Check Maintenance
    for (const m of unit.maintenances) {
      const mStart = parseISO(m.startDate);
      const mEnd = parseISO(m.expectedReadyDate);
      if (day >= mStart && day <= mEnd) {
        return {
          type: 'MAINTENANCE',
          label: 'Maint',
          color: 'bg-amber-400 text-amber-950 font-bold',
          title: `Maintenance: ${m.issue}`,
        };
      }
    }

    // 2. Check Bookings & Cleaning
    for (const b of unit.bookings) {
      const bStart = parseISO(b.startDate);
      const bEnd = parseISO(b.endDate);
      const cleanEnd = addDays(bEnd, b.cleaningDays);

      if (day >= bStart && day <= bEnd) {
        return {
          type: 'BOOKED',
          label: b.code.replace('#CR-2026-', '#'),
          color: 'bg-rose-500 text-white font-bold',
          title: `Rental ${b.code} (${b.customerName})`,
          data: b,
        };
      }

      if (day > bEnd && day <= cleanEnd) {
        return {
          type: 'CLEANING',
          label: 'Clean',
          color: 'bg-slate-400 text-white font-semibold',
          title: `Pembersihan Unit (Cleaning Period: ${b.cleaningDays} hari)`,
        };
      }
    }

    return {
      type: 'AVAILABLE',
      label: '',
      color: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
      title: 'Unit Tersedia',
    };
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 sm:gap-4">
        <div>
          <h1 className="text-xl font-black text-text tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            Kalender Timeline Rental Unit
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Pantau jadwal penggunaan unit fisik, masa booking, dan pembersihan setelah return.
          </p>
        </div>

        {/* View Controls & Period Switcher */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* Product Filter */}
          <select
            value={selectedProductFilter}
            onChange={(e) => setSelectedProductFilter(e.target.value)}
            className="w-full sm:w-auto p-2.5 min-h-[44px] md:min-h-0 bg-gray-50 border border-border rounded-xl text-base md:text-xs font-bold text-text outline-none cursor-pointer"
          >
            <option value="">Semua Peralatan ({units.length} Unit)</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 justify-between">
            {/* Mode Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setViewMode('WEEK')}
                className={`px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-lg transition-all ${
                  viewMode === 'WEEK' ? 'bg-white text-text font-bold shadow-xs' : 'text-text-muted'
                }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => setViewMode('MONTH')}
                className={`px-3 py-2 sm:py-1.5 min-h-[40px] sm:min-h-0 rounded-lg transition-all ${
                  viewMode === 'MONTH' ? 'bg-white text-text font-bold shadow-xs' : 'text-text-muted'
                }`}
              >
                14 Hari
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1 border border-border rounded-xl p-1 bg-gray-50">
              <button
                onClick={navigatePrev}
                className="p-2 sm:p-1.5 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                title="Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4 text-text" />
              </button>
              <span className="text-xs font-bold text-text px-2 min-w-[110px] text-center">
                {format(currentBaseDate, 'dd MMM yyyy', { locale: id })}
              </span>
              <button
                onClick={navigateNext}
                className="p-2 sm:p-1.5 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg hover:bg-white transition-colors"
                title="Berikutnya"
              >
                <ChevronRight className="w-4 h-4 text-text" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Scroll Hint */}
      <div className="md:hidden flex items-center gap-2 px-3 py-2 bg-accent-mint/40 border border-primary/20 rounded-xl text-xs font-medium text-primary">
        <Info className="w-4 h-4 shrink-0 text-primary" />
        <span>Geser tabel ke kanan untuk melihat jadwal tanggal berikutnya. Kolom kode unit terkunci di kiri.</span>
      </div>

      {/* Timeline Grid (PRD 6.13: Baris = Unit, Kolom = Tanggal) */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="p-3.5 font-bold uppercase text-[10px] tracking-wider text-text-muted w-36 sm:w-48 sticky left-0 bg-gray-50 z-20 border-r border-border shadow-xs">
                  Unit Fisik
                </th>
                {days.map((d) => {
                  const isToday = isSameDay(d, new Date());
                  return (
                    <th
                      key={d.toISOString()}
                      className={`p-2.5 text-center font-bold text-[11px] min-w-[64px] border-r border-border ${
                        isToday ? 'bg-accent-mint/60 text-primary' : 'text-text'
                      }`}
                    >
                      <span className="block text-[10px] uppercase text-text-muted">
                        {format(d, 'EEE', { locale: id })}
                      </span>
                      <span>{format(d, 'dd MMM')}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUnits.slice(0, 40).map((u) => (
                <tr key={u.unitId} className="hover:bg-gray-50/50">
                  <td className="p-3 sticky left-0 bg-white z-20 border-r border-border font-bold text-text shadow-xs">
                    <span className="block font-black text-primary">{u.code}</span>
                    <span className="block text-[10px] text-text-muted font-normal truncate max-w-[130px] sm:max-w-[170px]">
                      {u.productName}
                    </span>
                  </td>

                  {days.map((d) => {
                    const status = getUnitDayStatus(u, d);

                    return (
                      <td
                        key={d.toISOString()}
                        className="p-1 border-r border-border h-12 text-center"
                        title={status.title}
                      >
                        <div
                          onClick={() => {
                            if (status.data) setSelectedRentalPopup(status.data);
                          }}
                          className={`w-full h-full rounded-lg text-[9px] flex items-center justify-center cursor-pointer transition-all shadow-2xs ${status.color}`}
                        >
                          {status.label}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legenda Warna (PRD 6.13) */}
        <div className="p-4 border-t border-border bg-gray-50/60 flex flex-wrap items-center gap-6 text-xs text-text-muted">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-300" />
            <span className="font-semibold text-text">Available (Tersedia)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-rose-500 text-white" />
            <span className="font-semibold text-text">Booked (#CR-...)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-amber-400" />
            <span className="font-semibold text-text">Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-slate-400" />
            <span className="font-semibold text-text">Cleaning Period</span>
          </div>
        </div>
      </div>

      {/* Booking Quick Popup */}
      {selectedRentalPopup && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-border shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted uppercase">Informasi Rental</span>
              <button onClick={() => setSelectedRentalPopup(null)} className="text-text-muted hover:text-text">
                ✕
              </button>
            </div>
            <h3 className="font-black text-primary text-base">{selectedRentalPopup.code}</h3>
            <p className="text-xs text-text">Penyewa: <b>{selectedRentalPopup.customerName}</b></p>
            <p className="text-xs text-text-muted">
              Jadwal: {formatDate(selectedRentalPopup.startDate)} s/d {formatDate(selectedRentalPopup.endDate)}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setSelectedRentalPopup(null)}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
