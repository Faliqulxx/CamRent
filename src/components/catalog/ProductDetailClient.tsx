'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Star,
  Users,
  Weight,
  Maximize2,
  Calendar,
  CheckCircle2,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  PackageCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  Check,
} from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  addDays,
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isBefore,
  startOfDay,
  differenceInDays,
} from 'date-fns';
import { id } from 'date-fns/locale';

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    capacity: number | null;
    dimension: string | null;
    weightKg: number | null;
    pricePerDay: number;
    cleaningDays: number;
    includedItems: string;
    ratingAvg: number;
    ratingCount: number;
    category: {
      name: string;
      slug: string;
    };
    images: { url: string }[];
    totalUnits: number;
  };
  dailyBookings: { date: string; bookedCount: number; maintenanceCount: number }[];
}

export default function ProductDetailClient({ product, dailyBookings }: ProductDetailProps) {
  const router = useRouter();
  const { startDate, endDate, setDateRange, addToCart } = useCart();
  const { user, openAuthModal } = useAuth();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedStartDate, setSelectedStartDate] = useState(startDate);
  const [selectedEndDate, setSelectedEndDate] = useState(endDate);
  const [quantity, setQuantity] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [addedToast, setAddedToast] = useState(false);

  const includedItemsList: string[] = React.useMemo(() => {
    try {
      return JSON.parse(product.includedItems);
    } catch {
      return [];
    }
  }, [product.includedItems]);

  const images = product.images.length > 0
    ? product.images.map((img) => img.url)
    : ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800'];

  const daysDuration = Math.max(
    1,
    differenceInDays(new Date(selectedEndDate), new Date(selectedStartDate)) || 1
  );

  const subtotalEstimate = product.pricePerDay * quantity * daysDuration;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const today = startOfDay(new Date());

  const handleAddToCart = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setDateRange(selectedStartDate, selectedEndDate);
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      pricePerDay: product.pricePerDay,
      image: images[0],
      quantity,
      maxAvailable: product.totalUnits,
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-28 md:pb-8">
      {/* 1. Breadcrumb & Back Link */}
      <div className="flex items-center gap-2 text-xs font-semibold text-text-muted">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 hover:text-primary transition-colors bg-white px-3 py-2 min-h-[44px] rounded-xl border border-border shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke katalog</span>
        </Link>
        <span>/</span>
        <span className="text-text-muted hidden sm:inline">{product.category.name}</span>
        <span className="hidden sm:inline">/</span>
        <span className="text-text truncate max-w-[150px] sm:max-w-xs">{product.name}</span>
      </div>

      {/* Toast Alert */}
      {addedToast && (
        <div className="fixed top-20 right-4 sm:right-8 left-4 sm:left-auto z-50 bg-sidebar-bg text-white px-4 py-3 sm:px-5 sm:py-4 rounded-2xl shadow-2xl border border-primary flex items-center justify-between sm:justify-start gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Berhasil Masuk Keranjang!</h4>
              <p className="text-[11px] text-gray-300">
                {quantity}x {product.name} siap disewa.
              </p>
            </div>
          </div>
          <Link
            href="/cart"
            className="px-3.5 py-2 min-h-[44px] inline-flex items-center justify-center bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-colors shrink-0"
          >
            Lihat Keranjang
          </Link>
        </div>
      )}

      {/* 2. Top Section: Gallery + Product Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery Component */}
        <div className="space-y-3 sm:space-y-4">
          <div className="relative aspect-[4/3] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-border shadow-sm">
            <img
              src={images[selectedImageIdx]}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-xl text-xs font-bold text-primary shadow-xs">
              {product.category.name}
            </div>
          </div>

          {/* Thumbnails (Horizontal Scrollable on Mobile) */}
          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all min-h-[44px] min-w-[44px] ${
                    selectedImageIdx === idx ? 'border-primary ring-2 ring-primary/20' : 'border-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Action Panel */}
        <div className="space-y-6 flex flex-col justify-between">
          <div>
            {/* Rating */}
            <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
              <div className="flex items-center text-star">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="font-bold text-text text-sm">{product.ratingAvg.toFixed(1)}</span>
              <span>({product.ratingCount} ulasan)</span>
              <span className="text-emerald-600 font-bold ml-1.5">✓ Terverifikasi</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Price Banner */}
            <div className="mt-4 p-4 rounded-2xl bg-accent-mint/50 border border-primary/20 flex items-center justify-between">
              <div>
                <span className="text-xs text-text-muted block">Tarif sewa per hari:</span>
                <div className="text-2xl font-black text-primary">
                  {formatCurrency(product.pricePerDay)}
                  <span className="text-xs font-normal text-text-muted"> /hari</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-text-muted block">Total unit fisik:</span>
                <span className="text-sm font-bold text-text">{product.totalUnits} unit</span>
              </div>
            </div>

            {/* Badges Info */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
              {product.capacity && product.capacity > 0 && (
                <div className="p-3 bg-white rounded-xl border border-border flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted block">Kapasitas</span>
                    <span className="text-xs font-bold text-text">{product.capacity}P</span>
                  </div>
                </div>
              )}

              {product.weightKg && (
                <div className="p-3 bg-white rounded-xl border border-border flex items-center gap-2">
                  <Weight className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted block">Bobot</span>
                    <span className="text-xs font-bold text-text">{product.weightKg} kg</span>
                  </div>
                </div>
              )}

              {product.dimension && (
                <div className="p-3 bg-white rounded-xl border border-border flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <span className="text-[10px] text-text-muted block">Dimensi</span>
                    <span className="text-xs font-bold text-text truncate max-w-[80px] sm:max-w-[100px]">{product.dimension}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Deskripsi Produk</h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">{product.description}</p>
            </div>

            {/* Included Items Checklist */}
            {includedItemsList.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2.5 flex items-center gap-1.5">
                  <PackageCheck className="w-4 h-4 text-primary" />
                  Kelengkapan / Fasilitas Unit:
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {includedItemsList.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-text bg-white p-2.5 rounded-xl border border-border">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop & Inline Rent Form */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-border p-5 shadow-sm space-y-4 mt-6">
            <h3 className="text-sm font-bold text-text flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Pilih Tanggal & Jumlah Sewa
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-border min-h-[44px]">
                <label className="block text-[11px] font-bold text-text-muted mb-1">Mulai Sewa:</label>
                <input
                  type="date"
                  value={selectedStartDate}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => {
                    setSelectedStartDate(e.target.value);
                    if (e.target.value >= selectedEndDate) {
                      setSelectedEndDate(format(addDays(new Date(e.target.value), 2), 'yyyy-MM-dd'));
                    }
                  }}
                  className="w-full bg-transparent font-bold text-text text-base md:text-xs outline-none cursor-pointer"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-border min-h-[44px]">
                <label className="block text-[11px] font-bold text-text-muted mb-1">Kembali:</label>
                <input
                  type="date"
                  value={selectedEndDate}
                  min={selectedStartDate}
                  onChange={(e) => setSelectedEndDate(e.target.value)}
                  className="w-full bg-transparent font-bold text-text text-base md:text-xs outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Quantity Stepper with 44px Touch Targets */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs font-bold text-text block">Jumlah Unit</span>
                <span className="text-[11px] text-text-muted">Durasi: {daysDuration} hari sewa</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-2xl border border-border">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl bg-white border border-border flex items-center justify-center font-bold text-text hover:bg-gray-100 text-base active:scale-95 transition-transform"
                  aria-label="Kurangi Jumlah"
                >
                  -
                </button>
                <span className="text-sm font-black text-text w-6 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.totalUnits, quantity + 1))}
                  className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-xl bg-white border border-border flex items-center justify-center font-bold text-text hover:bg-gray-100 text-base active:scale-95 transition-transform"
                  aria-label="Tambah Jumlah"
                >
                  +
                </button>
              </div>
            </div>

            {/* Desktop Add to Cart Button (Hidden on Mobile, handled by Sticky Bottom Bar) */}
            <div className="hidden md:flex pt-4 border-t border-border items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-text-muted block">Estimasi Subtotal:</span>
                <span className="text-lg font-black text-primary">{formatCurrency(subtotalEstimate)}</span>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="px-6 py-3.5 min-h-[44px] bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-primary/20 flex items-center gap-2 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Tambah ke Keranjang</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Panel Cek Ketersediaan: Kalender Bulanan (Responsive No Overflow) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-border p-4 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-text flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Kalender Ketersediaan Bulanan
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Pantau jadwal sewa dan maintenance. Masa pembersihan: {product.cleaningDays} hari setelah rental selesai.
            </p>
          </div>

          {/* Month Navigation with 44px touch targets */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-border hover:bg-gray-100 transition-colors"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="w-5 h-5 text-text" />
            </button>
            <span className="text-xs sm:text-sm font-bold text-text min-w-[120px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: id })}
            </span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-border hover:bg-gray-100 transition-colors"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="w-5 h-5 text-text" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-bold text-text-muted uppercase border-b border-border pb-2">
          <span>Min</span>
          <span>Sen</span>
          <span>Sel</span>
          <span>Rab</span>
          <span>Kam</span>
          <span>Jum</span>
          <span>Sab</span>
        </div>

        {/* Calendar Grid: Fits cleanly on mobile */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {daysInMonth.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isPast = isBefore(day, today);
            const booking = dailyBookings.find((b) => b.date === dateStr);
            const bookedCount = booking ? booking.bookedCount : 0;
            const maintCount = booking ? booking.maintenanceCount : 0;
            const availableCount = Math.max(0, product.totalUnits - bookedCount - maintCount);

            let statusBadge = {
              bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
              label: `${availableCount} Siap`,
            };

            if (isPast) {
              statusBadge = {
                bg: 'bg-gray-50 border-gray-200 text-gray-400',
                label: 'Lewat',
              };
            } else if (availableCount === 0) {
              statusBadge = {
                bg: 'bg-rose-50 border-rose-200 text-rose-700',
                label: 'Penuh',
              };
            } else if (maintCount > 0) {
              statusBadge = {
                bg: 'bg-amber-50 border-amber-200 text-amber-700',
                label: `${availableCount} Siap`,
              };
            }

            return (
              <div
                key={dateStr}
                className={cn(
                  'min-h-[56px] sm:min-h-[70px] p-1.5 sm:p-2 rounded-xl border transition-all flex flex-col justify-between text-left',
                  statusBadge.bg,
                  !isPast && 'hover:shadow-xs cursor-pointer active:scale-95'
                )}
                onClick={() => {
                  if (!isPast) {
                    setSelectedStartDate(dateStr);
                    setSelectedEndDate(format(addDays(day, 2), 'yyyy-MM-dd'));
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-black">{format(day, 'd')}</span>
                </div>

                <div className="text-[9px] sm:text-[10px] font-bold truncate">
                  {statusBadge.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legenda Warna */}
        <div className="pt-3 border-t border-border flex flex-wrap items-center gap-4 text-[11px] text-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500" />
            <span className="font-semibold text-text">Tersedia</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-rose-500" />
            <span className="font-semibold text-text">Penuh</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-amber-500" />
            <span className="font-semibold text-text">Maintenance</span>
          </div>
        </div>
      </div>

      {/* 4. Mobile Sticky Bottom Action Bar (PRD UX Requirement) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border p-3.5 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-text-muted block">Estimasi Subtotal:</span>
          <span className="text-base font-black text-primary block leading-tight">
            {formatCurrency(subtotalEstimate)}
          </span>
          <span className="text-[10px] text-text-muted block">
            {quantity} Unit × {daysDuration} Hari
          </span>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="px-5 py-3 min-h-[48px] bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Tambah Keranjang</span>
        </button>
      </div>
    </div>
  );
}
