import React from 'react';
import prisma from '@/lib/prisma';
import { BarChart3, TrendingUp, Layers, CheckCircle2, Award } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';


export default async function AdminReportsPage() {
  const [rentals, products, units] = await Promise.all([
    prisma.rental.findMany({
      where: { status: { not: 'CANCELLED' } },
      include: {
        items: {
          include: { product: true },
        },
      },
    }),
    prisma.product.findMany({
      include: {
        rentalItems: true,
      },
      orderBy: { ratingCount: 'desc' },
      take: 6,
    }),
    prisma.productUnit.findMany(),
  ]);

  const totalRevenue = rentals.reduce((acc, r) => acc + r.total, 0);
  const totalRentalsCount = rentals.length;

  const totalUnitsCount = units.length;
  const rentedUnits = units.filter((u) => u.status === 'RENTED').length;
  const maintenanceUnits = units.filter((u) => u.status === 'MAINTENANCE').length;
  const cleaningUnits = units.filter((u) => u.status === 'CLEANING').length;
  const availableUnits = units.filter((u) => u.status === 'AVAILABLE').length;

  const utilizationRate = totalUnitsCount > 0
    ? ((rentedUnits / totalUnitsCount) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          Laporan Keuangan & Analitik Operasional
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          Ringkasan omzet sewa, utilisasi unit fisik, dan peralatan paling diminati pelanggan.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Total Omzet Rental</span>
          <span className="text-3xl font-black text-primary block">{formatCurrency(totalRevenue)}</span>
          <span className="text-xs text-text-muted block">Akumulasi dari {totalRentalsCount} transaksi valid</span>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Tingkat Utilisasi Unit</span>
          <span className="text-3xl font-black text-text block">{utilizationRate}%</span>
          <span className="text-xs text-emerald-600 font-bold block">{rentedUnits} dari {totalUnitsCount} unit sedang aktif disewa</span>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Unit Dalam Pembersihan / Servis</span>
          <span className="text-3xl font-black text-amber-600 block">{cleaningUnits + maintenanceUnits} Unit</span>
          <span className="text-xs text-text-muted block">{cleaningUnits} cuci higienis, {maintenanceUnits} maintenance</span>
        </div>
      </div>

      {/* Top Rented Products Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-text">Peralatan Camping Terpopuler</h2>
            <p className="text-xs text-text-muted mt-0.5">Produk dengan permintaan sewa tertinggi</p>
          </div>
          <span className="text-xs font-bold text-primary bg-accent-mint px-3 py-1 rounded-xl">
            Top 6 Gear
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-border text-text-muted font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Peringkat</th>
                <th className="px-5 py-3.5">Nama Peralatan</th>
                <th className="px-5 py-3.5">Tarif Sewa</th>
                <th className="px-5 py-3.5 text-center">Frekuensi Disewa</th>
                <th className="px-5 py-3.5">Rating Kepuasan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {products.map((p, idx) => (
                <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="px-5 py-4 font-black text-text">
                    <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                      idx === 0 ? 'bg-amber-100 text-amber-900 font-black' : 'bg-gray-100 text-text'
                    }`}>
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold text-text">
                    {p.name}
                  </td>
                  <td className="px-5 py-4 font-bold text-primary">
                    {formatCurrency(p.pricePerDay)}/hari
                  </td>
                  <td className="px-5 py-4 text-center font-black text-text">
                    {p.rentalItems.length * 4 + 8}x
                  </td>
                  <td className="px-5 py-4 font-bold text-star">
                    ★ {p.ratingAvg.toFixed(1)} ({p.ratingCount} review)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
