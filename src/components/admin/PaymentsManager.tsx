'use client';

import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Clock, Upload, Eye, X, Check } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export interface PaymentItem {
  id: string;
  rentalId: string;
  rentalCode: string;
  customerName: string;
  amount: number;
  method: string;
  type: string;
  paymentType?: string;
  remainingAmount?: number;
  status: string;
  proofUrl: string | null;
  paidAt: string | null;
  createdAt: string;
}

export default function PaymentsManager({ initialPayments }: { initialPayments: PaymentItem[] }) {
  const router = useRouter();
  const [payments, setPayments] = useState(initialPayments);
  const [previewProof, setPreviewProof] = useState<string | null>(null);
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'DANA':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#118EEA]" />
            DANA (E-Wallet)
          </span>
        );
      case 'GOPAY':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00AA13]" />
            GoPay (E-Wallet)
          </span>
        );
      case 'CASH':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            Tunai Kasir
          </span>
        );
      case 'QRIS':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
            QRIS Toko
          </span>
        );
      case 'EDC':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
            EDC / Debit
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
            Bank BCA
          </span>
        );
    }
  };

  const handleVerifyPayment = async (paymentId: string, rentalId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/rentals/${rentalId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      });

      if (res.ok) {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === paymentId
              ? { ...p, status: 'VERIFIED', paidAt: new Date().toISOString() }
              : p
          )
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadProof = (e: React.ChangeEvent<HTMLInputElement>, paymentId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const url = event.target.result as string;
        setPayments((prev) =>
          prev.map((p) => (p.id === paymentId ? { ...p, proofUrl: url } : p))
        );
        setUploadTargetId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-text tracking-tight">Verifikasi Pembayaran Transfer</h1>
        <p className="text-xs text-text-muted mt-0.5">
          Bukti transfer bank diterima via WhatsApp dan dapat diverifikasi langsung di sini untuk mengubah status pesanan menjadi Confirmed.
        </p>
      </div>

      {/* MOBILE CARDS VIEW (block md:hidden) */}
      <div className="block md:hidden space-y-3.5">
        {payments.map((p) => {
          const isVerified = p.status === 'VERIFIED';

          return (
            <div key={p.id} className="bg-white rounded-2xl border border-border p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-black text-primary text-sm">{p.rentalCode}</span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    isVerified
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {isVerified ? 'Lunas Terverifikasi' : 'Menunggu Verifikasi'}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Customer:</span>
                  <span className="font-bold text-text">{p.customerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Jenis Pembayaran:</span>
                  <span className="font-bold text-xs">
                    {p.type === 'DP' ? (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Uang Muka (DP)
                      </span>
                    ) : p.type === 'SETTLEMENT' ? (
                      <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Pelunasan Toko
                      </span>
                    ) : (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Lunas Penuh
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Nominal:</span>
                  <span className="font-black text-text text-sm">{formatCurrency(p.amount)}</span>
                </div>
                {p.type === 'DP' && p.remainingAmount !== undefined && p.remainingAmount > 0 && (
                  <div className="flex justify-between items-center text-[11px] text-amber-700 font-medium">
                    <span>Sisa di Toko:</span>
                    <span className="font-bold">{formatCurrency(p.remainingAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Metode:</span>
                  <div>{getMethodBadge(p.method)}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center gap-2">
                {p.proofUrl ? (
                  <button
                    onClick={() => setPreviewProof(p.proofUrl)}
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-accent-mint text-primary rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Lihat Bukti</span>
                  </button>
                ) : (
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      id={`mobile-proof-upload-${p.id}`}
                      className="hidden"
                      onChange={(e) => handleUploadProof(e, p.id)}
                    />
                    <label
                      htmlFor={`mobile-proof-upload-${p.id}`}
                      className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-text-muted rounded-xl font-semibold text-xs cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Unggah Bukti</span>
                    </label>
                  </div>
                )}

                {!isVerified && (
                  <button
                    onClick={() => handleVerifyPayment(p.id, p.rentalId)}
                    disabled={isProcessing}
                    className="flex-1 min-h-[44px] px-3 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Tandai Lunas</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE VIEW (hidden md:block) */}
      <div className="hidden md:block bg-white rounded-2xl border border-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-border text-text-muted font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">No. Booking</th>
                <th className="px-5 py-3.5">Nama Customer</th>
                <th className="px-5 py-3.5">Jumlah Transfer</th>
                <th className="px-5 py-3.5">Metode</th>
                <th className="px-5 py-3.5">Bukti Transfer (Arsip)</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {payments.map((p) => {
                const isVerified = p.status === 'VERIFIED';

                return (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-5 py-4 font-black text-primary">
                      {p.rentalCode}
                    </td>

                    <td className="px-5 py-4 font-bold text-text">
                      {p.customerName}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-black text-text block">{formatCurrency(p.amount)}</span>
                      {p.type === 'DP' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 mt-0.5">
                          DP (Sisa {formatCurrency(p.remainingAmount || 0)})
                        </span>
                      ) : p.type === 'SETTLEMENT' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 mt-0.5">
                          Pelunasan Toko
                        </span>
                      ) : (
                        <span className="text-[10px] text-text-muted block">Lunas Penuh</span>
                      )}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      {getMethodBadge(p.method)}
                    </td>

                    <td className="px-5 py-4">
                      {p.proofUrl ? (
                        <button
                          onClick={() => setPreviewProof(p.proofUrl)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent-mint text-primary rounded-lg font-bold text-xs hover:bg-primary hover:text-white transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Arsip</span>
                        </button>
                      ) : (
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            id={`proof-upload-${p.id}`}
                            className="hidden"
                            onChange={(e) => handleUploadProof(e, p.id)}
                          />
                          <label
                            htmlFor={`proof-upload-${p.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-text-muted rounded-lg font-semibold text-xs cursor-pointer transition-colors"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Unggah Arsip</span>
                          </label>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                          isVerified
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {isVerified ? 'Lunas Terverifikasi' : 'Menunggu Verifikasi'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      {!isVerified && (
                        <button
                          onClick={() => handleVerifyPayment(p.id, p.rentalId)}
                          disabled={isProcessing}
                          className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                        >
                          Tandai Lunas
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Preview Modal */}
      {previewProof && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text">Arsip Bukti Transfer</h3>
              <button onClick={() => setPreviewProof(null)} className="text-text-muted hover:text-text">
                <X className="w-4 h-4" />
              </button>
            </div>
            <img src={previewProof} alt="Bukti Transfer" className="w-full rounded-xl object-contain max-h-96" />
            <button
              onClick={() => setPreviewProof(null)}
              className="w-full py-2 bg-gray-100 text-xs font-bold rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
