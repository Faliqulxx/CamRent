import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  CheckCircle2,
  Tag,
  Store,
  Star,
  ArrowRight,
  Tent,
  Flame,
  Layers,
  Flashlight,
  Backpack,
  Armchair,
  BedDouble,
  ChevronRight,
  MapPin,
  Mail,
  Clock,
  Phone,
  ExternalLink,
} from 'lucide-react';
import prisma from '@/lib/prisma';
import HeroSearchBar from '@/components/home/HeroSearchBar';
import { formatCurrency } from '@/lib/utils';
import { parseGoogleMapsUrl } from '@/lib/maps';


export default async function HomePage() {
  const [categories, featuredProducts, settings] = await Promise.all([
    prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      take: 6,
      include: {
        category: true,
        images: {
          orderBy: { position: 'asc' },
          take: 1,
        },
        units: {
          where: { status: { not: 'INACTIVE' } },
        },
      },
      orderBy: { ratingCount: 'desc' },
    }),
    prisma.setting.findMany(),
  ]);

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

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'tenda':
        return <Tent className="w-6 h-6 text-primary" />;
      case 'sleeping-bag':
        return <BedDouble className="w-6 h-6 text-primary" />;
      case 'matras':
        return <Layers className="w-6 h-6 text-primary" />;
      case 'furniture':
        return <Armchair className="w-6 h-6 text-primary" />;
      case 'cooking':
        return <Flame className="w-6 h-6 text-primary" />;
      case 'lighting':
        return <Flashlight className="w-6 h-6 text-primary" />;
      case 'carrier':
        return <Backpack className="w-6 h-6 text-primary" />;
      default:
        return <Tent className="w-6 h-6 text-primary" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative min-h-[560px] md:min-h-[640px] flex items-center justify-center bg-sidebar-bg overflow-hidden px-4 sm:px-6 lg:px-8 py-20">
        {/* Background Image with Gradient Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-overlay filter blur-[1px]"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=1600&auto=format&fit=crop&q=80")',
          }}
        />
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-sidebar-bg via-sidebar-bg/80 to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-mint/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Sistem Rental Resmi CampRent Outdoor Bandung
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl drop-shadow-md">
            Sewa Peralatan Camping untuk Petualanganmu
          </h1>

          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-300 max-w-2xl font-normal leading-relaxed">
            Jelajahi keindahan alam tanpa ribet beli perlengkapan mahal. Tenda higienis, carrier nyaman, dan cookset lengkap siap dipinjam.
          </p>

          {/* Search Bar Date Component */}
          <div className="w-full mt-10">
            <HeroSearchBar />
          </div>
        </div>
      </section>

      {/* 2. Strip 4 Keunggulan (Conforming to PRD 6.1) */}
      <section className="border-y border-border bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-start gap-3.5 p-3.5 sm:p-0 rounded-2xl bg-gray-50/70 sm:bg-transparent">
              <div className="w-12 h-12 rounded-2xl bg-accent-mint flex items-center justify-center text-primary shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-text">Peralatan Berkualitas</h4>
                <p className="text-xs text-text-muted mt-1 leading-snug">
                  Higienis, diinspeksi berkala, dan selalu dicek sebelum diserahkan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 sm:p-0 rounded-2xl bg-gray-50/70 sm:bg-transparent">
              <div className="w-12 h-12 rounded-2xl bg-accent-mint flex items-center justify-center text-primary shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-text">Proses Mudah</h4>
                <p className="text-xs text-text-muted mt-1 leading-snug">
                  Cek ketersediaan tanggal, booking online, dan konfirmasi WhatsApp.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 sm:p-0 rounded-2xl bg-gray-50/70 sm:bg-transparent">
              <div className="w-12 h-12 rounded-2xl bg-accent-mint flex items-center justify-center text-primary shrink-0">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-text">Harga Terjangkau</h4>
                <p className="text-xs text-text-muted mt-1 leading-snug">
                  Tarif harian transparan, hemat, tanpa perlu deposit uang muka.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 sm:p-0 rounded-2xl bg-gray-50/70 sm:bg-transparent">
              <div className="w-12 h-12 rounded-2xl bg-accent-mint flex items-center justify-center text-primary shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-text">Pickup di Toko</h4>
                <p className="text-xs text-text-muted mt-1 leading-snug">
                  Ambil langsung di toko Bandung, periksa kondisi bersama staff.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Kategori Grid (PRD 6.1) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Kategori Pilihan</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-text mt-1">Pilih Sesuai Kebutuhan Camping</p>
          </div>
          <Link
            href="/catalog"
            className="text-sm font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-1 group"
          >
            <span>Lihat Semua Produk</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalog?category=${cat.slug}`}
              className="group bg-white rounded-2xl p-4 border border-border shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-accent-mint group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center mb-3 text-primary">
                {getCategoryIcon(cat.slug)}
              </div>
              <h3 className="font-bold text-sm text-text group-hover:text-primary transition-colors">{cat.name}</h3>
              <p className="text-[11px] text-text-muted mt-0.5">{cat._count.products} Peralatan</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Peralatan Populer / Featured */}
      <section className="py-16 bg-white border-t border-border px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Paling Sering Disewa</h2>
              <p className="text-2xl sm:text-3xl font-extrabold text-text mt-1">Peralatan Camping Unggulan</p>
            </div>
            <Link
              href="/catalog"
              className="px-5 py-2.5 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white transition-colors text-sm font-bold flex items-center gap-2"
            >
              <span>Jelajahi Katalog Lengkap</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((p) => {
              const mainImage = p.images[0]?.url || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800';
              const totalActiveUnits = p.units.length;

              return (
                <div
                  key={p.id}
                  className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    <img
                      src={mainImage}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-primary shadow-sm">
                      {p.category.name}
                    </div>
                    {p.capacity && p.capacity > 0 && (
                      <div className="absolute top-3 right-3 bg-sidebar-bg/85 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-semibold text-white">
                        {p.capacity} Orang
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-text-muted mb-1.5">
                        <div className="flex items-center text-star">
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </div>
                        <span className="font-bold text-text">{p.ratingAvg.toFixed(1)}</span>
                        <span>({p.ratingCount} ulasan)</span>
                      </div>

                      <h3 className="font-bold text-base text-text group-hover:text-primary transition-colors line-clamp-1">
                        {p.name}
                      </h3>
                      <p className="text-xs text-text-muted mt-1.5 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-text-muted block">Harga sewa:</span>
                        <div className="text-lg font-black text-primary">
                          {formatCurrency(p.pricePerDay)}
                          <span className="text-xs font-normal text-text-muted"> /hari</span>
                        </div>
                        <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                          ✓ {totalActiveUnits} unit fisik tersedia
                        </span>
                      </div>

                      <Link
                        href={`/catalog/${p.slug}`}
                        className="px-4 py-2.5 min-h-[44px] inline-flex items-center justify-center rounded-xl border border-primary text-primary hover:bg-primary hover:text-white transition-all text-xs font-bold active:scale-95"
                      >
                        Detail & Sewa
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full" id="about">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Cara Mudah Sewa</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-text mt-1">Sederhana & Tanpa Ribet</p>
          <p className="text-sm text-text-muted mt-2">
            Hanya 4 langkah mudah untuk mulai menjelajahi alam terbuka bersama CampRent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm text-center relative">
            <div className="w-10 h-10 rounded-full bg-accent-mint text-primary font-black flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h4 className="font-bold text-sm text-text">Tentukan Tanggal</h4>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              Pilih tanggal mulai sewa dan tanggal kembali. Sistem langsung menghitung ketersediaan unit fisik.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm text-center relative">
            <div className="w-10 h-10 rounded-full bg-accent-mint text-primary font-black flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h4 className="font-bold text-sm text-text">Pilih Peralatan</h4>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              Pilih tenda, matras, kompor, atau sleeping bag ke keranjang sesuai jumlah personil petualanganmu.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm text-center relative">
            <div className="w-10 h-10 rounded-full bg-accent-mint text-primary font-black flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h4 className="font-bold text-sm text-text">Konfirmasi & WhatsApp</h4>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              Isi data penyewa dan jenis jaminan identitas (KTP/SIM/KTM), lalu kirim bukti transfer ke WhatsApp toko.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm text-center relative">
            <div className="w-10 h-10 rounded-full bg-accent-mint text-primary font-black flex items-center justify-center mx-auto mb-4">
              4
            </div>
            <h4 className="font-bold text-sm text-text">Pickup & Berangkat</h4>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">
              Ambil peralatan di toko kami di Bandung, serahkan jaminan identitas asli, periksa kondisi, dan nikmati camping!
            </p>
          </div>
        </div>
      </section>

      {/* 6. Tentang Kami & Lokasi Toko dengan Google Maps */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full" id="contact">
        <div className="bg-white rounded-3xl border border-border p-6 sm:p-10 shadow-sm space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Tentang Kami & Lokasi</span>
              <h2 className="text-2xl sm:text-3xl font-black text-text mt-1">
                Kunjungi Toko CampRent
              </h2>
              <p className="text-xs sm:text-sm text-text-muted mt-1.5 max-w-xl leading-relaxed">
                Solusi persewaan alat camping terlengkap, higienis, dan terpercaya di Bandung. Silakan datang langsung untuk cek unit, serah terima alat, atau konsultasi perlengkapan petualangan Anda.
              </p>
            </div>

            <a
              href={mapsData.directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs shadow-md shadow-primary/20 transition-all active:scale-95 shrink-0"
            >
              <MapPin className="w-4 h-4 text-accent-mint" />
              <span>Petunjuk Arah Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Toko & Pickup Info Cards (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-border space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Alamat Toko & Pickup:</span>
                    <p className="text-sm font-bold text-text mt-0.5 leading-relaxed">
                      {settingsMap['store_address']}
                    </p>
                    <span className="text-[11px] text-primary font-semibold block mt-1">
                      ✓ Titik Serah Terima & Pengembalian Alat
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-gray-50 border border-border space-y-1">
                  <div className="flex items-center gap-2 text-text-muted text-xs font-bold mb-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Jam Operasional</span>
                  </div>
                  <p className="text-xs font-bold text-text">
                    {settingsMap['store_hours']}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-border space-y-1">
                  <div className="flex items-center gap-2 text-text-muted text-xs font-bold mb-1">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>Email Toko</span>
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
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase block">WhatsApp Reservasi</span>
                    <span className="text-sm font-black text-emerald-950">{settingsMap['whatsapp_number']}</span>
                  </div>
                </div>

                <a
                  href={`https://wa.me/${settingsMap['whatsapp_number'].replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 min-h-[44px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center transition-colors shadow-xs"
                >
                  Chat CS
                </a>
              </div>
            </div>

            {/* Interactive Google Maps Embed (7 Cols) */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl overflow-hidden border border-border shadow-sm h-[320px] sm:h-[380px] w-full relative bg-gray-100 group">
                <iframe
                  title="Peta Lokasi Toko CampRent"
                  src={mapsData.embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <p className="text-[11px] text-text-muted mt-2 text-center sm:text-right">
                📍 Peta interaktif Google Maps dapat dizoom dan digeser untuk melihat rute jalan menuju toko.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
