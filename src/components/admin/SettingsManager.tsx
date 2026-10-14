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
  Palette,
  Sparkles,
  Image as ImageIcon,
  UploadCloud,
  FileImage,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { parseGoogleMapsUrl } from '@/lib/maps';
import { useBrand, BrandLogoRenderer, BrandNameDisplay } from '@/context/BrandContext';

interface SettingsProps {
  initialSettings: Record<string, string>;
  staffList: { id: string; name: string; email: string; role: string }[];
}

export default function SettingsManager({ initialSettings, staffList }: SettingsProps) {
  const { refreshBrand, updateBrandLocally } = useBrand();

  // Brand Identity (Logo & Text beside logo)
  const [brandName, setBrandName] = useState(initialSettings['brand_name'] || 'CampRent');
  const [brandTagline, setBrandTagline] = useState(initialSettings['brand_tagline'] || 'Outdoor Equipment');
  const [brandLogoType, setBrandLogoType] = useState<'preset' | 'upload'>(
    initialSettings['brand_logo_type'] === 'preset' ? 'preset' : 'upload'
  );
  const [brandLogoPreset, setBrandLogoPreset] = useState<'mountain' | 'tent' | 'compass' | 'trees' | 'flame'>(
    (initialSettings['brand_logo_preset'] as any) || 'mountain'
  );
  const [brandLogoUrl, setBrandLogoUrl] = useState(initialSettings['brand_logo_url'] || '/assets/logo.png');

  // File upload state
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const res = await fetch('/api/settings/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Gagal mengunggah file logo.');
      }

      setBrandLogoUrl(data.url);
      setBrandLogoType('upload');
      setUploadedFileName(file.name);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Gagal mengunggah file logo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Store identity & Location
  const [storeName, setStoreName] = useState(initialSettings['store_name'] || 'CampRent Adventure Rental Gresik');
  const [whatsapp, setWhatsapp] = useState(initialSettings['whatsapp_number'] || '+62 812-3456-7890');
  const [storeAddress, setStoreAddress] = useState(initialSettings['store_address'] || 'Jl. Martadinata, Kroman, Kec. Gresik, Kabupaten Gresik, Jawa Timur 61115 (Pickup Langsung di Toko)');
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
          brand_name: brandName,
          brand_tagline: brandTagline,
          brand_logo_type: brandLogoType,
          brand_logo_preset: brandLogoPreset,
          brand_logo_url: brandLogoUrl,
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

      updateBrandLocally({
        brandName,
        brandTagline,
        brandLogoType,
        brandLogoPreset,
        brandLogoUrl,
      });
      await refreshBrand();

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
          Pengaturan Toko &amp; Identitas Brand
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          Atur nama brand, logo &amp; teks navbar, informasi kontak bisnis, nomor WhatsApp reservasi, dan rekening pembayaran toko.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pengaturan identitas brand, logo, dan rekening berhasil disimpan dan diperbarui!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* IDENTITAS BRAND & LOGO NAVBAR */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="font-bold text-sm text-text flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Identitas Brand &amp; Logo Website
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                Ganti logo dan tulisan di sampingnya yang tampil di navbar, header, dan footer seluruh website.
              </p>
            </div>
            <span className="text-[10px] text-emerald-800 font-bold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 shrink-0">
              Tampil di Seluruh Halaman
            </span>
          </div>

          {/* Live Preview Cards */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
              Pratinjau Langsung (Live Preview Navbar):
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Preview 1: Dark / Hero Navbar */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white">
                    <BrandLogoRenderer
                      type={brandLogoType}
                      preset={brandLogoPreset}
                      url={brandLogoUrl}
                      brandName={brandName}
                      className="w-7 h-7"
                    />
                  </div>
                  <div>
                    <span className="text-base font-black text-white block leading-tight">
                      {brandName || 'CampRent'}
                    </span>
                    {brandTagline && (
                      <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-400 block">
                        {brandTagline}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-medium text-gray-400 bg-white/10 px-2 py-0.5 rounded">
                  Navbar Beranda
                </span>
              </div>

              {/* Preview 2: Light Navbar */}
              <div className="p-3.5 rounded-xl bg-white border border-gray-200 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs">
                    <BrandLogoRenderer
                      type={brandLogoType}
                      preset={brandLogoPreset}
                      url={brandLogoUrl}
                      brandName={brandName}
                      className="w-6 h-6"
                    />
                  </div>
                  <div>
                    <span className="text-base font-black block leading-tight">
                      <BrandNameDisplay name={brandName} isDark={false} />
                    </span>
                    {brandTagline && (
                      <span className="text-[9px] uppercase font-bold tracking-widest text-text-muted block">
                        {brandTagline}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  Navbar Halaman Lain
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-text mb-1">
                Tulisan di Samping Logo (Nama Brand):
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Contoh: CampRent"
                className="w-full p-2.5 bg-gray-50 border border-border rounded-xl font-bold text-text outline-none focus:border-primary focus:bg-white text-base md:text-xs"
                required
              />
              <span className="text-[11px] text-text-muted mt-1 block">
                Teks utama yang tampil tebal di samping logo pada header navigasi.
              </span>
            </div>

            <div>
              <label className="block font-bold text-text mb-1">
                Subteks / Tagline Brand (Opsional):
              </label>
              <input
                type="text"
                value={brandTagline}
                onChange={(e) => setBrandTagline(e.target.value)}
                placeholder="Contoh: Outdoor Equipment"
                className="w-full p-2.5 bg-gray-50 border border-border rounded-xl font-bold text-text outline-none focus:border-primary focus:bg-white text-base md:text-xs"
              />
              <span className="text-[11px] text-text-muted mt-1 block">
                Teks kecil di bawah nama brand (bisa dikosongkan jika ingin nama brand saja).
              </span>
            </div>
          </div>

          {/* Logo Selection: Direct File Upload or Preset */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-text">Pilihan Logo:</label>
              <span className="text-[11px] text-text-muted">
                Pilih unggah file logo sendiri atau pakai ikon bawaan
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setBrandLogoType('upload')}
                className={`p-3 rounded-xl border text-left font-bold transition-all flex items-center gap-2.5 ${
                  brandLogoType === 'upload'
                    ? 'border-primary bg-emerald-50/70 text-primary ring-2 ring-primary/20 shadow-xs'
                    : 'border-border bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <UploadCloud className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <span className="block text-xs font-bold">Upload File Logo</span>
                  <span className="block text-[10px] text-text-muted font-normal">PNG, JPG, WebP, SVG</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBrandLogoType('preset')}
                className={`p-3 rounded-xl border text-left font-bold transition-all flex items-center gap-2.5 ${
                  brandLogoType === 'preset'
                    ? 'border-primary bg-emerald-50/70 text-primary ring-2 ring-primary/20 shadow-xs'
                    : 'border-border bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <span className="block text-xs font-bold">Pilih Ikon Preset</span>
                  <span className="block text-[10px] text-text-muted font-normal">Ikon Grafis Bawaan</span>
                </div>
              </button>
            </div>

            {brandLogoType === 'upload' ? (
              <div className="space-y-3 pt-2">
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                  onChange={handleLogoUpload}
                  className="hidden"
                />

                {/* Uploaded File Card */}
                <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center p-1 overflow-hidden shrink-0">
                      {brandLogoUrl ? (
                        <img
                          src={brandLogoUrl}
                          alt="Logo Preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <FileImage className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-text block">
                          {uploadedFileName || (brandLogoUrl === '/assets/logo.png' ? 'logo.png (Tersedia di public/assets)' : 'File Logo Aktif')}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          Aktif
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5 break-all">
                        {brandLogoUrl || 'Belum ada file yang dipilih'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isUploadingLogo}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{isUploadingLogo ? 'Mengunggah...' : 'Upload File Baru'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBrandLogoUrl('/assets/logo.png');
                        setBrandLogoType('upload');
                        setUploadedFileName('logo.png');
                      }}
                      className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs active:scale-95"
                      title="Gunakan file bawaan public/assets/logo.png"
                    >
                      <RefreshCw className="w-3 h-3 text-gray-500" />
                      <span>Pakai public/assets/logo.png</span>
                    </button>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-xl border border-red-200">
                    {uploadError}
                  </p>
                )}

                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-[11px] text-text-muted space-y-0.5">
                  <p className="font-bold text-emerald-900 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Upload Langsung:</span>
                  </p>
                  <p>
                    File yang Anda pilih akan langsung diunggah dan disimpan ke server tanpa perlu memasukkan URL manual. Format yang didukung: PNG, JPG, WebP, dan SVG (Maksimal 5MB).
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-semibold text-text-muted block">
                  Pilih desain ikon logo bawaan:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { id: 'mountain', label: 'Gunung (Default)', desc: 'Sesuai Desain Beranda' },
                    { id: 'tent', label: 'Tenda Camping', desc: 'Outdoor Rental' },
                    { id: 'compass', label: 'Kompas', desc: 'Petualangan Alam' },
                    { id: 'trees', label: 'Hutan Pinus', desc: 'Wisata Alam' },
                    { id: 'flame', label: 'Api Unggun', desc: 'Hangat & Akrab' },
                  ].map((p) => {
                    const isSelected = brandLogoPreset === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setBrandLogoPreset(p.id as any)}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                          isSelected
                            ? 'border-primary bg-emerald-50 text-primary shadow-xs ring-2 ring-primary/20'
                            : 'border-border bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
                          <BrandLogoRenderer preset={p.id as any} className="w-5 h-5 text-accent-mint" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold leading-tight">{p.label}</span>
                          <span className="block text-[10px] text-text-muted mt-0.5">{p.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Identitas Bisnis & WhatsApp */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-text pb-3 border-b border-border flex items-center gap-2">
            <Store className="w-4 h-4 text-primary" />
            Identitas Toko &amp; Nomor WhatsApp
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
                placeholder="Jl. Martadinata, Kroman, Kec. Gresik, Kabupaten Gresik, Jawa Timur 61115 (Pickup Langsung di Toko)"
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
