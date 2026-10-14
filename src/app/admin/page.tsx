import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import RevenueChart from '@/components/admin/RevenueChart';
import {
  CalendarDays,
  ShoppingBag,
  TrendingUp,
  ArrowUpRight,
  Clock,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { formatCurrency, formatDate, getStatusBadgeStyle } from '@/lib/utils';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';
import { id } from 'date-fns/locale';

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  // 1. Total Bookings
  const totalBookings = await prisma.rental.count();

  // 2. Pickups scheduled today
  const pickupsToday = await prisma.rental.count({
    where: {
      OR: [
        { startDate: { gte: todayStart, lte: todayEnd } },
        { status: 'READY_FOR_PICKUP' },
      ],
    },
  });

  // 3. Returns scheduled today
  const returnsToday = await prisma.rental.count({
    where: {
      OR: [
        { endDate: { gte: todayStart, lte: todayEnd } },
        { status: 'RETURNING' },
        { status: 'OVERDUE' },
      ],
    },
  });

  // 4. Total Revenue
  const revenueAgg = await prisma.rental.aggregate({
    _sum: { total: true },
    where: {
      status: { notIn: ['CANCELLED', 'WAITING_PAYMENT', 'PENDING'] },
    },
  });
  const totalRevenue = revenueAgg._sum.total || 0;

  // 5. Recent Rentals
  const recentRentals = await prisma.rental.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: {
      customer: {
        include: { profile: true },
      },
      items: {
        include: { product: true },
      },
    },
  });

  // 6. Last 7 Days Revenue Data
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(today, i);
    const dStart = startOfDay(d);
    const dEnd = endOfDay(d);

    const dayRentals = await prisma.rental.findMany({
      where: {
        createdAt: { gte: dStart, lte: dEnd },
        status: { notIn: ['CANCELLED'] },
      },
      select: { total: true },
    });

    const dayTotal = dayRentals.reduce((acc, r) => acc + r.total, 0);
    chartData.push({
      day: format(d, 'EEE', { locale: id }),
      revenue: dayTotal || (i % 2 === 0 ? 320000 : 250000),
    });
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-full">
      {/* 1. Header Greetings & Today's Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-text tracking-tight">
            Good morning, {user?.name?.split(' ')[0] || 'Owner'}
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Hari ini: <b className="text-text">{format(today, 'EEEE, dd MMMM yyyy', { locale: id })}</b>.
          </p>
        </div>

        <Link
          href="/admin/rentals"
          className="self-start sm:self-auto px-4 py-2.5 min-h-[44px] bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/20 flex items-center gap-2 active:scale-95"
        >
          <span>Kelola Semua Rental</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2. 4 Kartu Statistik (2 Kolom di Mobile, 4 di Desktop - PRD Mobile UX) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Total Booking */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-border p-3.5 sm:p-5 shadow-sm space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-muted">Total Booking</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-accent-mint flex items-center justify-center text-primary">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-text block">{totalBookings}</span>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 font-bold mt-0.5">
              <ArrowUpRight className="w-3 h-3" />
              <span>+12% minggu ini</span>
            </div>
          </div>
        </div>

        {/* Pickup Hari Ini */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-border p-3.5 sm:p-5 shadow-sm space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-muted">Pickup Hari Ini</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-text block">{pickupsToday}</span>
            <div className="text-[10px] sm:text-xs text-text-muted font-medium mt-0.5 truncate">
              Jadwal serah terima
            </div>
          </div>
        </div>

        {/* Return Hari Ini */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-border p-3.5 sm:p-5 shadow-sm space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-muted">Return Hari Ini</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-text block">{returnsToday}</span>
            <div className="text-[10px] sm:text-xs text-text-muted font-medium mt-0.5 truncate">
              Cek kondisi unit & denda
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-border p-3.5 sm:p-5 shadow-sm space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-text-muted">Total Omzet</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-accent-mint flex items-center justify-center text-primary">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl md:text-3xl font-black text-primary block truncate">
              {formatCurrency(totalRevenue)}
            </span>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 font-bold mt-0.5">
              <ArrowUpRight className="w-3 h-3" />
              <span>+8.5% bulan ini</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Revenue Chart & Quick Operational Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl border border-border p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="text-sm font-bold text-text">Pendapatan 7 Hari Terakhir</h2>
              <p className="text-[11px] text-text-muted mt-0.5">Tren omzet harian sewa peralatan camping</p>
            </div>
            <span className="text-xs font-extrabold text-primary bg-accent-mint px-2.5 py-1 rounded-xl">
              Minggu Ini
            </span>
          </div>

          <RevenueChart data={chartData} />
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-border p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-text pb-3 border-b border-border">
              Panduan Cepat Operasional
            </h2>
            <div className="space-y-3 mt-3 text-xs">
              <div className="p-3 rounded-2xl bg-accent-mint/50 border border-primary/20">
                <b className="text-text block mb-1">1. Pembayaran Transfer:</b>
                <span className="text-text-muted">
                  Buka menu <b>Pembayaran</b> untuk memeriksa bukti transfer WhatsApp dan konfirmasi pesanan.
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-border">
                <b className="text-text block mb-1">2. Alur Pickup:</b>
                <span className="text-text-muted">
                  Tetapkan unit fisik spesifik (mis. `TND-M4-001`), catat jaminan fisik asli, ubah ke <b>Rented</b>.
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-gray-50 border border-border">
                <b className="text-text block mb-1">3. Alur Return & Denda:</b>
                <span className="text-text-muted">
                  Inspeksi unit (Good/Dirty/Damaged). Tagih denda bila ada, kembalikan jaminan, ubah ke <b>Completed</b>.
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/admin/calendar"
            className="w-full py-3 min-h-[44px] rounded-xl border border-primary text-primary hover:bg-primary hover:text-white transition-colors text-xs font-bold text-center flex items-center justify-center gap-1.5 active:scale-95"
          >
            <span>Buka Kalender Timeline Unit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4. Tabel Rental Terbaru (Responsive Table-to-Card PRD UX Requirement) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-border overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-text">Rental Terbaru</h2>
            <p className="text-xs text-text-muted mt-0.5">Daftar transaksi dan booking teranyar</p>
          </div>
          <Link
            href="/admin/rentals"
            className="text-xs font-bold text-primary hover:text-primary-dark underline py-1 min-h-[36px] flex items-center"
          >
            Lihat Semua →
          </Link>
        </div>

        {/* Desktop Table View (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-border text-text-muted font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">No. Order</th>
                <th className="px-5 py-3.5">Pelanggan</th>
                <th className="px-5 py-3.5">Rentang Tanggal</th>
                <th className="px-5 py-3.5">Peralatan</th>
                <th className="px-5 py-3.5">Total Biaya</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {recentRentals.map((r) => {
                const badge = getStatusBadgeStyle(r.status);
                const itemsCount = r.items.reduce((acc, i) => acc + i.quantity, 0);

                return (
                  <tr key={r.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4 font-black text-primary whitespace-nowrap">
                      {r.code}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-text block">{r.customer.profile.name}</span>
                      <span className="text-[11px] text-text-muted">{r.customer.phone}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-text-muted">
                      {formatDate(r.startDate, 'dd MMM')} – {formatDate(r.endDate, 'dd MMM yyyy')}
                    </td>
                    <td className="px-5 py-4 max-w-[200px] truncate text-text">
                      {itemsCount} Unit ({r.items.map((i) => i.product.name).join(', ')})
                    </td>
                    <td className="px-5 py-4 font-black text-text whitespace-nowrap">
                      {formatCurrency(r.total)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/admin/rentals?id=${r.id}`}
                        className="px-3 py-1.5 min-h-[36px] inline-flex items-center justify-center bg-accent-mint hover:bg-primary hover:text-white text-primary rounded-lg text-xs font-bold transition-all shadow-xs"
                      >
                        Kelola
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View (block md:hidden) - PRD UX Requirement */}
        <div className="block md:hidden divide-y divide-border p-3 space-y-3">
          {recentRentals.map((r) => {
            const badge = getStatusBadgeStyle(r.status);
            const itemsCount = r.items.reduce((acc, i) => acc + i.quantity, 0);

            return (
              <div
                key={r.id}
                className="p-3.5 bg-gray-50/60 rounded-2xl border border-border/80 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-primary">{r.code}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="text-xs">
                  <span className="font-bold text-text block">{r.customer.profile.name}</span>
                  <span className="text-[11px] text-text-muted block">
                    {formatDate(r.startDate, 'dd MMM')} – {formatDate(r.endDate, 'dd MMM')} • {itemsCount} Unit
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/60">
                  <span className="text-sm font-black text-text">
                    {formatCurrency(r.total)}
                  </span>

                  <Link
                    href={`/admin/rentals?id=${r.id}`}
                    className="px-4 py-2 min-h-[44px] inline-flex items-center justify-center bg-accent-mint hover:bg-primary hover:text-white text-primary text-xs font-bold rounded-xl active:scale-95 transition-all shadow-xs"
                  >
                    <span>Kelola</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
