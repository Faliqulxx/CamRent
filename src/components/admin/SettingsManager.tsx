'use client';

import React, { useState } from 'react';
import {
  Settings,
  Save,
  Check,
  Store,
  Phone,
  CreditCard,
  Shield,
  Users,
  Wallet,
  Smartphone,
  AlertCircle,
  Building2,
  MapPin,
  Mail,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { parseGoogleMapsUrl } from '@/lib/maps';

interface SettingsProps {
  initialSettings: Record<string, string>;
  staffList: { id: string; name: string; email: string; role: string }[];
}

export default function SettingsManager({ initialSettings, staffList }: SettingsProps) {
  // Store identity & Location
  const [storeName, setStoreName] = useState(initialSettings['store_name'] || 'CampRent Adventure Rental Bandung');
  const [whatsapp, setWhatsapp] = useState(initialSettings['whatsapp_number'] || '+62 812-3456-7890');
  const [storeAddress, setStoreAddress] = useState(initialSettings['store_address'] || 'Jl. Riau No. 45, Bandung, Jawa Barat (Pickup Langsung di Toko)');
  const [storeEmail, setStoreEmail] = useState(initialSettings['store_email'] || 'info@camprent.id');
  const [storeHours, setStoreHours] = useState(initialSettings['store_hours'] || 'Buka Setiap Hari: 08.00 – 21.00 WIB');
  const [gmapsUrl, setGmapsUrl] = useState(
    initialSettings['gmaps_url'] || initialSettings['gmaps_embed_url'] || ''
  );
  const [customEmbedUrl, setCustomEmbedUrl] = useState(initialSettings['gmaps_embed_url'] || '');
  const [isResolvingMap, setIsResolvingMap] = useState(false);

  const activeMapData = React.useMemo(() => {
    const parsed = parseGoogleMapsUrl(gmapsUrl, storeAddress);
    if (customEmbedUrl && (gmapsUrl.includes('maps.app.goo.gl') || gmapsUrl.includes('goo.gl/maps'))) {
      return { ...parsed, embedUrl: customEmbedUrl };
    }
    return parsed;
  }, [gmapsUrl, storeAddress, customEmbedUrl]);

  React.useEffect(() => {
    const trimmed = (gmapsUrl || '').trim();
    if (trimmed && (trimmed.includes('maps.app.goo.gl') || trimmed.includes('goo.gl/maps'))) {
      setIsResolvingMap(true);
      fetch('/api/settings/resolve-maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed, address: storeAddress }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success && data?.embedUrl) {
            setCustomEmbedUrl(data.embedUrl);
          }
        })
        .catch((err) => console.warn(err))
        .finally(() => setIsResolvingMap(false));
    } else {
      setCustomEmbedUrl('');
    }
  }, [gmapsUrl, storeAddress]);

  // Standard penalty fees
  const [lateFee, setLateFee] = useState(initialSettings['late_fee_per_day'] || '50000');
  const [cleaningFee, setCleaningFee] = useState(initialSettings['cleaning_fee_default'] || '25000');

  // Bank BCA
  const [bankName, setBankName] = useState(initialSettings['bank_name'] || 'BCA');
  const [bankAccount, setBankAccount] = useState(initialSettings['bank_account'] || '8735123456');
  const [bankHolder, setBankHolder] = useState(initialSettings['bank_holder'] || 'CampRent Outdoor Indonesia');
  const [bankActive, setBankActive] = useState(initialSettings['bank_active'] !== 'false');

  // E-Wallet DANA
  const [danaNumber, setDanaNumber] = useState(initialSettings['dana_number'] || '081298765432');
  const [danaHolder, setDanaHolder] = useState(initialSettings['dana_holder'] || 'CampRent Adventure DANA');
  const [danaActive, setDanaActive] = useState(initialSettings['dana_active'] !== 'false');

  // E-Wallet GoPay
  const [gopayNumber, setGopayNumber] = useState(initialSettings['gopay_number'] || '081298765432');
  const [gopayHolder, setGopayHolder] = useState(initialSettings['gopay_holder'] || 'CampRent Adventure GoPay');
  const [gopayActive, setGopayActive] = useState(initialSettings['gopay_active'] !== 'false');

  // Action status
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: storeName,
          whatsapp_number: whatsapp,
          store_address: storeAddress,
          store_email: storeEmail,
          store_hours: storeHours,
          gmaps_url: gmapsUrl,
          gmaps_embed_url: activeMapData.embedUrl,
          late_fee_per_day: lateFee,
          cleaning_fee_default: cleaningFee,
          bank_name: bankName,
          bank_account: bankAccount,
          bank_holder: bankHolder,
          bank_active: bankActive ? 'true' : 'false',
          dana_number: danaNumber,
          dana_holder: danaHolder,
          dana_active: danaActive ? 'true' : 'false',
          gopay_number: gopayNumber,
          gopay_holder: gopayHolder,
          gopay_active: gopayActive ? 'true' : 'false',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Gagal menyimpan pengaturan toko.');
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Pengaturan Toko & Metode Pembayaran
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          Atur informasi kontak bisnis, nomor WhatsApp reservasi, rekening transfer bank, serta e-wallet DANA & GoPay resmi toko.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pengaturan toko & metode pembayaran (Bank, DANA, GoPay) berhasil diperbarui dan tersimpan di database!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identitas Bisnis & WhatsApp */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-text pb-3 border-b border-border flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" />
            Identitas Toko & Nomor WhatsApp
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-text mb-1">Nama Usaha / Toko:</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-border rounded-xl font-bold text-text outline-none focus:border-primary focus:bg-white text-base md:text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-text mb-1">Nomor WhatsApp Reservasi Toko:</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+62 812-3456-7890"
                className="w-full p-2.5 bg-gray-50 border border-border rounded-xl font-bold text-text outline-none focus:border-primary focus:bg-white text-base md:text-xs"
              />
            </div>
          </div>
        </div>

        {/* LOKASI TOKO & GOOGLE MAPS (PICKUP LANGSUNG) */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="font-bold text-sm text-text flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Lokasi Toko, Alamat Pickup & Google Maps
            </h3>
            <span className="text-[10px] text-text-muted font-bold px-2 py-0.5 rounded bg-gray-100">
              Tampil di Tentang Kami & Footer
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-text mb-1">
                Alamat Lengkap Toko & Tempat Pickup Barang:
              </label>
              <textarea
                rows={2}
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                placeholder="Jl. Riau No. 45, Bandung, Jawa Barat (Pickup Langsung di Toko)"
                className="w-full p-2.5 bg-gray-50 border border-border rounded-xl font-bold text-text outline-none focus:border-primary focus:bg-white text-base md:text-xs"
              />
              <span className="text-[11px] text-text-muted mt-1 block">
                Alamat ini akan ditampilkan di Footer, section Tentang Kami, bukti booking, dan pesan WhatsApp.
              </span>
            </div>

            <div>
              <label className="block font-bold text-text mb-1">Email Resmi Toko:</label>
              <input
                type="email"
                value={storeEmail}
                onChange={(e) => setStoreEmail(e.target.value)}
                placeholder="info@camprent.id"
                className="w-full p-2.5 bg-gray-50 border border-border rounded-xl font-bold text-text outline-none focus:border-primary focus:bg-white text-base md:text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-text mb-1">Jam Operasional Toko:</label>
              <input
                type="text"
                value={storeHours}
                onChange={(e) => setStoreHours(e.target.value)}
                placeholder="Buka Setiap Hari: 08.00 – 21.00 WIB"
                className="w-full p-2.5 bg-gray-50 border border-border rounded-xl font-bold text-text outline-none focus:border-primary focus:bg-white text-base md:text-xs"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="block font-bold text-text">
                  Link Google Maps Toko (Bisa dari Link Share, Browser, atau Embed):
                </label>
                {activeMapData.isCustom && (
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 self-start sm:self-auto flex items-center gap-1">
                    {isResolvingMap ? (
                      <>
                        <span className="animate-spin text-xs">⏳</span>
                        <span>Mendeteksi link share...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{activeMapData.label || 'Link Valid'}</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              <input
                type="text"
                value={gmapsUrl}
                onChange={(e) => setGmapsUrl(e.target.value)}
                placeholder="Paste link Google Maps di sini (contoh: https://maps.app.goo.gl/... atau https://www.google.com/maps/place/... atau kode <iframe>)"
                className="w-full p-2.5 bg-gray-50 border border-border rounded-xl font-medium text-text outline-none focus:border-primary focus:bg-white text-base md:text-xs"
              />

              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1 text-[11px] text-text-muted">
                <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Mendukung semua format link dari Google Maps:</span>
                </p>
                <ul className="list-disc pl-4 space-y-0.5 text-emerald-900/80">
                  <li><strong>Aplikasi Google Maps di HP:</strong> Buka lokasi toko &gt; ketuk <strong>Bagikan / Share</strong> &gt; <strong>Salin Link</strong> &gt; tempelkan langsung di sini.</li>
                  <li><strong>Browser Laptop/PC:</strong> Salin URL address bar Google Maps atau menu <em>Sematkan Peta (iframe)</em>.</li>
                  <li><strong>Otomatis:</strong> Jika dikosongkan, peta akan dibuat otomatis dari alamat toko di atas.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Map Preview */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-text-muted text-[11px] block">Preview Peta Google Maps Toko:</span>
              <a
                href={activeMapData.directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-dark font-bold text-[11px] flex items-center gap-1"
              >
                <span>Buka Rute di Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="rounded-xl overflow-hidden border border-border h-56 w-full bg-gray-100 relative">
              <iframe
                title="Preview Google Maps"
                src={activeMapData.embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>
        </div>

        {/* METODE PEMBAYARAN 1: REKENING BANK TRANSFER (BCA / Lainnya) */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="font-bold text-sm text-text flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Rekening Bank Transfer (BCA)
            </h3>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={bankActive}
                onChange={(e) => setBankActive(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-4 w-4"
              />
              <span className={`font-bold text-xs ${bankActive ? 'text-primary' : 'text-text-muted'}`}>
                {bankActive ? 'Aktif' : 'Nonaktif'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-text mb-1">Nama Bank:</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                disabled={!bankActive}
                className="w-full p-2.5 bg-gray-50 border border-border rounded-xl font-bold text-text outline-none focus:border-primary focus:bg-white disabled:opacity-50 text-base md:text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-text mb-1">Nomor Rekening:</label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                disabled={!bankActive}
                className="w-full p-2.5 bg-gray-50 border border-border rounded-xl font-black text-text tracking-wider outline-none focus:border-primary focus:bg-white disabled:opacity-50 text-base md:text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-text mb-1">Atas Nama Pemilik Rekening:</label>
              <input
                type="text"
                value={bankHolder}
                onChange={(e) => setBankHolder(e.target.value)}
                disabled={!bankActive}
                className="w-full p-2.5 bg-gray-50 border border-border rounded-xl font-bold text-text outline-none focus:border-primary focus:bg-white disabled:opacity-50 text-base md:text-xs"
              />
            </div>
          </div>
        </div>

        {/* METODE PEMBAYARAN 2: E-WALLET DANA */}
        <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm space-y-4 text-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#118EEA]" />
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                D
              </div>
              <div>
                <h3 className="font-bold text-sm text-text flex items-center gap-1.5">
                  <span>Pembayaran E-Wallet DANA</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                    DANA Official
                  </span>
                </h3>
                <span className="text-[11px] text-text-muted">Menerima transfer saldo langsung antar akun DANA</span>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none bg-blue-50/60 px-3 py-1.5 rounded-xl border border-blue-200/80">
              <input
                type="checkbox"
                checked={danaActive}
                onChange={(e) => setDanaActive(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className={`font-bold text-xs ${danaActive ? 'text-blue-700' : 'text-text-muted'}`}>
                {danaActive ? 'DANA Aktif' : 'DANA Nonaktif'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-text mb-1">
                Nomor Akun DANA (No. Handphone):
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={danaNumber}
                  onChange={(e) => setDanaNumber(e.target.value)}
                  disabled={!danaActive}
                  placeholder="08xxxxxxxxxx"
                  className="w-full p-2.5 bg-gray-50 border border-border rounded-xl font-black text-text tracking-wider outline-none focus:border-blue-500 focus:bg-white disabled:opacity-50 text-base md:text-xs"
                />
              </div>
              <span className="text-[11px] text-text-muted mt-1 block">
                Nomor HP yang terdaftar pada akun bisnis/personal DANA toko.
              </span>
            </div>

            <div>
              <label className="block font-bold text-text mb-1">
                Atas Nama Akun DANA:
              </label>
              <input
                type="text"
                value={danaHolder}
                onChange={(e) => setDanaHolder(e.target.value)}
                disabled={!danaActive}
                placeholder="Contoh: CampRent Official"
                className="w-full p-2.5 bg-gray-50 border border-border rounded-xl font-bold text-text outline-none focus:border-blue-500 focus:bg-white disabled:opacity-50 text-base md:text-xs"
              />
              <span className="text-[11px] text-text-muted mt-1 block">
                Nama profil yang muncul saat pelanggan mencari akun DANA Anda.
              </span>
            </div>
          </div>
        </div>

        {/* METODE PEMBAYARAN 3: E-WALLET GOPAY */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm space-y-4 text-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#00AA13]" />
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#00AA13] text-white flex items-center justify-center font-black text-xs shadow-xs">
                G
              </div>
              <div>
                <h3 className="font-bold text-sm text-text flex items-center gap-1.5">
                  <span>Pembayaran E-Wallet GoPay</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    GoPay Official
                  </span>
                </h3>
                <span className="text-[11px] text-text-muted">Menerima transfer instan saldo GoPay / Gojek</span>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none bg-emerald-50/60 px-3 py-1.5 rounded-xl border border-emerald-200/80">
              <input
                type="checkbox"
                checked={gopayActive}
                onChange={(e) => setGopayActive(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
              />
              <span className={`font-bold text-xs ${gopayActive ? 'text-emerald-700' : 'text-text-muted'}`}>
                {gopayActive ? 'GoPay Aktif' : 'GoPay Nonaktif'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-text mb-1">
                Nomor Akun GoPay (No. Handphone):
              </label>
              <input
                type="text"
                value={gopayNumber}
                onChange={(e) => setGopayNumber(e.target.value)}
                disabled={!gopayActive}
                placeholder="08xxxxxxxxxx"
                className="w-full p-2.5 bg-gray-50 border border-border rounded-xl font-black text-text tracking-wider outline-none focus:border-emerald-500 focus:bg-white disabled:opacity-50 text-base md:text-xs"
              />
              <span className="text-[11px] text-text-muted mt-1 block">
                Nomor HP akun GoPay/Gojek penerima transfer pembayaran.
              </span>
            </div>

            <div>
              <label className="block font-bold text-text mb-1">
                Atas Nama Akun GoPay:
              </label>
              <input
                type="text"
                value={gopayHolder}
                onChange={(e) => setGopayHolder(e.target.value)}
                disabled={!gopayActive}
                placeholder="Contoh: CampRent Official"
                className="w-full p-2.5 bg-gray-50 border border-border rounded-xl font-bold text-text outline-none focus:border-emerald-500 focus:bg-white disabled:opacity-50 text-base md:text-xs"
              />
              <span className="text-[11px] text-text-muted mt-1 block">
                Nama profil pemilik akun GoPay yang ditampilkan ke customer.
              </span>
            </div>
          </div>
        </div>

        {/* Tarif Denda Standar (PRD 6.14) */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-text pb-3 border-b border-border flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Tarif Denda Keterlambatan & Pembersihan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-text mb-1">Tarif Late Fee per Hari (Rp):</label>
              <input
                type="number"
                value={lateFee}
                onChange={(e) => setLateFee(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-border rounded-xl font-bold text-text outline-none text-base md:text-xs"
              />
              <span className="text-[11px] text-text-muted mt-1 block">
                Dihitung otomatis per hari bila pengembalian melewati tanggal return.
              </span>
            </div>

            <div>
              <label className="block font-bold text-text mb-1">Tarif Standar Cleaning Fee Kotor (Rp):</label>
              <input
                type="number"
                value={cleaningFee}
                onChange={(e) => setCleaningFee(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-border rounded-xl font-bold text-text outline-none text-base md:text-xs"
              />
              <span className="text-[11px] text-text-muted mt-1 block">
                Biaya pembersihan ekstra jika peralatan dikembalikan dalam kondisi kotor berlumpur.
              </span>
            </div>
          </div>
        </div>

        {/* Staff Management List */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-text pb-3 border-b border-border flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Daftar Akun Staff & Owner Toko
          </h3>

          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
            {staffList.map((s) => (
              <div key={s.id} className="p-3 bg-white flex items-center justify-between">
                <div>
                  <b className="text-text block">{s.name}</b>
                  <span className="text-text-muted">{s.email}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-accent-mint text-primary font-bold text-[10px]">
                  {s.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-8 py-3.5 min-h-[44px] bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {isSaving ? (
              <span>Menyimpan Pengaturan...</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Semua Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
