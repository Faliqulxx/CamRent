'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Shield,
  ArrowRight,
  X,
  CreditCard,
  Send,
  User,
  Bell,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadgeStyle } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export interface MyRentalItem {
  id: string;
  code: string;
  startDate: string;
  endDate: string;
  status: string;
  subtotal: number;
  extraFees: number;
  total: number;
  paymentType?: string;
  dpAmount?: number;
  remainingAmount?: number;
  isPaidOff?: boolean;
  paymentMethod?: string;
  notes: string | null;
  createdAt: string;
  items: {
    id: string;
    productName: string;
    quantity: number;
    pricePerDay: number;
    days: number;
    subtotal: number;
    image: string;
    assignedUnitCodes: string[];
  }[];
  collateral: {
    type: string;
    holderName: string;
    status: string;
  } | null;
  fees: {
    id: string;
    type: string;
    amount: number;
    notes: string | null;
  }[];
}

interface MyRentalsClientProps {
  rentals: MyRentalItem[];
  userName: string;
}

export default function MyRentalsClient({ rentals: initialRentals, userName }: MyRentalsClientProps) {
  const { logout } = useAuth();
  const [rentals, setRentals] = useState<MyRentalItem[]>(initialRentals);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [selectedRental, setSelectedRental] = useState<MyRentalItem | null>(null);

  const filteredRentals = rentals.filter((r) => {
    if (activeTab === 'ACTIVE') {
      return ['WAITING_PAYMENT', 'CONFIRMED', 'READY_FOR_PICKUP', 'RENTED', 'RETURNING', 'OVERDUE'].includes(r.status);
    }
    if (activeTab === 'COMPLETED') {
      return r.status === 'COMPLETED';
    }
    if (activeTab === 'CANCELLED') {
      return r.status === 'CANCELLED';
    }
    return true;
  });

  const handleCancelRental = async (rentalId: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) return;
    try {
      const res = await fetch(`/api/rentals/${rentalId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      if (res.ok) {
        setRentals((prev) =>
          prev.map((r) => (r.id === rentalId ? { ...r, status: 'CANCELLED' } : r))
        );
        if (selectedRental?.id === rentalId) {
          setSelectedRental((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStepperIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'WAITING_PAYMENT':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'READY_FOR_PICKUP':
        return 2;
      case 'RENTED':
        return 3;
      case 'RETURNING':
        return 4;
      case 'COMPLETED':
        return 5;
      default:
        return 0;
    }
  };

  const steps = [
    { title: 'Pemesanan Dibuat', desc: 'Menunggu transfer bank pelanggan' },
    { title: 'Pembayaran Terverifikasi', desc: 'Dana sewa telah dicek staf toko' },
    { title: 'Siap Pickup di Toko', desc: 'Peralatan siap diambil di toko' },
    { title: 'Sedang Disewa (Rented)', desc: 'Jaminan fisik dititipkan di toko' },
    { title: 'Pengembalian & Cek Fisik', desc: 'Inspeksi kondisi barang & denda' },
    { title: 'Rental Selesai', desc: 'Jaminan identitas telah dikembalikan' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Mobile Horizontal Scrollable Account Bar (PRD UX Requirement) */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-2xl border border-border shrink-0 min-h-[44px]">
          <div className="w-8 h-8 rounded-xl bg-accent-mint flex items-center justify-center text-primary font-black text-xs">
            {userName.charAt(0)}
          </div>
          <span className="font-bold text-xs text-text">{userName.split(' ')[0]}</span>
        </div>

        <Link
          href="/catalog"
          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 rounded-2xl border border-border text-xs font-bold text-text-muted shrink-0 min-h-[44px]"
        >
          <Calendar className="w-4 h-4 text-primary" />
          <span>Sewa Baru</span>
        </Link>

        <button
          onClick={() => logout()}
          className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 rounded-2xl border border-rose-200 text-xs font-bold text-rose-600 shrink-0 min-h-[44px]"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* 2. Desktop Customer Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl border border-border p-5 shadow-sm space-y-4 sticky top-24">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <div className="w-12 h-12 rounded-2xl bg-accent-mint flex items-center justify-center text-primary font-black text-lg">
                {userName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-sm text-text truncate">{userName}</h3>
                <span className="text-[11px] text-text-muted block">Akun Pelanggan</span>
              </div>
            </div>

            <nav className="space-y-1.5 text-xs font-semibold">
              <Link
                href="/account/rentals"
                className="flex items-center gap-2.5 px-3.5 py-3 min-h-[44px] rounded-xl bg-accent-mint text-primary font-bold"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>My Rental ({rentals.length})</span>
              </Link>

              <Link
                href="/catalog"
                className="flex items-center gap-2.5 px-3.5 py-3 min-h-[44px] rounded-xl text-text-muted hover:text-text hover:bg-gray-100 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Sewa Baru di Katalog</span>
              </Link>

              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-2.5 px-3.5 py-3 min-h-[44px] rounded-xl text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun (Logout)</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* 3. Main Area: Rentals List & Tabs */}
        <main className="lg:col-span-3 space-y-5">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-border p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight">Riwayat & Status Rental</h1>
              <p className="text-xs text-text-muted mt-0.5">
                Pantau jadwal sewa, status pembayaran, dan unit fisik peralatan Anda.
              </p>
            </div>

            {/* Filter Tabs: Touch friendly 44px min-h */}
            <div className="flex items-center bg-gray-100 p-1 rounded-2xl text-xs font-bold overflow-x-auto no-scrollbar">
              {[
                { id: 'ALL', label: 'Semua' },
                { id: 'ACTIVE', label: 'Aktif' },
                { id: 'COMPLETED', label: 'Selesai' },
                { id: 'CANCELLED', label: 'Dibatalkan' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 min-h-[40px] rounded-xl transition-all whitespace-nowrap active:scale-95 ${
                    activeTab === tab.id ? 'bg-white text-text shadow-xs' : 'text-text-muted hover:text-text'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rentals List */}
          {filteredRentals.length === 0 ? (
            <div className="bg-white rounded-3xl border border-border p-12 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-text-muted mx-auto stroke-1" />
              <h3 className="font-bold text-sm text-text">Belum Ada Rental</h3>
              <p className="text-xs text-text-muted">Tidak ada data rental pada tab ini.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRentals.map((rental) => {
                const badge = getStatusBadgeStyle(rental.status);
                const itemCount = rental.items.reduce((acc, i) => acc + i.quantity, 0);

                return (
                  <div
                    key={rental.id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-border p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2">
                        <span className="font-black text-sm text-primary">{rental.code}</span>
                        <span className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {formatDate(rental.startDate)} – {formatDate(rental.endDate)}
                        </span>
                        <span>•</span>
                        <span>{itemCount} Unit</span>
                      </div>

                      <div className="text-xs text-text font-medium truncate max-w-lg">
                        {rental.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                      <div>
                        <span className="text-[10px] text-text-muted block">Total Biaya:</span>
                        <span className="text-base font-black text-text">{formatCurrency(rental.total)}</span>
                      </div>

                      <button
                        onClick={() => setSelectedRental(rental)}
                        className="px-4 py-2.5 min-h-[44px] bg-accent-mint hover:bg-primary hover:text-white text-primary text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95 inline-flex items-center gap-1.5"
                      >
                        <span>Lihat Detail</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* 4. Detail Rental Modal Dialog (Responsive Mobile Sheet / Desktop Center) */}
      {selectedRental && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full border border-border shadow-2xl p-5 sm:p-8 space-y-6 animate-in slide-in-from-bottom sm:zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <span className="text-xs font-bold text-text-muted uppercase">Detail Pemesanan Rental</span>
                <h2 className="text-xl font-black text-primary mt-0.5">{selectedRental.code}</h2>
              </div>
              <button
                onClick={() => setSelectedRental(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-text-muted hover:text-text hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Status (PRD Requirement: Desktop Horizontal, Mobile Vertical Stepper) */}
            {selectedRental.status !== 'CANCELLED' && (
              <div className="bg-gray-50 rounded-2xl p-4 border border-border space-y-3">
                <span className="text-[11px] font-bold text-text-muted uppercase block">
                  Progress Siklus Sewa
                </span>

                {/* Desktop Stepper (Horizontal) */}
                <div className="hidden md:grid grid-cols-6 gap-1 text-center">
                  {steps.map((step, idx) => {
                    const currentIdx = getStepperIndex(selectedRental.status);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={idx} className="flex flex-col items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                            isCurrent
                              ? 'bg-primary text-white ring-4 ring-primary/20'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {isPassed ? '✓' : idx + 1}
                        </div>
                        <span className={`text-[9px] font-semibold mt-1 leading-tight ${isCurrent ? 'text-primary font-bold' : 'text-text-muted'}`}>
                          {step.title}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Stepper (Vertical Stepper for Clean Mobile UX) */}
                <div className="md:hidden space-y-3">
                  {steps.map((step, idx) => {
                    const currentIdx = getStepperIndex(selectedRental.status);
                    const isPassed = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;

                    return (
                      <div key={idx} className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                            isCurrent
                              ? 'bg-primary text-white ring-4 ring-primary/20'
                              : isPassed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-200 text-gray-400'
                          }`}
                        >
                          {isPassed ? '✓' : idx + 1}
                        </div>
                        <div>
                          <span className={`text-xs font-bold block ${isCurrent ? 'text-primary' : isPassed ? 'text-text' : 'text-text-muted'}`}>
                            {step.title}
                          </span>
                          <span className="text-[10px] text-text-muted block leading-tight">
                            {step.desc}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items List with assigned units */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                Peralatan yang Disewa
              </h4>
              <div className="divide-y divide-border border border-border rounded-2xl overflow-hidden">
                {selectedRental.items.map((item) => (
                  <div key={item.id} className="p-3.5 bg-white flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.productName} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div>
                        <span className="font-bold text-text block">{item.productName}</span>
                        <span className="text-[11px] text-text-muted">
                          {item.quantity} unit × {formatCurrency(item.pricePerDay)} × {item.days} hari
                        </span>
                        {item.assignedUnitCodes.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] text-text-muted">Unit:</span>
                            {item.assignedUnitCodes.map((code) => (
                              <span key={code} className="text-[9px] font-bold bg-accent-mint text-primary px-1.5 py-0.5 rounded">
                                {code}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="font-black text-text shrink-0">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Jaminan & Biaya */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-gray-50 rounded-2xl border border-border space-y-1">
                <span className="text-text-muted block font-semibold">Jaminan Identitas Fisik:</span>
                <span className="font-bold text-text text-sm">
                  {selectedRental.collateral?.type || 'KTP'} Asli ({selectedRental.collateral?.holderName})
                </span>
                <span className="text-[11px] text-primary font-semibold block">
                  Status: {selectedRental.collateral?.status === 'HELD' ? 'Ditahan di Toko' : selectedRental.collateral?.status === 'RETURNED' ? 'Dikembalikan' : 'Diserahkan saat Pickup'}
                </span>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-2xl border border-border space-y-1">
                <div className="flex justify-between">
                  <span className="text-text-muted">Total Nilai Sewa:</span>
                  <span className="font-bold">{formatCurrency(selectedRental.subtotal)}</span>
                </div>
                {selectedRental.paymentType === 'DP' ? (
                  <>
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Uang Muka (DP):</span>
                      <span>{formatCurrency(selectedRental.dpAmount || 0)}</span>
                    </div>
                    <div className="flex justify-between text-amber-800 font-bold">
                      <span>Sisa di Kasir Toko:</span>
                      <span>{selectedRental.remainingAmount && selectedRental.remainingAmount > 0 ? formatCurrency(selectedRental.remainingAmount) : 'Rp0 (Lunas)'}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-text-muted">
                    <span>Skema Pembayaran:</span>
                    <span className="font-semibold text-text">Bayar Lunas (100%)</span>
                  </div>
                )}
                <div className="flex justify-between text-text-muted pt-1 border-t border-border/60">
                  <span>Metode Transfer:</span>
                  <span className="font-bold text-text">
                    {selectedRental.paymentMethod === 'DANA'
                      ? '💙 E-Wallet DANA'
                      : selectedRental.paymentMethod === 'GOPAY'
                      ? '💚 E-Wallet GoPay'
                      : '🏦 Transfer Bank (BCA)'}
                  </span>
                </div>
                {selectedRental.extraFees > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Denda / Kerusakan:</span>
                    <span>+{formatCurrency(selectedRental.extraFees)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border font-black text-sm text-primary">
                  <span>Total Tagihan:</span>
                  <span>{formatCurrency(selectedRental.total)}</span>
                </div>
              </div>
            </div>

            {/* Actions: Cancel if not yet confirmed */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              {['WAITING_PAYMENT', 'PENDING'].includes(selectedRental.status) ? (
                <button
                  onClick={() => handleCancelRental(selectedRental.id)}
                  className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
                >
                  Batalkan Pemesanan
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={() => setSelectedRental(null)}
                className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] bg-gray-100 hover:bg-gray-200 text-text font-bold text-xs rounded-xl"
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
