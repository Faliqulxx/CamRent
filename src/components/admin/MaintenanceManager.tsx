'use client';

import React, { useState } from 'react';
import { Wrench, Plus, CheckCircle2, Clock, AlertTriangle, X } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { addDays, format } from 'date-fns';
import { useRouter } from 'next/navigation';

export interface MaintenanceItem {
  id: string;
  unitId: string;
  unitCode: string;
  productName: string;
  issue: string;
  estimatedCost: number;
  startDate: string;
  expectedReadyDate: string;
  status: string;
}

interface MaintenanceManagerProps {
  initialMaintenances: MaintenanceItem[];
  allUnits: { id: string; code: string; productName: string }[];
}

export default function MaintenanceManager({ initialMaintenances, allUnits }: MaintenanceManagerProps) {
  const router = useRouter();
  const [maintenances, setMaintenances] = useState(initialMaintenances);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [selectedUnitId, setSelectedUnitId] = useState(allUnits[0]?.id || '');
  const [issue, setIssue] = useState('');
  const [estimatedCost, setEstimatedCost] = useState(50000);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expectedReadyDate, setExpectedReadyDate] = useState(format(addDays(new Date(), 3), 'yyyy-MM-dd'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/maintenance/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setMaintenances((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitId: selectedUnitId,
          issue,
          estimatedCost,
          startDate,
          expectedReadyDate,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        router.refresh();
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-primary" />
            Maintenance & Perbaikan Unit
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Unit dalam perbaikan otomatis tidak dapat disewa (diblokir dari availability engine).
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Maintenance Unit</span>
        </button>
      </div>

      {/* MOBILE CARDS VIEW (block md:hidden) */}
      <div className="block md:hidden space-y-3.5">
        {maintenances.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center text-text-muted text-xs">
            Tidak ada unit yang sedang dalam masa maintenance.
          </div>
        ) : (
          maintenances.map((m) => {
            const isDone = m.status === 'DONE';

            return (
              <div key={m.id} className="bg-white rounded-2xl border border-border p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-primary text-sm">{m.unitCode}</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : m.status === 'IN_PROGRESS'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Produk</span>
                    <span className="font-bold text-text">{m.productName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Kendala Fisik</span>
                    <p className="text-text font-medium bg-gray-50 p-2 rounded-lg border border-border/60">{m.issue}</p>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-text-muted">Biaya Servis:</span>
                    <span className="font-bold text-text">{formatCurrency(m.estimatedCost)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Periode:</span>
                    <span className="font-medium text-text">{formatDate(m.startDate)} – {formatDate(m.expectedReadyDate)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-text-muted">Ubah Status:</span>
                  <select
                    value={m.status}
                    onChange={(e) => handleUpdateStatus(m.id, e.target.value)}
                    className="p-2 min-h-[40px] bg-gray-50 border border-border rounded-xl text-base md:text-xs font-bold text-text outline-none cursor-pointer"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE (Tersedia)</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE VIEW (hidden md:block) */}
      <div className="hidden md:block bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-border text-text-muted font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Kode Unit</th>
                <th className="px-5 py-3.5">Produk</th>
                <th className="px-5 py-3.5">Kendala / Masalah</th>
                <th className="px-5 py-3.5">Estimasi Biaya</th>
                <th className="px-5 py-3.5">Periode Perbaikan</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Ubah Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {maintenances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-text-muted">
                    Tidak ada unit yang sedang dalam masa maintenance.
                  </td>
                </tr>
              ) : (
                maintenances.map((m) => {
                  const isDone = m.status === 'DONE';

                  return (
                    <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-4 font-black text-primary">
                        {m.unitCode}
                      </td>

                      <td className="px-5 py-4 font-bold text-text">
                        {m.productName}
                      </td>

                      <td className="px-5 py-4 max-w-xs text-text">
                        {m.issue}
                      </td>

                      <td className="px-5 py-4 font-bold text-text">
                        {formatCurrency(m.estimatedCost)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-text-muted">
                        {formatDate(m.startDate)} – {formatDate(m.expectedReadyDate)}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                            isDone
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : m.status === 'IN_PROGRESS'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <select
                          value={m.status}
                          onChange={(e) => handleUpdateStatus(m.id, e.target.value)}
                          className="p-1.5 bg-gray-50 border border-border rounded-lg text-xs font-bold text-text outline-none cursor-pointer"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="DONE">DONE (Kembali Tersedia)</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Maintenance Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-border shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-black text-lg text-text">Catat Perbaikan Unit</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-text-muted hover:text-text">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMaintenance} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-text mb-1">Pilih Unit Fisik *</label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full p-2.5 min-h-[44px] md:min-h-0 bg-gray-50 border border-border rounded-xl font-bold text-text outline-none text-base md:text-xs"
                >
                  {allUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.code} — {u.productName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-text mb-1">Kendala / Kerusakan Fisik *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Misal: Frame fiber patah sambungan tengah, perlu ganti resleting flysheet..."
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-border rounded-xl font-medium text-text outline-none resize-none text-base md:text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-text mb-1">Mulai Perbaikan:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 min-h-[44px] md:min-h-0 bg-gray-50 border border-border rounded-xl font-bold text-text outline-none text-base md:text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-text mb-1">Estimasi Siap:</label>
                  <input
                    type="date"
                    value={expectedReadyDate}
                    onChange={(e) => setExpectedReadyDate(e.target.value)}
                    className="w-full p-2.5 min-h-[44px] md:min-h-0 bg-gray-50 border border-border rounded-xl font-bold text-text outline-none text-base md:text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-text mb-1">Estimasi Biaya Reparasi (Rp):</label>
                <input
                  type="number"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(Number(e.target.value))}
                  className="w-full p-2.5 min-h-[44px] md:min-h-0 bg-gray-50 border border-border rounded-xl font-bold text-text outline-none text-base md:text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 min-h-[44px] text-text-muted hover:text-text font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 min-h-[44px] bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-md shadow-primary/20"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Data Maintenance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
