import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Tent,
  Sparkles,
  ArrowRight,
  Store,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import { parseGoogleMapsUrl } from '@/lib/maps';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const settings = await prisma.setting.findMany();
  const settingsMap: Record<string, string> = {
    store_name: 'CampRent Adventure Rental Bandung',
    store_address: 'Jl. Riau No. 45, Bandung, Jawa Barat (Pickup Langsung di Toko)',
    whatsapp_number: '+62 812-3456-7890',
    store_email: 'info@camprent.id',
    store_hours: 'Buka Setiap Hari: 08.00 – 21.00 WIB',
    gmaps_url: '',
    gmaps_embed_url: '',
  };

  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  if (!settingsMap.gmaps_url && settingsMap.gmaps_embed_url) {
    settingsMap.gmaps_url = settingsMap.gmaps_embed_url;
  }

  const mapsData = parseGoogleMapsUrl(
    settingsMap.gmaps_url || settingsMap.gmaps_embed_url,
    settingsMap.store_address
  );

  const cleanPhone = settingsMap['whatsapp_number'].replace(/[^0-9]/g, '');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 rounded-full bg-accent-mint/60 border border-primary/20 inline-block">
          Tentang Kami & Lokasi Toko
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text tracking-tight">
          Teman Setia Petualangan Alam Terbuka Anda
        </h1>
        <p className="text-sm sm:text-base text-text-muted leading-relaxed">
          CampRent hadir memberikan pengalaman sewa alat camping dan mountaineering yang mudah, higienis, terawat, dan profesional di Bandung.
        </p>
      </div>

      {/* Main Location & Google Maps Card */}
      <div className="bg-white rounded-3xl border border-border p-6 sm:p-10 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Store className="w-4 h-4" />
              <span>Titik Toko & Pickup Resmi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-text mt-1">
              Lokasi Toko & Google Maps
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-xl">
              Kunjungi toko kami untuk pengambilan barang sewa, pengecekan fisik unit bersama staf, dan penyerahan jaminan identitas.
            </p>
          </div>

          <a
            href={mapsData.directUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[44px] bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-md shadow-primary/20 transition-all active:scale-95 shrink-0"
          >
            <MapPin className="w-4 h-4 text-accent-mint" />
            <span>Petunjuk Arah Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Info Side (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-gray-50 border border-border space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                    Alamat Lengkap Toko & Pickup:
                  </span>
                  <p className="text-sm font-bold text-text mt-0.5 leading-relaxed">
                    {settingsMap['store_address']}
                  </p>
                  <span className="text-[11px] text-primary font-semibold block mt-1.5">
                    ✓ Titik Serah Terima Peralatan & Pengembalian
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-gray-50 border border-border space-y-1">
                <div className="flex items-center gap-2 text-text-muted text-xs font-bold mb-1">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Jam Buka Toko</span>
                </div>
                <p className="text-xs font-bold text-text leading-snug">
                  {settingsMap['store_hours']}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-border space-y-1">
                <div className="flex items-center gap-2 text-text-muted text-xs font-bold mb-1">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>Email Resmi</span>
                </div>
                <a
                  href={`mailto:${settingsMap['store_email']}`}
                  className="text-xs font-bold text-primary hover:underline block truncate"
                >
                  {settingsMap['store_email']}
                </a>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">WhatsApp Reservasi</span>
                  <span className="text-sm font-black text-emerald-950">{settingsMap['whatsapp_number']}</span>
                </div>
              </div>

              <a
                href={cleanPhone ? `https://wa.me/${cleanPhone}` : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-colors shadow-xs"
              >
                Chat Toko
              </a>
            </div>
          </div>

          {/* Google Maps Embed (7 Cols) */}
          <div className="lg:col-span-7 space-y-2">
            <div className="rounded-2xl overflow-hidden border border-border shadow-sm h-[320px] sm:h-[400px] w-full bg-gray-100">
              <iframe
                title="Google Maps Lokasi CampRent"
                src={mapsData.embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            <p className="text-[11px] text-text-muted text-center sm:text-right">
              📍 Peta Google Maps interaktif. Klik kanan atau geser untuk melihat rute dari lokasi Anda.
            </p>
          </div>
        </div>
      </div>

      {/* Nilai Unggulan CampRent */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-accent-mint flex items-center justify-center text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-text">Bersih, Higienis & Steril</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Setiap tenda dan sleeping bag melalui masa pembersihan (cleaning days) dan pencucian higienis sebelum disewakan kembali ke pelanggan berikutnya.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-accent-mint flex items-center justify-center text-primary">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-text">Pengecekan Fisik Bersama</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Saat serah terima di toko, kami memeriksa kelengkapan frame tenda, pasak, dan kompor bersama Anda untuk memastikan peralatan berfungsi 100%.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-accent-mint flex items-center justify-center text-primary">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-text">Sistem Stok Real-Time</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Sistem kami menghitung ketersediaan unit fisik per tanggal secara akurat sehingga Anda terbebas dari risiko kehabisan unit (*no double-booking*).
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-xl shadow-primary/20">
        <h2 className="text-2xl sm:text-3xl font-black max-w-xl mx-auto">
          Siap Memulai Petualangan Seru Anda?
        </h2>
        <p className="text-xs sm:text-sm text-accent-mint/90 max-w-lg mx-auto">
          Pilih perlengkapan camping favorit Anda sekarang, booking online, dan ambil unit di toko kami di Bandung.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/catalog"
            className="w-full sm:w-auto px-8 py-3.5 min-h-[44px] bg-white hover:bg-gray-100 text-primary font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Lihat Katalog Peralatan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href={cleanPhone ? `https://wa.me/${cleanPhone}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3.5 min-h-[44px] bg-primary-dark/60 hover:bg-primary-dark text-white border border-white/20 font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>Tanya Admin via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
