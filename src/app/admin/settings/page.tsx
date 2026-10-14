import React from 'react';
import prisma from '@/lib/prisma';
import SettingsManager from '@/components/admin/SettingsManager';


export default async function AdminSettingsPage() {
  const [settings, staff] = await Promise.all([
    prisma.setting.findMany(),
    prisma.profile.findMany({
      where: { role: { in: ['OWNER', 'STAFF'] } },
      select: { id: true, name: true, email: true, role: true },
    }),
  ]);

  const DEFAULT_SETTINGS: Record<string, string> = {
    store_name: 'CampRent Adventure Rental Gresik',
    brand_name: 'CampRent',
    brand_tagline: 'Outdoor Equipment',
    brand_logo_type: 'upload',
    brand_logo_preset: 'mountain',
    brand_logo_url: '/assets/logo.png',
    store_address: 'Jl. Martadinata, Kroman, Kec. Gresik, Kabupaten Gresik, Jawa Timur 61115 (Pickup Langsung di Toko)',
    whatsapp_number: '+62 812-3456-7890',
    store_email: 'info@camprent.id',
    store_hours: 'Buka Setiap Hari: 08.00 – 21.00 WIB',
    gmaps_url: '',
    gmaps_embed_url: '',
    late_fee_per_day: '50000',
    cleaning_fee_default: '25000',
    bank_name: 'BCA',
    bank_account: '8735123456',
    bank_holder: 'CampRent Outdoor Indonesia',
    bank_active: 'true',
    dana_number: '081298765432',
    dana_holder: 'CampRent Adventure DANA',
    dana_active: 'true',
    gopay_number: '081298765432',
    gopay_holder: 'CampRent Adventure GoPay',
    gopay_active: 'true',
  };

  const settingsMap: Record<string, string> = { ...DEFAULT_SETTINGS };
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  if (!settingsMap.gmaps_url && settingsMap.gmaps_embed_url) {
    settingsMap.gmaps_url = settingsMap.gmaps_embed_url;
  }

  return (
    <div className="space-y-6">
      <SettingsManager
        initialSettings={settingsMap}
        staffList={staff}
      />
    </div>
  );
}
