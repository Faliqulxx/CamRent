'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  Calendar,
  ArrowRight,
  Plus,
  ShieldCheck,
  Store,
  AlertCircle,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { addDays, format, parseISO } from 'date-fns';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    startDate,
    endDate,
    rentalDays,
    subtotal,
    totalItemsCount,
    updateQuantity,
    removeFromCart,
    setDateRange,
  } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28 md:pb-10">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight flex items-center gap-2.5">
          <ShoppingBag className="w-6 sm:w-7 h-6 sm:h-7 text-primary" />
          Keranjang Sewa Peralatan
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Periksa kembali tanggal sewa dan jumlah unit peralatan camping sebelum lanjut ke checkout.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border p-12 sm:p-16 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-accent-mint flex items-center justify-center text-primary mx-auto">
            <ShoppingBag className="w-8 h-8 stroke-1" />
          </div>
          <h2 className="text-lg font-bold text-text">Keranjang Sewa Masih Kosong</h2>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            Anda belum menambahkan peralatan camping ke keranjang sewa. Temukan tenda, sleeping bag, atau alat masak terbaik di katalog.
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 min-h-[44px] bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
          >
            <span>Jelajahi Katalog Peralatan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column: Date Range Picker & Item List */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            {/* Date Range Selector Box */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-border p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Rentang Tanggal Sewa
                </h3>
                <span className="text-xs font-extrabold text-primary bg-accent-mint px-2.5 py-1 rounded-lg">
                  {rentalDays} Hari Sewa
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-border min-h-[44px]">
                  <label className="block text-[11px] font-bold text-text-muted mb-1">
                    Tanggal Pickup (Ambil di Toko):
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val >= endDate) {
                        const nextEnd = format(addDays(parseISO(val), 2), 'yyyy-MM-dd');
                        setDateRange(val, nextEnd);
                      } else {
                        setDateRange(val, endDate);
                      }
                    }}
                    className="w-full bg-transparent font-bold text-text outline-none cursor-pointer text-base md:text-xs"
                  />
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-border min-h-[44px]">
                  <label className="block text-[11px] font-bold text-text-muted mb-1">
                    Tanggal Return (Kembalikan ke Toko):
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setDateRange(startDate, e.target.value)}
                    className="w-full bg-transparent font-bold text-text outline-none cursor-pointer text-base md:text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-border overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border bg-gray-50 flex items-center justify-between">
                <span className="text-xs font-bold text-text">Daftar Peralatan ({totalItemsCount} Unit)</span>
                <Link
                  href="/catalog"
                  className="text-xs font-bold text-primary hover:text-primary-dark inline-flex items-center gap-1 min-h-[36px] py-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah item</span>
                </Link>
              </div>

              <div className="divide-y divide-border">
                {items.map((item) => {
                  const itemSubtotal = item.pricePerDay * item.quantity * rentalDays;

                  return (
                    <div key={item.productId} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-3.5 flex-1 w-full sm:w-auto">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-xl object-cover border border-border shrink-0"
                        />
                        <div className="overflow-hidden">
                          <Link
                            href={`/catalog/${item.slug}`}
                            className="font-bold text-sm text-text hover:text-primary transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <span className="text-xs text-text-muted block mt-0.5">
                            {formatCurrency(item.pricePerDay)} × {item.quantity} unit × {rentalDays} hari
                          </span>
                          <span className="text-xs font-black text-primary block sm:hidden mt-1">
                            Subtotal: {formatCurrency(itemSubtotal)}
                          </span>
                        </div>
                      </div>

                      {/* Stepper + Subtotal + Delete with 44px Touch Targets */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                        {/* Stepper */}
                        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-2xl border border-border">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl bg-white border border-border flex items-center justify-center font-bold text-text hover:bg-gray-100 text-sm active:scale-95 transition-transform"
                            aria-label="Kurangi"
                          >
                            -
                          </button>
                          <span className="text-xs font-black text-text w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl bg-white border border-border flex items-center justify-center font-bold text-text hover:bg-gray-100 text-sm active:scale-95 transition-transform"
                            aria-label="Tambah"
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal (Desktop) */}
                        <div className="hidden sm:block text-right min-w-[90px]">
                          <span className="text-sm font-black text-text block">
                            {formatCurrency(itemSubtotal)}
                          </span>
                        </div>

                        {/* Remove button (44px touch) */}
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors active:scale-95"
                          title="Hapus dari keranjang"
                          aria-label="Hapus Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notice Strip */}
            <div className="p-4 rounded-2xl bg-accent-mint/50 border border-primary/20 flex items-start gap-3 text-xs text-text-muted">
              <Store className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div>
                <b className="text-text">Pengambilan & Pengembalian:</b> Hanya dilakukan di Toko CampRent Bandung.
                Jaminan identitas fisik (KTP/SIM/KTM) diserahkan saat serah terima barang tanpa deposit uang tunai.
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary (Desktop Sticky, Mobile Bottom Bar) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-border p-6 shadow-sm space-y-5 sticky top-24">
              <h3 className="font-black text-base text-text pb-4 border-b border-border">
                Ringkasan Pemesanan
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-text-muted">
                  <span>Total Durasi Sewa:</span>
                  <span className="font-bold text-text">{rentalDays} Hari</span>
                </div>

                <div className="flex items-center justify-between text-text-muted">
                  <span>Jumlah Unit Peralatan:</span>
                  <span className="font-bold text-text">{totalItemsCount} Unit</span>
                </div>

                <div className="flex items-center justify-between text-text-muted">
                  <span>Deposit Uang Muka:</span>
                  <span className="font-bold text-emerald-600">Rp0 (Tidak Ada Deposit)</span>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <span className="text-sm font-bold text-text">Total Pembayaran Sewa:</span>
                  <span className="text-xl font-black text-primary">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
              </div>

              {/* Checkout Button (Desktop) */}
              <button
                onClick={() => router.push('/checkout')}
                className="hidden md:flex w-full py-3.5 min-h-[48px] bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-primary/25 items-center justify-center gap-2 active:scale-95"
              >
                <span>Lanjut ke Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-text-muted text-center pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Ketersediaan dijamin & terkunci saat pemesanan</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Action Bar for Cart */}
      {items.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border p-3.5 shadow-2xl flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-text-muted block">Total Sewa:</span>
            <span className="text-base font-black text-primary block leading-tight">
              {formatCurrency(subtotal)}
            </span>
            <span className="text-[10px] text-text-muted block">
              {totalItemsCount} Unit • {rentalDays} Hari
            </span>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className="px-5 py-3 min-h-[48px] bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 active:scale-95 shrink-0"
          >
            <span>Lanjut Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
