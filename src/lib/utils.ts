import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number to Indonesian Rupiah (e.g. Rp75.000)
 */
export function formatCurrency(amount: number): string {
  return 'Rp' + amount.toLocaleString('id-ID');
}

/**
 * Format Date to Indonesian format (e.g. 18 Okt 2026)
 */
export function formatDate(date: Date | string | null | undefined, pattern: string = 'dd MMM yyyy'): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: id });
}

/**
 * Status color mappings conforming to PRD Section 5.1
 * Confirmed / Completed / Available / Pickup: Hijau
 * Returned: Biru
 * Waiting / Pending / Maintenance: Oranye/Kuning
 * Cancelled / Booked / Overdue: Merah
 */
export function getStatusBadgeStyle(status: string): { bg: string; text: string; border: string; label: string } {
  switch (status.toUpperCase()) {
    case 'AVAILABLE':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Tersedia' };
    case 'CONFIRMED':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Dikonfirmasi' };
    case 'READY_FOR_PICKUP':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', label: 'Siap Pickup' };
    case 'RENTED':
      return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200', label: 'Disewa' };
    case 'RETURNING':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Pengembalian' };
    case 'COMPLETED':
      return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Selesai' };
    case 'RETURNED':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'Dikembalikan' };
    case 'WAITING_PAYMENT':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Menunggu Pembayaran' };
    case 'PENDING':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Pending' };
    case 'CLEANING':
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', label: 'Pembersihan' };
    case 'MAINTENANCE':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'Maintenance' };
    case 'OVERDUE':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', label: 'Terlambat' };
    case 'CANCELLED':
      return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Dibatalkan' };
    case 'RESERVED':
      return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Direservasi' };
    case 'INACTIVE':
      return { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', label: 'Non-aktif' };
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', label: status };
  }
}
