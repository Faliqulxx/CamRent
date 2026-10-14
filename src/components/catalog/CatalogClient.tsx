'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Star,
  Calendar,
  Tent,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowUpDown,
  Check,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { addDays, format, parseISO } from 'date-fns';

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  capacity: number | null;
  dimension: string | null;
  weightKg: number | null;
  pricePerDay: number;
  cleaningDays: number;
  ratingAvg: number;
  ratingCount: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: { url: string }[];
  totalUnits: number;
  availableUnits: number;
}

interface CatalogClientProps {
  initialProducts: CatalogProduct[];
  categories: { id: string; name: string; slug: string; count: number }[];
  initialCategory?: string;
  initialStart?: string;
  initialEnd?: string;
}

export default function CatalogClient({
  initialProducts,
  categories,
  initialCategory = '',
  initialStart,
  initialEnd,
}: CatalogClientProps) {
  const { startDate, endDate, setDateRange } = useCart();

  // Local date states
  const [localStart, setLocalStart] = useState<string>(initialStart || startDate);
  const [localEnd, setLocalEnd] = useState<string>(initialEnd || endDate);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedCapacities, setSelectedCapacities] = useState<number[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(200000);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'newest'>('popular');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Prevent background scroll when mobile filter sheet is open
  useEffect(() => {
    if (filterDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [filterDrawerOpen]);

  // Handle date change
  const handleApplyDates = (newStart: string, newEnd: string) => {
    setLocalStart(newStart);
    setLocalEnd(newEnd);
    setDateRange(newStart, newEnd);
  };

  const toggleCapacity = (cap: number) => {
    setSelectedCapacities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  const activeFiltersCount =
    (selectedCategory ? 1 : 0) +
    selectedCapacities.length +
    (maxPrice < 200000 ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const resetAllFilters = () => {
    setSelectedCategory('');
    setSelectedCapacities([]);
    setMaxPrice(200000);
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((p) => {
        if (selectedCategory && p.category.slug !== selectedCategory) return false;
        if (selectedCapacities.length > 0 && p.capacity && !selectedCapacities.includes(p.capacity)) {
          return false;
        }
        if (p.pricePerDay > maxPrice) return false;
        if (searchQuery.trim() !== '') {
          const query = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(query);
          const matchCategory = p.category.name.toLowerCase().includes(query);
          const matchDesc = p.description.toLowerCase().includes(query);
          if (!matchName && !matchCategory && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.pricePerDay - b.pricePerDay;
        if (sortBy === 'price-desc') return b.pricePerDay - a.pricePerDay;
        if (sortBy === 'newest') return b.id.localeCompare(a.id);
        return b.ratingCount - a.ratingCount;
      });
  }, [initialProducts, selectedCategory, selectedCapacities, maxPrice, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* 1. Header Banner & Quick Date Selector (Responsive) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-border p-4 sm:p-6 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight">Katalog Peralatan Camping</h1>
            <p className="text-xs text-text-muted mt-1">
              Pilih tanggal sewa untuk mengecek ketersediaan unit fisik peralatan secara akurat.
            </p>
          </div>

          {/* Quick Date Range Picker (Mobile Stack, Desktop Row) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-border">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-border text-xs min-h-[44px]">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span className="font-bold text-text-muted shrink-0">Pickup:</span>
              <input
                type="date"
                value={localStart}
                min={format(new Date(), 'yyyy-MM-dd')}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocalStart(val);
                  if (val >= localEnd) {
                    const nextEnd = format(addDays(parseISO(val), 2), 'yyyy-MM-dd');
                    setLocalEnd(nextEnd);
                    handleApplyDates(val, nextEnd);
                  } else {
                    handleApplyDates(val, localEnd);
                  }
                }}
                className="w-full bg-transparent font-bold text-text text-base md:text-xs outline-none cursor-pointer"
              />
            </div>

            <span className="hidden sm:inline text-xs font-bold text-text-muted text-center">→</span>

            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-border text-xs min-h-[44px]">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span className="font-bold text-text-muted shrink-0">Return:</span>
              <input
                type="date"
                value={localEnd}
                min={localStart}
                onChange={(e) => {
                  setLocalEnd(e.target.value);
                  handleApplyDates(localStart, e.target.value);
                }}
                className="w-full bg-transparent font-bold text-text text-base md:text-xs outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Mobile Filter & Sort Action Bar (PRD Mobile UX Requirement) */}
      <div className="lg:hidden flex items-center gap-2 mb-6">
        <button
          onClick={() => setFilterDrawerOpen(true)}
          className="flex-1 py-3 px-4 min-h-[44px] bg-white border border-border rounded-xl text-xs font-bold text-text flex items-center justify-center gap-2 shadow-sm active:scale-95"
        >
          <Filter className="w-4 h-4 text-primary" />
          <span>Filter & Urutkan</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center ml-1">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <div className="relative shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="py-3 px-3 min-h-[44px] bg-white border border-border rounded-xl text-xs font-bold text-text outline-none shadow-sm cursor-pointer"
          >
            <option value="popular">Terpopuler</option>
            <option value="price-asc">Harga Terendah</option>
            <option value="price-desc">Harga Tertinggi</option>
            <option value="newest">Terbaru</option>
          </select>
        </div>
      </div>

      {/* 3. Main Grid: Desktop Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filter (PRD 6.2) */}
        <aside className="hidden lg:block space-y-6">
          <div className="bg-white rounded-3xl border border-border p-5 shadow-sm space-y-6 sticky top-24">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="font-bold text-sm text-text flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                Filter Peralatan
              </h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="text-[11px] font-semibold text-rose-600 hover:underline min-h-[36px] flex items-center"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Kategori Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Kategori</h4>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors min-h-[40px] ${
                    selectedCategory === '' ? 'bg-primary text-white font-bold' : 'text-text hover:bg-gray-100'
                  }`}
                >
                  <span>Semua Kategori</span>
                  <span>{initialProducts.length}</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors min-h-[40px] ${
                      selectedCategory === cat.slug
                        ? 'bg-primary text-white font-bold'
                        : 'text-text hover:bg-gray-100'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={selectedCategory === cat.slug ? 'text-white' : 'text-text-muted'}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Kapasitas (2/4/6/8 Person) */}
            <div className="pt-4 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Kapasitas</h4>
              <div className="grid grid-cols-2 gap-2">
                {[2, 4, 6, 8].map((cap) => {
                  const checked = selectedCapacities.includes(cap);
                  return (
                    <label
                      key={cap}
                      onClick={() => toggleCapacity(cap)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors min-h-[44px] ${
                        checked
                          ? 'border-primary bg-accent-mint/60 text-primary'
                          : 'border-border bg-gray-50 text-text hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {}}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                      <span>{cap} Person</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Harga per Hari */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Maks. Harga/Hari</h4>
                <span className="text-xs font-black text-primary">{formatCurrency(maxPrice)}</span>
              </div>
              <input
                type="range"
                min={10000}
                max={200000}
                step={5000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer min-h-[36px]"
              />
              <div className="flex justify-between text-[10px] text-text-muted mt-1">
                <span>Rp10.000</span>
                <span>Rp200.000</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Grid Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Desktop Search Bar + Sort */}
          <div className="hidden lg:flex bg-white rounded-2xl border border-border p-3.5 shadow-sm items-center justify-between gap-3">
            <div className="relative w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Cari tenda, sleeping bag, merk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-border rounded-xl text-xs font-medium text-text outline-none focus:border-primary focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-text-muted font-medium">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-gray-50 border border-border rounded-xl font-bold text-text outline-none cursor-pointer focus:border-primary min-h-[40px]"
              >
                <option value="popular">Terpopuler</option>
                <option value="price-asc">Harga Terendah</option>
                <option value="price-desc">Harga Tertinggi</option>
                <option value="newest">Terbaru</option>
              </select>
            </div>
          </div>

          {/* Mobile Search input */}
          <div className="lg:hidden relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Cari nama peralatan camping..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 min-h-[44px] bg-white border border-border rounded-xl text-base md:text-xs font-medium text-text outline-none focus:border-primary shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results Summary */}
          <div className="text-xs font-medium text-text-muted flex items-center justify-between px-1">
            <span>
              Menampilkan <b className="text-text">{filteredProducts.length}</b> peralatan
            </span>
            <span className="text-[11px] truncate max-w-[170px] sm:max-w-none">
              Tanggal: <b>{localStart}</b> s/d <b>{localEnd}</b>
            </span>
          </div>

          {/* Products Grid: 1 column on extra small, 2 columns on tablet/small mobile, 3 on large */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-border p-12 text-center space-y-4">
              <Tent className="w-12 h-12 text-text-muted mx-auto stroke-1" />
              <h3 className="font-bold text-base text-text">Peralatan Tidak Ditemukan</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Tidak ada peralatan camping yang cocok dengan kriteria pencarian atau filter.
              </p>
              <button
                onClick={resetAllFilters}
                className="px-5 py-2.5 min-h-[44px] bg-accent-mint text-primary text-xs font-bold rounded-xl hover:bg-primary hover:text-white transition-colors"
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.availableUnits <= 0;
                const mainImage = p.images[0]?.url || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800';

                return (
                  <div
                    key={p.id}
                    className={`bg-white rounded-2xl sm:rounded-3xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group ${
                      isOutOfStock ? 'opacity-75 grayscale-[20%]' : ''
                    }`}
                  >
                    <div>
                      {/* Image */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                        <img
                          src={mainImage}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Category */}
                        <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[11px] font-bold text-primary shadow-xs">
                          {p.category.name}
                        </div>

                        {/* Availability Pill */}
                        <div className="absolute bottom-2.5 left-2.5">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/90 text-white text-[10px] sm:text-[11px] font-bold backdrop-blur-sm shadow-xs">
                              <AlertCircle className="w-3 h-3" />
                              Penuh / Kosong
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700/90 text-white text-[10px] sm:text-[11px] font-bold backdrop-blur-sm shadow-xs">
                              <CheckCircle2 className="w-3 h-3" />
                              {p.availableUnits} unit siap
                            </span>
                          )}
                        </div>

                        {p.capacity && p.capacity > 0 && (
                          <div className="absolute top-2.5 right-2.5 bg-sidebar-bg/90 backdrop-blur-sm px-2 py-0.5 rounded-lg text-[10px] font-bold text-white">
                            {p.capacity}P
                          </div>
                        )}
                      </div>

                      {/* Info Content */}
                      <div className="p-4">
                        <div className="flex items-center gap-1 text-[11px] text-text-muted mb-1">
                          <div className="flex items-center text-star">
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </div>
                          <span className="font-bold text-text">{p.ratingAvg.toFixed(1)}</span>
                          <span>({p.ratingCount})</span>
                        </div>

                        <h3 className="font-bold text-sm text-text group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {p.name}
                        </h3>

                        <p className="text-xs text-text-muted mt-1.5 line-clamp-2 leading-relaxed hidden sm:block">
                          {p.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Price & Detail Button */}
                    <div className="p-4 pt-0">
                      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-text-muted block">Tarif Sewa:</span>
                          <span className="text-sm sm:text-base font-black text-primary">
                            {formatCurrency(p.pricePerDay)}
                          </span>
                          <span className="text-[10px] text-text-muted">/hr</span>
                        </div>

                        <Link
                          href={`/catalog/${p.slug}`}
                          className={`px-3.5 sm:px-4 py-2 min-h-[44px] inline-flex items-center justify-center rounded-xl text-xs font-bold transition-all active:scale-95 ${
                            isOutOfStock
                              ? 'border border-gray-300 text-gray-500 hover:bg-gray-100'
                              : 'border border-primary text-primary hover:bg-primary hover:text-white'
                          }`}
                        >
                          Detail
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. Mobile Bottom Sheet Drawer for Filters */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setFilterDrawerOpen(false)}
          />

          {/* Drawer content sliding up from bottom */}
          <div className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl p-6 overflow-y-auto flex flex-col justify-between z-10 animate-in slide-in-from-bottom duration-300">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                  <h3 className="font-black text-base text-text">Filter & Kategori</h3>
                </div>
                <button
                  onClick={() => setFilterDrawerOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-text-muted hover:text-text hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Kategori */}
              <div className="py-4 border-b border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Kategori</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`p-2.5 rounded-xl text-xs font-bold text-left min-h-[44px] transition-all flex items-center justify-between ${
                      selectedCategory === '' ? 'bg-primary text-white' : 'bg-gray-50 text-text border border-border'
                    }`}
                  >
                    <span>Semua Kategori</span>
                    {selectedCategory === '' && <Check className="w-4 h-4" />}
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`p-2.5 rounded-xl text-xs font-bold text-left min-h-[44px] transition-all flex items-center justify-between ${
                        selectedCategory === cat.slug
                          ? 'bg-primary text-white'
                          : 'bg-gray-50 text-text border border-border'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {selectedCategory === cat.slug && <Check className="w-4 h-4 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kapasitas */}
              <div className="py-4 border-b border-border">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">Kapasitas Orang</h4>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 4, 6, 8].map((cap) => {
                    const checked = selectedCapacities.includes(cap);
                    return (
                      <button
                        key={cap}
                        type="button"
                        onClick={() => toggleCapacity(cap)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold border min-h-[44px] transition-all flex items-center justify-center ${
                          checked
                            ? 'bg-primary text-white border-primary'
                            : 'bg-gray-50 text-text border-border'
                        }`}
                      >
                        {cap}P
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider Harga */}
              <div className="py-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Maks. Tarif Sewa</h4>
                  <span className="text-xs font-black text-primary">{formatCurrency(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min={10000}
                  max={200000}
                  step={5000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer min-h-[44px]"
                />
              </div>
            </div>

            {/* Bottom Actions inside Sheet */}
            <div className="pt-4 border-t border-border flex items-center gap-3">
              <button
                type="button"
                onClick={resetAllFilters}
                className="flex-1 py-3 min-h-[44px] bg-gray-100 hover:bg-gray-200 text-text font-bold text-xs rounded-xl transition-colors"
              >
                Reset Filter
              </button>
              <button
                type="button"
                onClick={() => setFilterDrawerOpen(false)}
                className="flex-1 py-3 min-h-[44px] bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Terapkan ({filteredProducts.length} Hasil)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
