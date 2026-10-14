'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tent, Phone, MapPin, Mail, ShieldCheck, Heart } from 'lucide-react';
import { parseGoogleMapsUrl } from '@/lib/maps';

export default function Footer() {
  const pathname = usePathname();
  const [storeSettings, setStoreSettings] = useState({
    store_address: 'Jl. Riau No. 45, Bandung, Jawa Barat (Pickup Langsung di Toko)',
    whatsapp_number: '+62 812-3456-7890',
    store_email: 'info@camprent.id',
    gmaps_url: '',
    gmaps_embed_url: '',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setStoreSettings((prev) => ({
            ...prev,
            store_address: data.store_address || prev.store_address,
            whatsapp_number: data.whatsapp_number || prev.whatsapp_number,
            store_email: data.store_email || prev.store_email,
            gmaps_url: data.gmaps_url || '',
            gmaps_embed_url: data.gmaps_embed_url || '',
          }));
        }
      })
      .catch((e) => console.error(e));
  }, []);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const cleanWaNumber = storeSettings.whatsapp_number.replace(/[^0-9]/g, '');

  return (
    <footer className="bg-sidebar-bg text-white border-t border-sidebar-active mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white">
                <Tent className="w-5 h-5 text-accent-mint" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">CampRent</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sistem rental peralatan camping terpercaya. Alat higienis, terawat, dan siap menemani petualangan outdoor Anda.
            </p>
            <div className="flex items-center gap-2 text-xs text-accent-mint font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Jaminan Alat Bersih & Berfungsi 100%</span>
            </div>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-200 mb-4">Navigasi</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-white transition-colors">Katalog Peralatan</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">Tentang Kami & Lokasi</Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">Keranjang Sewa</Link>
              </li>
              <li>
                <Link href="/account/rentals" className="hover:text-white transition-colors">Cek Status Rental</Link>
              </li>
            </ul>
          </div>

          {/* Kategori Populer */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-200 mb-4">Kategori Populer</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <Link href="/catalog?category=tenda" className="hover:text-white transition-colors">Tenda Dome & Keluarga</Link>
              </li>
              <li>
                <Link href="/catalog?category=sleeping-bag" className="hover:text-white transition-colors">Sleeping Bag Polar & Bulu</Link>
              </li>
              <li>
                <Link href="/catalog?category=cooking" className="hover:text-white transition-colors">Kompor & Nesting Set</Link>
              </li>
              <li>
                <Link href="/catalog?category=carrier" className="hover:text-white transition-colors">Carrier Ransel Gunung</Link>
              </li>
            </ul>
          </div>

          {/* Kontak & Toko */}
          <div className="space-y-3 text-sm text-gray-400">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-200 mb-4">Toko & Pickup</h4>
            {(() => {
              const mapsData = parseGoogleMapsUrl(
                storeSettings.gmaps_url || storeSettings.gmaps_embed_url,
                storeSettings.store_address
              );
              return (
                <a
                  href={mapsData.directUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 hover:text-white transition-colors group"
                  title="Klik untuk buka lokasi di Google Maps"
                >
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span className="leading-relaxed">{storeSettings.store_address}</span>
                </a>
              );
            })()}
            <a
              href={cleanWaNumber ? `https://wa.me/${cleanWaNumber}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 hover:text-white transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{storeSettings.whatsapp_number} (WhatsApp)</span>
            </a>
            <a
              href={`mailto:${storeSettings.store_email}`}
              className="flex items-center gap-2.5 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{storeSettings.store_email}</span>
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© 2026 CampRent Camping Equipment Rental Management System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Dibuat untuk para pecinta petualangan alam terbuka
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
