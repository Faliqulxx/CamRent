'use client';

import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  X,
  CreditCard,
  AlertTriangle,
  RotateCcw,
  CheckSquare,
  Shield,
  Plus,
  Eye,
  Store,
  Clock,
  Camera,
  ChevronRight,
  Phone,
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadgeStyle } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';

export interface AdminRentalData {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string;
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
    rentalItemId: string;
    productId: string;
    productName: string;
    quantity: number;
    pricePerDay: number;
    days: number;
    cleaningDays: number;
    assignedUnits: { unitId: string; code: string }[];
    availableUnitsList: { id: string; code: string; status: string }[];
  }[];
  collateral: {
    type: string;
    holderName: string;
    status: string;
  } | null;
  payment: {
    status: string;
    amount: number;
    method: string;
  } | null;
  fees: {
    type: string;
    amount: number;
    notes: string | null;
  }[];
}

interface RentalsManagerProps {
  initialRentals: AdminRentalData[];
  selectedIdFromUrl?: string;
}

export default function RentalsManager({ initialRentals, selectedIdFromUrl }: RentalsManagerProps) {
  const [rentals, setRentals] = useState<AdminRentalData[]>(initialRentals);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const initialSelected = selectedIdFromUrl
    ? rentals.find((r) => r.id === selectedIdFromUrl) || null
    : null;
  const [activeModalRental, setActiveModalRental] = useState<AdminRentalData | null>(initialSelected);
  const [modalMode, setModalMode] = useState<'DETAIL' | 'PICKUP' | 'RETURN'>('DETAIL');

  // Pickup flow state
  const [assignedUnitsState, setAssignedUnitsState] = useState<Record<string, string>>({});
  const [pickupConditions, setPickupConditions] = useState<Record<string, string>>({});
  const [collateralReceivedChecked, setCollateralReceivedChecked] = useState(false);
  const [remainingSettledChecked, setRemainingSettledChecked] = useState(false);
  const [settlementMethod, setSettlementMethod] = useState<'CASH' | 'QRIS' | 'EDC'>('CASH');

  // Return flow state
  const [returnConditions, setReturnConditions] = useState<Record<string, string>>({});
  const [cleaningFee, setCleaningFee] = useState<number>(0);
  const [damageFee, setDamageFee] = useState<number>(0);
  const [lateFee, setLateFee] = useState<number>(0);
  const [collateralReturnedChecked, setCollateralReturnedChecked] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  // Filter rentals
  const filteredRentals = rentals.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchCode = r.code.toLowerCase().includes(q);
      const matchName = r.customerName.toLowerCase().includes(q);
      const matchPhone = r.customerPhone.includes(q);
      if (!matchCode && !matchName && !matchPhone) return false;
    }
    return true;
  });

  const openPickupModal = (r: AdminRentalData) => {
    setActiveModalRental(r);
    setModalMode('PICKUP');

    const initialUnits: Record<string, string> = {};
    const initialConds: Record<string, string> = {};
    r.items.forEach((item) => {
      if (item.assignedUnits.length > 0) {
        initialUnits[item.rentalItemId] = item.assignedUnits[0].unitId;
      } else if (item.availableUnitsList.length > 0) {
        initialUnits[item.rentalItemId] = item.availableUnitsList[0].id;
      }
      initialConds[item.rentalItemId] = 'GOOD';
    });
    setAssignedUnitsState(initialUnits);
    setPickupConditions(initialConds);
    setCollateralReceivedChecked(r.collateral?.status === 'HELD');
    setRemainingSettledChecked(r.remainingAmount === 0 || r.isPaidOff === true);
    setSettlementMethod('CASH');
  };

  const openReturnModal = (r: AdminRentalData) => {
    setActiveModalRental(r);
    setModalMode('RETURN');

    const initialConds: Record<string, string> = {};
    r.items.forEach((item) => {
      item.assignedUnits.forEach((u) => {
        initialConds[u.unitId] = 'GOOD';
      });
    });
    setReturnConditions(initialConds);

    const today = new Date();
    const end = parseISO(r.endDate);
    const daysLate = Math.max(0, differenceInDays(today, end));
    setLateFee(daysLate > 0 ? daysLate * 50000 : 0);
    setCleaningFee(0);
    setDamageFee(0);
    setCollateralReturnedChecked(false);
  };

  const handleConfirmPayment = async (rentalId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/rentals/${rentalId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'READY_FOR_PICKUP' }),
      });
      if (res.ok) {
        setRentals((prev) =>
          prev.map((r) => (r.id === rentalId ? { ...r, status: 'READY_FOR_PICKUP' } : r))
        );
        if (activeModalRental?.id === rentalId) {
          setActiveModalRental((prev) => prev ? { ...prev, status: 'READY_FOR_PICKUP' } : null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitPickup = async () => {
    if (!activeModalRental) return;
    if (!collateralReceivedChecked) {
      alert('Pencatatan jaminan fisik asli wajib dicentang diterima sebelum konfirmasi pickup.');
      return;
    }

    if (activeModalRental.paymentType === 'DP' && activeModalRental.remainingAmount > 0 && !remainingSettledChecked) {
      alert(`Pesanan ini memiliki sisa pelunasan DP sebesar ${formatCurrency(activeModalRental.remainingAmount)}. Konfirmasi penerimaan pelunasan wajib dicentang.`);
      return;
    }

    setIsProcessing(true);
    try {
      const unitAssignments = activeModalRental.items.map((item) => ({
        rentalItemId: item.rentalItemId,
        unitId: assignedUnitsState[item.rentalItemId],
        condition: pickupConditions[item.rentalItemId] || 'GOOD',
        notes: 'Pengecekan serah terima pickup di toko',
      }));

      const res = await fetch(`/api/rentals/${activeModalRental.id}/pickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitAssignments,
          collateralReceived: true,
          remainingSettled: remainingSettledChecked,
          settlementMethod: settlementMethod,
          staffName: 'Staff Operasional CampRent',
        }),
      });

      if (res.ok) {
        setRentals((prev) =>
          prev.map((r) => (r.id === activeModalRental.id ? { ...r, status: 'RENTED', remainingAmount: 0, isPaidOff: true } : r))
        );
        setActiveModalRental(null);
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal memproses pickup');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitReturn = async () => {
    if (!activeModalRental) return;
    if (!collateralReturnedChecked) {
      alert('Jaminan identitas wajib dicentang dikembalikan ke customer sebelum menyelesaikan rental.');
      return;
    }

    setIsProcessing(true);
    try {
      const unitReturns: any[] = [];
      activeModalRental.items.forEach((item) => {
        item.assignedUnits.forEach((u) => {
          unitReturns.push({
            unitId: u.unitId,
            condition: returnConditions[u.unitId] || 'GOOD',
            cleaningDays: item.cleaningDays,
            notes: 'Pengecekan fisik saat pengembalian barang',
          });
        });
      });

      const fees = [];
      if (cleaningFee > 0) fees.push({ type: 'CLEANING', amount: cleaningFee, notes: 'Biaya cuci/pembersihan kotor' });
      if (damageFee > 0) fees.push({ type: 'DAMAGE', amount: damageFee, notes: 'Biaya perbaikan unit rusak' });
      if (lateFee > 0) fees.push({ type: 'LATE', amount: lateFee, notes: 'Denda keterlambatan pengembalian' });

      const res = await fetch(`/api/rentals/${activeModalRental.id}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitReturns,
          fees,
          collateralReturned: true,
          staffName: 'Staff Operasional CampRent',
        }),
      });

      if (res.ok) {
        setRentals((prev) =>
          prev.map((r) =>
            r.id === activeModalRental.id
              ? {
                  ...r,
                  status: 'COMPLETED',
                  extraFees: cleaningFee + damageFee + lateFee,
                  total: r.subtotal + cleaningFee + damageFee + lateFee,
                }
              : r
          )
        );
        setActiveModalRental(null);
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal memproses return');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight">Manajemen Rental & Operasional</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Alur pickup, inspeksi unit fisik, verifikasi jaminan, dan pengembalian barang dengan denda.
        </p>
      </div>

      {/* Filter and Search Bar (Responsive) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-border p-4 shadow-sm space-y-3 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Cari no. booking, customer, hp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 min-h-[44px] bg-gray-50 border border-border rounded-xl text-base md:text-xs font-semibold text-text outline-none focus:border-primary focus:bg-white"
          />
        </div>

        {/* Status Filter Badges (Horizontal Scroll on Mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-semibold">
          {[
            { id: 'ALL', label: 'Semua' },
            { id: 'WAITING_PAYMENT', label: 'Menunggu Bayar' },
            { id: 'READY_FOR_PICKUP', label: 'Siap Pickup' },
            { id: 'RENTED', label: 'Sedang Disewa' },
            { id: 'RETURNING', label: 'Pengembalian' },
            { id: 'OVERDUE', label: 'Terlambat' },
            { id: 'COMPLETED', label: 'Selesai' },
            { id: 'CANCELLED', label: 'Dibatalkan' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-2 min-h-[38px] rounded-xl transition-all whitespace-nowrap active:scale-95 ${
                statusFilter === tab.id
                  ? 'bg-primary text-white font-bold shadow-xs'
                  : 'bg-gray-50 text-text hover:bg-gray-100 border border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Container Table (Desktop) / Cards (Mobile) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-border overflow-hidden shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-border text-text-muted font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">No. Booking</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Tanggal Rental</th>
                <th className="px-5 py-3.5">Peralatan & Unit</th>
                <th className="px-5 py-3.5">Jaminan</th>
                <th className="px-5 py-3.5">Total Biaya</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi Operasional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-text-muted">
                    Tidak ada data rental yang cocok.
                  </td>
                </tr>
              ) : (
                filteredRentals.map((r) => {
                  const badge = getStatusBadgeStyle(r.status);

                  return (
                    <tr key={r.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-4 font-black text-primary whitespace-nowrap">
                        {r.code}
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-text block">{r.customerName}</span>
                        <span className="text-[11px] text-text-muted">{r.customerPhone}</span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-text-muted">
                        {formatDate(r.startDate, 'dd MMM')} – {formatDate(r.endDate, 'dd MMM yyyy')}
                      </td>

                      <td className="px-5 py-4 max-w-[200px]">
                        <span className="text-text block font-medium truncate">
                          {r.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                        </span>
                        {r.items.some((i) => i.assignedUnits.length > 0) && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {r.items.flatMap((i) => i.assignedUnits).map((u) => (
                              <span key={u.code} className="text-[9px] font-bold bg-accent-mint text-primary px-1.5 py-0.5 rounded">
                                {u.code}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-text block">
                          {r.collateral?.type || 'KTP'} ({r.collateral?.holderName})
                        </span>
                        <span className="text-[10px] text-text-muted block">
                          {r.collateral?.status === 'HELD' ? 'Ditahan di Toko' : r.collateral?.status === 'RETURNED' ? 'Dikembalikan' : 'Belum Diterima'}
                        </span>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-black text-text block">{formatCurrency(r.total)}</span>
                        {r.paymentType === 'DP' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 mt-0.5">
                            DP: {formatCurrency(r.dpAmount)} {r.isPaidOff ? '• Lunas' : `(Sisa ${formatCurrency(r.remainingAmount)})`}
                          </span>
                        ) : (
                          <span className="text-[10px] text-text-muted block">Lunas Penuh</span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {r.status === 'WAITING_PAYMENT' && (
                            <button
                              onClick={() => handleConfirmPayment(r.id)}
                              disabled={isProcessing}
                              className="px-3 py-1.5 min-h-[36px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                            >
                              Tandai Lunas
                            </button>
                          )}

                          {['CONFIRMED', 'READY_FOR_PICKUP'].includes(r.status) && (
                            <button
                              onClick={() => openPickupModal(r)}
                              className="px-3 py-1.5 min-h-[36px] bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                            >
                              Pickup Barang
                            </button>
                          )}

                          {['RENTED', 'RETURNING', 'OVERDUE'].includes(r.status) && (
                            <button
                              onClick={() => openReturnModal(r)}
                              className="px-3 py-1.5 min-h-[36px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                            >
                              Return & Cek
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setActiveModalRental(r);
                              setModalMode('DETAIL');
                            }}
                            className="p-2 text-text-muted hover:text-text hover:bg-gray-100 rounded-lg transition-colors min-h-[36px]"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View (block md:hidden) - PRD UX Requirement */}
        <div className="block md:hidden divide-y divide-border p-3 space-y-3">
          {filteredRentals.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-muted">
              Tidak ada data rental yang sesuai.
            </div>
          ) : (
            filteredRentals.map((r) => {
              const badge = getStatusBadgeStyle(r.status);

              return (
                <div key={r.id} className="p-4 bg-gray-50/70 rounded-2xl border border-border/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-primary">{r.code}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-text">
                      <span>{r.customerName}</span>
                      <a href={`tel:${r.customerPhone}`} className="text-primary flex items-center gap-1 text-[11px]">
                        <Phone className="w-3 h-3" />
                        <span>{r.customerPhone}</span>
                      </a>
                    </div>
                    <span className="text-[11px] text-text-muted block">
                      {formatDate(r.startDate, 'dd MMM')} – {formatDate(r.endDate, 'dd MMM yyyy')}
                    </span>
                    <span className="text-text font-medium block truncate">
                      {r.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                    </span>
                    <span className="text-[11px] text-text-muted block">
                      Jaminan: <b>{r.collateral?.type || 'KTP'}</b> ({r.collateral?.status === 'HELD' ? 'Ditahan' : r.collateral?.status === 'RETURNED' ? 'Dikembalikan' : 'Belum diterima'})
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                    <div>
                      <span className="text-sm font-black text-text block">
                        {formatCurrency(r.total)}
                      </span>
                      {r.paymentType === 'DP' && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 mt-0.5">
                          DP: {formatCurrency(r.dpAmount)} {r.isPaidOff ? '• Lunas' : `(Sisa ${formatCurrency(r.remainingAmount)})`}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {r.status === 'WAITING_PAYMENT' && (
                        <button
                          onClick={() => handleConfirmPayment(r.id)}
                          disabled={isProcessing}
                          className="px-3 py-2 min-h-[44px] bg-emerald-600 text-white rounded-xl text-xs font-bold active:scale-95 shadow-xs"
                        >
                          Lunas
                        </button>
                      )}

                      {['CONFIRMED', 'READY_FOR_PICKUP'].includes(r.status) && (
                        <button
                          onClick={() => openPickupModal(r)}
                          className="px-4 py-2 min-h-[44px] bg-primary text-white rounded-xl text-xs font-bold active:scale-95 shadow-xs"
                        >
                          Pickup
                        </button>
                      )}

                      {['RENTED', 'RETURNING', 'OVERDUE'].includes(r.status) && (
                        <button
                          onClick={() => openReturnModal(r)}
                          className="px-4 py-2 min-h-[44px] bg-blue-600 text-white rounded-xl text-xs font-bold active:scale-95 shadow-xs"
                        >
                          Return & Cek
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setActiveModalRental(r);
                          setModalMode('DETAIL');
                        }}
                        className="px-3 py-2 min-h-[44px] bg-gray-200 text-text rounded-xl text-xs font-bold"
                      >
                        Detail
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Operational Modal (Detail / Pickup / Return) */}
      {activeModalRental && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full border border-border shadow-2xl p-5 sm:p-8 space-y-6 animate-in slide-in-from-bottom sm:zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Modal Title */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-xs font-bold text-text-muted uppercase">
                  {modalMode === 'PICKUP' ? 'Alur Pickup Peralatan' : modalMode === 'RETURN' ? 'Alur Return & Denda' : 'Detail Rental'}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-primary mt-0.5">{activeModalRental.code}</h2>
              </div>
              <button
                onClick={() => setActiveModalRental(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-text-muted hover:text-text hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PICKUP MODAL FLOW (PRD 6.10: Mobile Touch Friendly) */}
            {modalMode === 'PICKUP' && (
              <div className="space-y-5 text-xs">
                <div className="p-3.5 bg-accent-mint/50 rounded-2xl border border-primary/20 space-y-1">
                  <b className="text-text block">Instruksi Pickup Toko:</b>
                  <p className="text-text-muted leading-relaxed">
                    Tetapkan kode unit fisik spesifik dan verifikasi jaminan identitas fisik asli sebelum menyerahkan barang.
                  </p>
                </div>

                {/* Units Assignment */}
                <div className="space-y-3">
                  <h4 className="font-bold uppercase tracking-wider text-text-muted">
                    Pilih Unit Fisik & Kondisi Serah Terima
                  </h4>
                  {activeModalRental.items.map((item) => (
                    <div key={item.rentalItemId} className="p-3.5 bg-gray-50 rounded-2xl border border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-text">{item.productName}</span>
                        <span className="font-semibold text-text-muted">{item.quantity} Unit</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-text-muted mb-1">
                            Kode Unit Fisik:
                          </label>
                          <select
                            value={assignedUnitsState[item.rentalItemId] || ''}
                            onChange={(e) =>
                              setAssignedUnitsState({
                                ...assignedUnitsState,
                                [item.rentalItemId]: e.target.value,
                              })
                            }
                            className="w-full p-2.5 min-h-[44px] bg-white border border-border rounded-xl font-bold text-text text-base md:text-xs outline-none"
                          >
                            {item.availableUnitsList.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.code} ({u.status})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-text-muted mb-1">
                            Kondisi Fisik:
                          </label>
                          <select
                            value={pickupConditions[item.rentalItemId] || 'GOOD'}
                            onChange={(e) =>
                              setPickupConditions({
                                ...pickupConditions,
                                [item.rentalItemId]: e.target.value,
                              })
                            }
                            className="w-full p-2.5 min-h-[44px] bg-white border border-border rounded-xl font-bold text-text text-base md:text-xs outline-none"
                          >
                            <option value="GOOD">Good (Bersih & Bagus)</option>
                            <option value="MINOR_DAMAGE">Minor Damage (Gores Halus)</option>
                            <option value="DAMAGED">Damaged</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Collateral Record Check (Large Touch Friendly Card) */}
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={collateralReceivedChecked}
                      onChange={(e) => setCollateralReceivedChecked(e.target.checked)}
                      className="mt-1 rounded text-primary focus:ring-primary h-5 w-5 shrink-0"
                    />
                    <div>
                      <span className="font-bold text-amber-950 text-sm block">
                        Jaminan Identitas Asli Telah Diterima di Toko *
                      </span>
                      <span className="text-[11px] text-amber-900 block mt-0.5 leading-relaxed">
                        Kartu <b>{activeModalRental.collateral?.type || 'KTP'}</b> asli a/n <b>{activeModalRental.collateral?.holderName}</b> telah disimpan di brankas toko.
                      </span>
                    </div>
                  </label>
                </div>

                {/* Down Payment Settlement at Store (If DP & Remaining > 0) */}
                {activeModalRental.paymentType === 'DP' && activeModalRental.remainingAmount > 0 && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-emerald-700 shrink-0" />
                        <div>
                          <span className="font-bold text-emerald-950 text-sm block">Pelunasan Sisa Sewa (DP)</span>
                          <span className="text-[11px] text-emerald-800">DP Awal: {formatCurrency(activeModalRental.dpAmount)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 block">Sisa Wajib Lunas</span>
                        <span className="text-base font-black text-emerald-800">{formatCurrency(activeModalRental.remainingAmount)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-900 mb-1">Metode Pelunasan:</label>
                        <select
                          value={settlementMethod}
                          onChange={(e) => setSettlementMethod(e.target.value)}
                          className="w-full p-2.5 min-h-[44px] bg-white border border-emerald-300 rounded-xl font-bold text-text text-base md:text-xs outline-none"
                        >
                          <option value="CASH">Tunai / Cash</option>
                          <option value="QRIS">QRIS Statis Toko</option>
                          <option value="EDC">Debit / EDC</option>
                          <option value="TRANSFER">Transfer Manual</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <label className="flex items-center gap-2.5 p-2.5 bg-white border border-emerald-300 rounded-xl w-full min-h-[44px] cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={remainingSettledChecked}
                            onChange={(e) => setRemainingSettledChecked(e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 h-5 w-5 shrink-0"
                          />
                          <span className="font-bold text-emerald-950 text-xs leading-snug">
                            Sisa {formatCurrency(activeModalRental.remainingAmount)} Diterima Kasir *
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <button
                    onClick={() => setActiveModalRental(null)}
                    className="flex-1 sm:flex-none px-4 py-3 min-h-[44px] bg-gray-100 hover:bg-gray-200 text-text font-bold rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmitPickup}
                    disabled={
                      isProcessing ||
                      !collateralReceivedChecked ||
                      (activeModalRental.paymentType === 'DP' && activeModalRental.remainingAmount > 0 && !remainingSettledChecked)
                    }
                    className="flex-1 sm:flex-none px-6 py-3 min-h-[44px] bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
                  >
                    {isProcessing ? 'Menyimpan...' : 'Konfirmasi Pickup (Rented)'}
                  </button>
                </div>
              </div>
            )}

            {/* RETURN MODAL FLOW (PRD 6.11: Mobile Touch Friendly) */}
            {modalMode === 'RETURN' && (
              <div className="space-y-5 text-xs">
                <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200 space-y-1">
                  <b className="text-blue-900 block">Inspeksi Return & Penghitungan Denda:</b>
                  <p className="text-blue-800 leading-relaxed">
                    Periksa kebersihan unit (Good/Dirty/Damaged). Denda dibayar saat return, dan jaminan fisik asli dikembalikan ke pelanggan.
                  </p>
                </div>

                {/* Inspect each unit */}
                <div className="space-y-3">
                  <h4 className="font-bold uppercase tracking-wider text-text-muted">
                    Pemeriksaan Fisik Unit
                  </h4>
                  {activeModalRental.items.flatMap((i) => i.assignedUnits).map((u) => (
                    <div key={u.unitId} className="p-3.5 bg-gray-50 rounded-2xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-text text-sm block">Unit: {u.code}</span>
                        <span className="text-[10px] text-text-muted">Status unit setelah ini: Masa Cuci / Servis</span>
                      </div>
                      <select
                        value={returnConditions[u.unitId] || 'GOOD'}
                        onChange={(e) =>
                          setReturnConditions({
                            ...returnConditions,
                            [u.unitId]: e.target.value,
                          })
                        }
                        className="p-2.5 min-h-[44px] bg-white border border-border rounded-xl font-bold text-text text-base md:text-xs outline-none"
                      >
                        <option value="GOOD">Good (Baik & Bersih)</option>
                        <option value="DIRTY">Dirty (Perlu Cuci Ekstra)</option>
                        <option value="MINOR_DAMAGE">Minor Damage</option>
                        <option value="DAMAGED">Damaged (Masuk Maintenance)</option>
                      </select>
                    </div>
                  ))}
                </div>

                {/* Extra Fees */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-border space-y-3">
                  <h4 className="font-bold uppercase tracking-wider text-text">Kalkulasi Denda / Biaya Ekstra</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted mb-1">
                        Cleaning Fee (Rp):
                      </label>
                      <input
                        type="number"
                        value={cleaningFee}
                        onChange={(e) => setCleaningFee(Number(e.target.value))}
                        className="w-full p-2.5 min-h-[44px] bg-white border border-border rounded-xl font-bold text-text text-base md:text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted mb-1">
                        Damage Fee (Rp):
                      </label>
                      <input
                        type="number"
                        value={damageFee}
                        onChange={(e) => setDamageFee(Number(e.target.value))}
                        className="w-full p-2.5 min-h-[44px] bg-white border border-border rounded-xl font-bold text-text text-base md:text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted mb-1">
                        Late Fee (Rp):
                      </label>
                      <input
                        type="number"
                        value={lateFee}
                        onChange={(e) => setLateFee(Number(e.target.value))}
                        className="w-full p-2.5 min-h-[44px] bg-white border border-border rounded-xl font-bold text-text text-base md:text-xs"
                      />
                    </div>
                  </div>
                  <div className="pt-2 text-right">
                    <span className="text-[11px] text-text-muted block">Total Denda Ditagih:</span>
                    <span className="font-black text-rose-600 text-sm">
                      {formatCurrency(cleaningFee + damageFee + lateFee)}
                    </span>
                  </div>
                </div>

                {/* Collateral Returned Check */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={collateralReturnedChecked}
                      onChange={(e) => setCollateralReturnedChecked(e.target.checked)}
                      className="mt-1 rounded text-primary focus:ring-primary h-5 w-5 shrink-0"
                    />
                    <div>
                      <span className="font-bold text-emerald-950 text-sm block">
                        Jaminan Identitas Telah Dikembalikan ke Pelanggan *
                      </span>
                      <span className="text-[11px] text-emerald-800 block mt-0.5 leading-relaxed">
                        Denda lunas dan kartu fisik asli ({activeModalRental.collateral?.type}) telah diserahkan kembali ke customer.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <button
                    onClick={() => setActiveModalRental(null)}
                    className="flex-1 sm:flex-none px-4 py-3 min-h-[44px] bg-gray-100 hover:bg-gray-200 text-text font-bold rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSubmitReturn}
                    disabled={isProcessing || !collateralReturnedChecked}
                    className="flex-1 sm:flex-none px-6 py-3 min-h-[44px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md active:scale-95"
                  >
                    {isProcessing ? 'Menyimpan...' : 'Selesaikan Rental (Completed)'}
                  </button>
                </div>
              </div>
            )}

            {/* DETAIL VIEW */}
            {modalMode === 'DETAIL' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-gray-50 rounded-2xl border border-border">
                  <div>
                    <span className="text-text-muted block">Pelanggan:</span>
                    <b className="text-text text-sm">{activeModalRental.customerName}</b>
                    <span className="text-text-muted block mt-0.5">{activeModalRental.customerPhone}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Periode Sewa:</span>
                    <b className="text-text">{formatDate(activeModalRental.startDate)} – {formatDate(activeModalRental.endDate)}</b>
                    <span className="text-text-muted block mt-0.5">Status: <b>{activeModalRental.status}</b></span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold uppercase tracking-wider text-text-muted mb-2">Item Sewa</h4>
                  <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                    {activeModalRental.items.map((i) => (
                      <div key={i.rentalItemId} className="p-3 bg-white flex justify-between items-center">
                        <div>
                          <b className="text-text block">{i.productName}</b>
                          <span className="text-text-muted">{i.quantity} Unit × {formatCurrency(i.pricePerDay)} × {i.days} hari</span>
                        </div>
                        <span className="font-bold text-text">{formatCurrency(i.pricePerDay * i.quantity * i.days)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-accent-mint/40 rounded-2xl border border-primary/20 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-text">Total Biaya Sewa:</span>
                    <span className="font-black text-primary text-base">{formatCurrency(activeModalRental.total)}</span>
                  </div>
                  {activeModalRental.paymentType === 'DP' ? (
                    <div className="pt-2 border-t border-primary/10 space-y-1.5 text-xs">
                      <div className="flex justify-between text-text-muted">
                        <span>Skema Pembayaran:</span>
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Uang Muka (DP)</span>
                      </div>
                      <div className="flex justify-between text-text">
                        <span>DP Dibayar:</span>
                        <span className="font-bold text-text">{formatCurrency(activeModalRental.dpAmount)}</span>
                      </div>
                      <div className="flex justify-between text-text">
                        <span>Sisa Pelunasan di Toko:</span>
                        <span className={`font-bold ${activeModalRental.isPaidOff ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {activeModalRental.isPaidOff ? 'Lunas (Rp 0)' : formatCurrency(activeModalRental.remainingAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-text">
                        <span>Status Pelunasan:</span>
                        <span className={`font-bold ${activeModalRental.isPaidOff ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {activeModalRental.isPaidOff ? '✓ Lunas' : 'Belum Lunas (Bayar saat Pickup)'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-primary/10 flex justify-between text-text-muted text-xs">
                      <span>Skema Pembayaran:</span>
                      <span className="font-bold text-emerald-700">Lunas Penuh</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-primary/10 flex justify-between text-text-muted text-xs">
                    <span>Saluran Pembayaran:</span>
                    <span className="font-bold text-text">
                      {activeModalRental.paymentMethod === 'DANA'
                        ? '💙 E-Wallet DANA'
                        : activeModalRental.paymentMethod === 'GOPAY'
                        ? '💚 E-Wallet GoPay'
                        : '🏦 Transfer Bank (BCA)'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setActiveModalRental(null)}
                    className="w-full sm:w-auto px-6 py-2.5 min-h-[44px] bg-gray-100 hover:bg-gray-200 text-text font-bold rounded-xl"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
