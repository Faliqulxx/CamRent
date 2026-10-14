'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  CreditCard,
  Send,
  ArrowRight,
  Store,
  AlertCircle,
  Copy,
  Check,
  Building2,
  Phone,
  Wallet,
  Smartphone,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, startDate, endDate, rentalDays, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  // Form states
  const [fullName, setFullName] = useState(user?.name || 'Dimas Pratama');
  const [phone, setPhone] = useState(user?.customer?.phone || '081298765432');
  const [address, setAddress] = useState(user?.customer?.address || 'Jl. Martadinata No. 15, Gresik, Jawa Timur');
  const [collateralType, setCollateralType] = useState('KTP');
  const [notes, setNotes] = useState('');

  // Sync form if user logs in or switches
  useEffect(() => {
    if (user) {
      if (user.name) setFullName(user.name);
      if (user.customer?.phone) setPhone(user.customer.phone);
      if (user.customer?.address) setAddress(user.customer.address);
    }
  }, [user]);

  // Payment Option & DP Calculation (PRD & User Request)
  // DP hanya berlaku jika total sewa > 80.000 dengan minimal 50%
  const canUseDp = subtotal > 80000;
  const minDp = Math.ceil(subtotal * 0.5);
  const [paymentOption, setPaymentOption] = useState<'FULL' | 'DP'>('FULL');
  const [dpPreset, setDpPreset] = useState<'50' | '75' | 'CUSTOM'>('50');
  const [customDpValue, setCustomDpValue] = useState<number>(minDp);

  const activeDpAmount = paymentOption === 'DP'
    ? (dpPreset === '50' ? minDp : dpPreset === '75' ? Math.ceil(subtotal * 0.75) : customDpValue)
    : 0;
  const remainingAtStore = paymentOption === 'DP' ? Math.max(0, subtotal - activeDpAmount) : 0;
  const transferAmountNow = paymentOption === 'DP' ? activeDpAmount : subtotal;

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedRental, setCompletedRental] = useState<any>(null);
  const [copiedBank, setCopiedBank] = useState(false);

  // Store Settings (Bank, DANA, GoPay, WhatsApp)
  const [selectedChannel, setSelectedChannel] = useState<'BCA' | 'DANA' | 'GOPAY'>('BCA');
  const [storeSettings, setStoreSettings] = useState<Record<string, string>>({
    bank_name: process.env.NEXT_PUBLIC_BANK_NAME || 'BCA',
    bank_account: process.env.NEXT_PUBLIC_BANK_ACCOUNT || '8735123456',
    bank_holder: process.env.NEXT_PUBLIC_BANK_HOLDER || 'CampRent Outdoor Indonesia',
    bank_active: 'true',
    dana_number: '081298765432',
    dana_holder: 'CampRent Adventure DANA',
    dana_active: 'true',
    gopay_number: '081298765432',
    gopay_holder: 'CampRent Adventure GoPay',
    gopay_active: 'true',
    whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '6281234567890',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setStoreSettings((prev) => ({ ...prev, ...data }));
          if (data.bank_active !== 'false') {
            setSelectedChannel('BCA');
          } else if (data.dana_active === 'true') {
            setSelectedChannel('DANA');
          } else if (data.gopay_active === 'true') {
            setSelectedChannel('GOPAY');
          }
        }
      })
      .catch((err) => console.error('Failed to load store settings:', err));
  }, []);

  const storeWhatsApp = storeSettings['whatsapp_number'] || '6281234567890';

  const getChannelInfo = (channel: 'BCA' | 'DANA' | 'GOPAY') => {
    switch (channel) {
      case 'DANA':
        return {
          name: 'E-Wallet DANA',
          type: 'E-Wallet DANA',
          account: storeSettings['dana_number'] || '081298765432',
          holder: storeSettings['dana_holder'] || 'CampRent Adventure DANA',
          badgeBg: 'bg-blue-50 text-blue-600 border-blue-200',
          activeColor: 'border-blue-500 bg-blue-50/40 text-blue-700',
          iconColor: 'bg-[#118EEA]',
        };
      case 'GOPAY':
        return {
          name: 'E-Wallet GoPay',
          type: 'E-Wallet GoPay',
          account: storeSettings['gopay_number'] || '081298765432',
          holder: storeSettings['gopay_holder'] || 'CampRent Adventure GoPay',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          activeColor: 'border-[#00AA13] bg-emerald-50/40 text-emerald-800',
          iconColor: 'bg-[#00AA13]',
        };
      default:
        return {
          name: `Bank ${storeSettings['bank_name'] || 'BCA'}`,
          type: 'Transfer Bank (BCA)',
          account: storeSettings['bank_account'] || '8735123456',
          holder: storeSettings['bank_holder'] || 'CampRent Outdoor Indonesia',
          badgeBg: 'bg-accent-mint text-primary border-primary/20',
          activeColor: 'border-primary bg-accent-mint/30 text-primary',
          iconColor: 'bg-primary',
        };
    }
  };

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/rentals/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          address,
          collateralType,
          notes,
          startDate,
          endDate,
          items,
          userId: user?.id || null,
          paymentType: paymentOption,
          paymentMethod: selectedChannel,
          customDpAmount: paymentOption === 'DP' ? activeDpAmount : undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error || 'Terjadi kesalahan saat checkout.');
        setIsSubmitting(false);
        return;
      }

      setCompletedRental(data.rental);
      clearCart();
    } catch (err: any) {
      setErrorMessage(err.message || 'Koneksi gagal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateWhatsAppUrl = () => {
    if (!completedRental) return '';
    const itemListStr = items.length > 0
      ? items.map((i) => `• ${i.name} (${i.quantity}x)`).join('%0A')
      : 'Peralatan Camping';

    const currentChannel = (completedRental.paymentMethod as 'BCA' | 'DANA' | 'GOPAY') || selectedChannel;
    const channelInfo = getChannelInfo(currentChannel);

    const isDp = completedRental.paymentType === 'DP';
    const paymentDetailText = isDp
      ? `*Skema Pembayaran:* DP (Uang Muka)%0A` +
        `*Nominal Transfer DP:* ${formatCurrency(completedRental.transferAmount || completedRental.dpAmount)}%0A` +
        `*Sisa Pelunasan di Toko:* ${formatCurrency(completedRental.remainingAmount)} (Dibayar saat Pickup di Kasir Toko)%0A`
      : `*Skema Pembayaran:* Bayar Lunas (100%)%0A` +
        `*Nominal Transfer:* ${formatCurrency(completedRental.total)}%0A`;

    const message = `Halo Admin CampRent, saya ingin konfirmasi pemesanan sewa peralatan:%0A%0A` +
      `*No. Booking:* ${completedRental.code}%0A` +
      `*Nama Penyewa:* ${fullName}%0A` +
      `*Peralatan:*%0A${itemListStr}%0A` +
      `*Tanggal Sewa:* ${formatDate(startDate)} s/d ${formatDate(endDate)} (${rentalDays} hari)%0A` +
      `*Total Biaya Sewa:* ${formatCurrency(completedRental.total)}%0A` +
      paymentDetailText +
      `*Metode Pembayaran:* ${channelInfo.type} (${channelInfo.account} a/n ${channelInfo.holder})%0A` +
      `*Jaminan Fisik:* ${collateralType} Asli (Diserahkan saat pickup)%0A%0A` +
      `Berikut saya lampirkan bukti transfer pembayaran untuk diverifikasi admin. Terima kasih!`;

    return `https://wa.me/${storeWhatsApp}?text=${message}`;
  };

  // 1. Success Screen (PRD 6.5)
  if (completedRental) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl border border-border p-6 sm:p-10 shadow-xl space-y-6 sm:space-y-8 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full uppercase tracking-wider inline-block">
              Menunggu Pembayaran Transfer
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-text mt-3">
              Pemesanan Berhasil Dibuat!
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-2 max-w-lg mx-auto">
              Ketersediaan peralatan Anda telah <b className="text-primary">dikunci</b>. Silakan transfer dan kirimkan bukti pembayaran ke WhatsApp toko.
            </p>
          </div>

          {/* Booking Code Card */}
          <div className="p-4 sm:p-5 bg-accent-mint/40 rounded-2xl border border-primary/20 text-center">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">
              Nomor Booking Resmi Anda:
            </span>
            <span className="text-2xl sm:text-3xl font-black text-primary tracking-wide block mt-1">
              {completedRental.code}
            </span>
            <span className="text-xs text-text-muted block mt-1">
              Jadwal Pickup: <b>{formatDate(startDate)}</b> di Toko CampRent Gresik
            </span>
          </div>

          {/* Payment Destination (Bank, DANA, GoPay) Information */}
          {(() => {
            const currentChannel = (completedRental.paymentMethod as 'BCA' | 'DANA' | 'GOPAY') || selectedChannel;
            const channelInfo = getChannelInfo(currentChannel);

            return (
              <div className="bg-gray-50 rounded-2xl border border-border p-4 sm:p-5 text-left space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text">
                    {currentChannel === 'BCA' ? (
                      <Building2 className="w-4 h-4 text-primary" />
                    ) : (
                      <Wallet className="w-4 h-4 text-primary" />
                    )}
                    <span>Instruksi Transfer: {channelInfo.name}</span>
                  </div>

                  {/* Channel Switcher */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    {storeSettings['bank_active'] !== 'false' && (
                      <button
                        type="button"
                        onClick={() => {
                          setCompletedRental((prev: any) => ({ ...prev, paymentMethod: 'BCA' }));
                          setSelectedChannel('BCA');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                          currentChannel === 'BCA' ? 'bg-primary text-white border-primary' : 'bg-white text-text-muted border-border hover:bg-gray-100'
                        }`}
                      >
                        BCA
                      </button>
                    )}
                    {storeSettings['dana_active'] !== 'false' && (
                      <button
                        type="button"
                        onClick={() => {
                          setCompletedRental((prev: any) => ({ ...prev, paymentMethod: 'DANA' }));
                          setSelectedChannel('DANA');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                          currentChannel === 'DANA' ? 'bg-[#118EEA] text-white border-[#118EEA]' : 'bg-white text-text-muted border-border hover:bg-gray-100'
                        }`}
                      >
                        DANA
                      </button>
                    )}
                    {storeSettings['gopay_active'] !== 'false' && (
                      <button
                        type="button"
                        onClick={() => {
                          setCompletedRental((prev: any) => ({ ...prev, paymentMethod: 'GOPAY' }));
                          setSelectedChannel('GOPAY');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                          currentChannel === 'GOPAY' ? 'bg-[#00AA13] text-white border-[#00AA13]' : 'bg-white text-text-muted border-border hover:bg-gray-100'
                        }`}
                      >
                        GoPay
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${channelInfo.iconColor} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs`}>
                      {currentChannel === 'BCA' ? 'B' : currentChannel === 'DANA' ? 'D' : 'G'}
                    </div>
                    <div>
                      <span className="text-xs text-text-muted block">{channelInfo.type}</span>
                      <span className="text-xl font-black text-text tracking-wider">{channelInfo.account}</span>
                      <span className="text-xs text-text-muted block mt-0.5">a/n {channelInfo.holder}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyAccount(channelInfo.account)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-text transition-colors self-start sm:self-auto active:scale-95"
                  >
                    {copiedBank ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedBank ? 'Tersalin' : 'Salin Nomor'}</span>
                  </button>
                </div>

                {completedRental.paymentType === 'DP' ? (
                  <div className="space-y-2 pt-2 border-t border-border/80 text-xs">
                    <div className="flex items-center justify-between text-text-muted">
                      <span>Total Nilai Sewa:</span>
                      <span className="font-bold text-text">{formatCurrency(completedRental.total)}</span>
                    </div>
                    <div className="flex items-center justify-between text-emerald-700 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                      <span className="font-bold">Nominal Transfer DP (Sekarang):</span>
                      <span className="text-base font-black">
                        {formatCurrency(completedRental.transferAmount || completedRental.dpAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-text p-2.5 bg-gray-100 rounded-xl">
                      <span className="font-semibold text-text-muted">Sisa Pelunasan di Toko:</span>
                      <span className="font-black text-text">
                        {formatCurrency(completedRental.remainingAmount)}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted pt-1 text-center">
                      ℹ️ Sisa pelunasan sebesar <b>{formatCurrency(completedRental.remainingAmount)}</b> dibayarkan secara tunai / QRIS saat Anda datang mengambil peralatan di toko.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="text-text-muted">Total Jumlah Transfer:</span>
                    <span className="text-lg font-black text-primary">
                      {formatCurrency(completedRental.total)}
                    </span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* WhatsApp Direct Action Button */}
          <div className="space-y-3 pt-2">
            <a
              href={generateWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 min-h-[50px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 group active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Kirim Konfirmasi via WhatsApp Toko</span>
            </a>

            <p className="text-[11px] text-text-muted">
              Setelah bukti transfer dikirim via WhatsApp, staf toko akan memverifikasi dan pesanan siap diambil.
            </p>
          </div>

          {/* Secondary Actions */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-bold">
            <Link
              href="/account/rentals"
              className="text-primary hover:text-primary-dark underline py-2 min-h-[44px] flex items-center"
            >
              Lihat Detail di Halaman My Rental →
            </Link>
            <span className="hidden sm:inline text-border">|</span>
            <Link
              href="/catalog"
              className="text-text-muted hover:text-text py-2 min-h-[44px] flex items-center"
            >
              Kembali ke Katalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Checkout Form
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-text">Keranjang Kosong</h2>
        <p className="text-xs text-text-muted">Tidak ada item untuk di-checkout.</p>
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] bg-primary text-white text-xs font-bold rounded-xl"
        >
          <span>Pilih Peralatan</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-28 md:pb-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight">
          Informasi Pemesanan & Checkout
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Lengkapi data penyewa dan pilih jenis jaminan identitas asli yang akan dibawa saat pengambilan barang di toko.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmitBooking} id="checkout-form" className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left 2 Cols: Form Data Penyewa */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-border p-5 sm:p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-sm text-text pb-3 border-b border-border flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Data Penyewa (Sesuai Kartu Identitas)
            </h3>

            {/* Nama Lengkap: text-base on mobile to avoid iOS Safari auto-zoom */}
            <div>
              <label className="block text-xs font-bold text-text mb-1">
                Nama Lengkap Sesuai Kartu Identitas *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Dimas Pratama"
                className="w-full px-3.5 py-3 min-h-[44px] bg-gray-50 border border-border rounded-xl text-base md:text-xs font-semibold text-text outline-none focus:border-primary focus:bg-white"
              />
            </div>

            {/* Nomor WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-text mb-1">
                Nomor WhatsApp Aktif *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08123456789"
                className="w-full px-3.5 py-3 min-h-[44px] bg-gray-50 border border-border rounded-xl text-base md:text-xs font-semibold text-text outline-none focus:border-primary focus:bg-white"
              />
              <span className="text-[11px] text-text-muted mt-1 block">
                Digunakan untuk konfirmasi dan notifikasi status rental via WhatsApp.
              </span>
            </div>

            {/* Alamat Domisili */}
            <div>
              <label className="block text-xs font-bold text-text mb-1">
                Alamat Tempat Tinggal / Domisili *
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Martadinata No. 15, Gresik, Jawa Timur"
                className="w-full px-3.5 py-3 min-h-[44px] bg-gray-50 border border-border rounded-xl text-base md:text-xs font-semibold text-text outline-none focus:border-primary focus:bg-white resize-none"
              />
            </div>

            {/* Jenis Jaminan */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-text mb-2">
                Pilih Jenis Jaminan Fisik Asli yang Dititipkan Saat Pickup *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['KTP', 'SIM', 'KTM', 'Kartu Pelajar'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCollateralType(type)}
                    className={`py-3 px-3 min-h-[44px] rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center active:scale-95 ${
                      collateralType === type
                        ? 'border-primary bg-accent-mint/60 text-primary shadow-xs'
                        : 'border-border bg-gray-50 text-text hover:bg-gray-100'
                    }`}
                  >
                    {type} Asli
                  </button>
                ))}
              </div>
              <div className="mt-3 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2.5 leading-relaxed">
                <Store className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <b>Ketentuan Jaminan:</b> Jaminan identitas fisik asli wajib diserahkan di kasir toko saat mengambil peralatan (Pickup). Jaminan akan disimpan aman di brankas toko dan <b>dikembalikan saat pengembalian barang</b> setelah kondisi diinspeksi. Tidak ada biaya deposit uang muka.
                </span>
              </div>
            </div>

            {/* Skema Pembayaran (Bayar Lunas / DP) */}
            <div className="pt-2 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-text">
                  Pilih Skema Pembayaran *
                </label>
                {canUseDp ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Opsi DP Tersedia (&gt; Rp80.000)
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-text-muted bg-gray-100 border border-border px-2 py-0.5 rounded-full">
                    DP Khusus Sewa &gt; Rp80.000
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Opsi Bayar Penuh */}
                <div
                  onClick={() => setPaymentOption('FULL')}
                  className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentOption === 'FULL'
                      ? 'border-primary bg-accent-mint/30 ring-2 ring-primary/20 shadow-xs'
                      : 'border-border bg-gray-50/60 hover:bg-gray-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text">Bayar Lunas (100%)</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentOption === 'FULL' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                      {paymentOption === 'FULL' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <div className="text-primary font-black text-sm mt-1.5">
                    {formatCurrency(subtotal)}
                  </div>
                  <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                    Transfer penuh sekarang. Bebas repot saat tiba di toko, tinggal serah terima barang & jaminan.
                  </p>
                </div>

                {/* Opsi Bayar DP */}
                <div
                  onClick={() => {
                    if (canUseDp) {
                      setPaymentOption('DP');
                    }
                  }}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    !canUseDp
                      ? 'border-dashed border-gray-200 bg-gray-50/40 opacity-60 cursor-not-allowed'
                      : paymentOption === 'DP'
                      ? 'border-primary bg-accent-mint/30 ring-2 ring-primary/20 shadow-xs cursor-pointer'
                      : 'border-border bg-gray-50/60 hover:bg-gray-100/60 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text">Bayar DP (Uang Muka)</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentOption === 'DP' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                      {paymentOption === 'DP' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <div className="text-emerald-700 font-black text-sm mt-1.5">
                    {canUseDp ? `Mulai ${formatCurrency(minDp)}` : 'Tidak Tersedia'}
                  </div>
                  <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                    {canUseDp
                      ? 'Kunci booking dengan DP min. 50%. Sisa pelunasan dibayar di kasir toko saat ambil barang.'
                      : 'Hanya berlaku untuk total sewa lebih dari Rp80.000.'}
                  </p>
                </div>
              </div>

              {/* Sub-selector DP (Persentase / Custom) */}
              {canUseDp && paymentOption === 'DP' && (
                <div className="p-4 bg-gray-50 border border-primary/20 rounded-2xl space-y-3 animate-in fade-in-50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-text">Pilih Porsi Uang Muka (DP):</span>
                    <span className="text-text-muted font-medium text-[11px]">Minimal 50% ({formatCurrency(minDp)})</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDpPreset('50');
                        setCustomDpValue(minDp);
                      }}
                      className={`py-2 px-2.5 min-h-[44px] rounded-xl border text-xs font-bold transition-all ${
                        dpPreset === '50'
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-white text-text border-border hover:bg-gray-100'
                      }`}
                    >
                      50% (Minimal)
                      <span className="block text-[10px] font-normal opacity-90">{formatCurrency(minDp)}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDpPreset('75');
                        setCustomDpValue(Math.ceil(subtotal * 0.75));
                      }}
                      className={`py-2 px-2.5 min-h-[44px] rounded-xl border text-xs font-bold transition-all ${
                        dpPreset === '75'
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-white text-text border-border hover:bg-gray-100'
                      }`}
                    >
                      75%
                      <span className="block text-[10px] font-normal opacity-90">{formatCurrency(Math.ceil(subtotal * 0.75))}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDpPreset('CUSTOM')}
                      className={`py-2 px-2.5 min-h-[44px] rounded-xl border text-xs font-bold transition-all ${
                        dpPreset === 'CUSTOM'
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-white text-text border-border hover:bg-gray-100'
                      }`}
                    >
                      Nominal Bebas
                      <span className="block text-[10px] font-normal opacity-90">&gt; 50%</span>
                    </button>
                  </div>

                  {dpPreset === 'CUSTOM' && (
                    <div className="pt-1">
                      <label className="block text-[11px] font-bold text-text mb-1">
                        Masukkan Nominal DP (Rp):
                      </label>
                      <input
                        type="number"
                        min={minDp}
                        max={subtotal - 1000}
                        step={5000}
                        value={customDpValue}
                        onChange={(e) => setCustomDpValue(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 min-h-[44px] bg-white border border-border rounded-xl text-base md:text-xs font-bold text-text outline-none focus:border-primary"
                      />
                      <span className="text-[10px] text-text-muted mt-1 block">
                        Minimal Rp{minDp.toLocaleString('id-ID')} dan kurang dari total sewa Rp{subtotal.toLocaleString('id-ID')}.
                      </span>
                    </div>
                  )}

                  {/* Kalkulasi Rincian DP & Pelunasan Toko */}
                  <div className="p-3 bg-white rounded-xl border border-border/80 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-emerald-800 font-bold">
                      <span>Tagihan Transfer DP Sekarang:</span>
                      <span className="text-sm font-black text-emerald-700">{formatCurrency(activeDpAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-text-muted">
                      <span>Sisa Pelunasan di Toko (Saat Ambil Barang):</span>
                      <span className="font-bold text-text">{formatCurrency(remainingAtStore)}</span>
                    </div>
                    <p className="text-[10px] text-text-muted pt-1 border-t border-border/60">
                      ℹ️ Pelunasan sebesar <b>{formatCurrency(remainingAtStore)}</b> dibayarkan secara tunai / QRIS langsung di kasir toko saat Anda datang mengambil peralatan.
                    </p>
                  </div>
                </div>
              )}

              {/* Saluran Pembayaran (Bank BCA, DANA, GoPay) */}
              <div className="space-y-3 pt-3 border-t border-border/80">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-text">
                    Pilih Saluran Pembayaran (Transfer Bank & E-Wallet)
                  </label>
                  <span className="text-[10px] text-text-muted font-medium">Tersedia {storeSettings['dana_active'] !== 'false' && storeSettings['gopay_active'] !== 'false' ? '3 Metode' : 'Resmi'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Bank BCA */}
                  {storeSettings['bank_active'] !== 'false' && (
                    <button
                      type="button"
                      onClick={() => setSelectedChannel('BCA')}
                      className={`p-3.5 min-h-[44px] rounded-2xl border text-left transition-all ${
                        selectedChannel === 'BCA'
                          ? 'border-primary bg-accent-mint/30 ring-2 ring-primary/20 shadow-xs'
                          : 'border-border bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-[11px]">
                          B
                        </div>
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedChannel === 'BCA' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                          {selectedChannel === 'BCA' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <span className="font-bold text-xs text-text block">Transfer {storeSettings['bank_name'] || 'BCA'}</span>
                      <span className="text-[10px] text-text-muted block truncate mt-0.5">{storeSettings['bank_holder']}</span>
                    </button>
                  )}

                  {/* E-Wallet DANA */}
                  {storeSettings['dana_active'] !== 'false' && (
                    <button
                      type="button"
                      onClick={() => setSelectedChannel('DANA')}
                      className={`p-3.5 min-h-[44px] rounded-2xl border text-left transition-all ${
                        selectedChannel === 'DANA'
                          ? 'border-[#118EEA] bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs'
                          : 'border-border bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-6 h-6 rounded-lg bg-[#118EEA] text-white flex items-center justify-center font-black text-[11px]">
                          D
                        </div>
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedChannel === 'DANA' ? 'border-[#118EEA] bg-[#118EEA]' : 'border-gray-300'}`}>
                          {selectedChannel === 'DANA' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <span className="font-bold text-xs text-text block">E-Wallet DANA</span>
                      <span className="text-[10px] text-text-muted block truncate mt-0.5">{storeSettings['dana_holder']}</span>
                    </button>
                  )}

                  {/* E-Wallet GoPay */}
                  {storeSettings['gopay_active'] !== 'false' && (
                    <button
                      type="button"
                      onClick={() => setSelectedChannel('GOPAY')}
                      className={`p-3.5 min-h-[44px] rounded-2xl border text-left transition-all ${
                        selectedChannel === 'GOPAY'
                          ? 'border-[#00AA13] bg-emerald-50/40 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-border bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="w-6 h-6 rounded-lg bg-[#00AA13] text-white flex items-center justify-center font-black text-[11px]">
                          G
                        </div>
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectedChannel === 'GOPAY' ? 'border-[#00AA13] bg-[#00AA13]' : 'border-gray-300'}`}>
                          {selectedChannel === 'GOPAY' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                      <span className="font-bold text-xs text-text block">E-Wallet GoPay</span>
                      <span className="text-[10px] text-text-muted block truncate mt-0.5">{storeSettings['gopay_holder']}</span>
                    </button>
                  )}
                </div>

                {/* Selected Channel Preview */}
                {(() => {
                  const info = getChannelInfo(selectedChannel);
                  return (
                    <div className="p-3 bg-gray-50/80 rounded-xl border border-border flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[11px] text-text-muted block">Nomor Tujuan {info.name}:</span>
                        <span className="font-black text-text tracking-wider">{info.account}</span>
                        <span className="text-[10px] text-text-muted block mt-0.5">a/n {info.holder}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${info.badgeBg}`}>
                        {info.type}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Catatan Tambahan */}
            <div>
              <label className="block text-xs font-bold text-text mb-1">
                Catatan Khusus (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: Perkiraan jam pickup pukul 14.00 WIB"
                className="w-full px-3.5 py-3 min-h-[44px] bg-gray-50 border border-border rounded-xl text-base md:text-xs font-medium text-text outline-none focus:border-primary focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Dates & Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-border p-5 sm:p-6 shadow-sm space-y-5 sticky top-24">
            <h3 className="font-bold text-sm text-text pb-3 border-b border-border">
              Rincian Tanggal & Pesanan
            </h3>

            {/* Dates Pill */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Tanggal Pickup:</span>
                <span className="font-bold text-text">{formatDate(startDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Tanggal Kembali:</span>
                <span className="font-bold text-text">{formatDate(endDate)}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-border/80">
                <span className="text-text-muted">Durasi Sewa:</span>
                <span className="font-extrabold text-primary">{rentalDays} Hari</span>
              </div>
            </div>

            {/* Item list */}
            <div className="space-y-2 text-xs">
              {items.map((i) => (
                <div key={i.productId} className="flex items-center justify-between">
                  <span className="text-text truncate max-w-[170px]">
                    {i.quantity}x {i.name}
                  </span>
                  <span className="font-bold text-text">
                    {formatCurrency(i.pricePerDay * i.quantity * rentalDays)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total & Breakdown */}
            <div className="pt-3 border-t border-border space-y-2 text-xs">
              <div className="flex items-center justify-between text-text-muted">
                <span>Total Nilai Sewa:</span>
                <span className="font-bold text-text">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-text-muted">
                <span>Deposit Jaminan:</span>
                <span className="font-bold text-emerald-600">Rp0 ({collateralType} Asli)</span>
              </div>

              {paymentOption === 'DP' ? (
                <>
                  <div className="flex items-center justify-between text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 font-bold">
                    <span>Uang Muka (DP) Ditransfer:</span>
                    <span className="text-sm font-black">{formatCurrency(activeDpAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between text-text-muted px-1">
                    <span>Sisa di Kasir Toko:</span>
                    <span className="font-bold text-text">{formatCurrency(remainingAtStore)}</span>
                  </div>
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-text block">Transfer Sekarang:</span>
                      <span className="text-[10px] text-text-muted block">DP {Math.round((activeDpAmount / subtotal) * 100)}%</span>
                    </div>
                    <span className="text-xl font-black text-primary">
                      {formatCurrency(activeDpAmount)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-sm font-bold text-text">Total Pembayaran Penuh:</span>
                  <span className="text-xl font-black text-primary">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button (Desktop) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="hidden md:flex w-full py-3.5 min-h-[48px] bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-primary/25 items-center justify-center gap-2 active:scale-95"
            >
              {isSubmitting ? (
                <span>Memproses Pemesanan...</span>
              ) : (
                <>
                  <span>{paymentOption === 'DP' ? `Konfirmasi Pesan (DP ${formatCurrency(activeDpAmount)})` : 'Konfirmasi Pemesanan'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-text-muted text-center leading-relaxed">
              Dengan mengonfirmasi, Anda menyetujui syarat & ketentuan rental CampRent. Bukti transfer dikirim via WhatsApp.
            </p>
          </div>
        </div>
      </form>

      {/* Mobile Sticky Bottom Action Bar for Checkout */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border p-3.5 shadow-2xl flex items-center justify-between gap-3">
        <div>
          {paymentOption === 'DP' ? (
            <>
              <span className="text-[10px] text-emerald-700 font-bold block">DP Transfer Sekarang:</span>
              <span className="text-base font-black text-primary block leading-tight">
                {formatCurrency(activeDpAmount)}
              </span>
              <span className="text-[10px] text-text-muted block">
                Sisa di Toko: {formatCurrency(remainingAtStore)}
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] text-text-muted block">Total Biaya Penuh:</span>
              <span className="text-base font-black text-primary block leading-tight">
                {formatCurrency(subtotal)}
              </span>
              <span className="text-[10px] text-text-muted block">
                Jaminan: {collateralType} Asli
              </span>
            </>
          )}
        </div>

        <button
          type="submit"
          form="checkout-form"
          disabled={isSubmitting}
          className="px-5 py-3 min-h-[48px] bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2 active:scale-95 shrink-0"
        >
          {isSubmitting ? (
            <span>Memproses...</span>
          ) : (
            <>
              <span>{paymentOption === 'DP' ? 'Bayar DP' : 'Konfirmasi'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
