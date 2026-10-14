import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseGoogleMapsUrl } from '@/lib/maps';

export const dynamic = 'force-dynamic';

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

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const result: Record<string, string> = { ...DEFAULT_SETTINGS };

    settings.forEach((s) => {
      result[s.key] = s.value;
    });

    // Backwards-compat: if gmaps_url is empty but gmaps_embed_url exists, populate gmaps_url
    if (!result.gmaps_url && result.gmaps_embed_url) {
      result.gmaps_url = result.gmaps_embed_url;
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error fetching settings:', err);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Data pengaturan tidak valid.' }, { status: 400 });
    }

    // Auto-calculate embed url from gmaps_url if provided
    if ('gmaps_url' in body || 'store_address' in body) {
      const gmapsInput = body.gmaps_url !== undefined ? body.gmaps_url : body.gmaps_embed_url;
      const address = body.store_address || '';
      const parsed = parseGoogleMapsUrl(gmapsInput, address);
      body.gmaps_embed_url = parsed.embedUrl;
      if (body.gmaps_url === undefined && body.gmaps_embed_url) {
        body.gmaps_url = body.gmaps_embed_url;
      }
    }

    // Upsert each key-value pair
    for (const [key, value] of Object.entries(body)) {
      if (typeof key === 'string' && value !== undefined && value !== null) {
        await prisma.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }
    }

    const updatedSettings = await prisma.setting.findMany();
    const result: Record<string, string> = { ...DEFAULT_SETTINGS };
    updatedSettings.forEach((s) => {
      result[s.key] = s.value;
    });

    return NextResponse.json({ success: true, settings: result });
  } catch (err: any) {
    console.error('Error saving settings:', err);
    return NextResponse.json({ error: err.message || 'Gagal menyimpan pengaturan.' }, { status: 500 });
  }
}
