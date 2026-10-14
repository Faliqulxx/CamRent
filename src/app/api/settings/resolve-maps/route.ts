import { NextResponse } from 'next/server';
import { parseGoogleMapsUrl } from '@/lib/maps';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { url, address } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL tidak valid' }, { status: 400 });
    }

    const trimmed = url.trim();

    // If it's a shortlink, resolve redirect on server
    if (trimmed.includes('maps.app.goo.gl') || trimmed.includes('goo.gl/maps')) {
      try {
        const response = await fetch(trimmed, {
          method: 'GET',
          redirect: 'manual',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        });

        const redirectedLocation = response.headers.get('location');
        if (redirectedLocation) {
          const parsed = parseGoogleMapsUrl(redirectedLocation, address);
          return NextResponse.json({
            success: true,
            resolvedUrl: redirectedLocation,
            embedUrl: parsed.embedUrl,
            directUrl: trimmed,
            label: parsed.label,
          });
        }
      } catch (fetchErr) {
        console.warn('Could not resolve Google Maps shortlink online:', fetchErr);
      }
    }

    // Default parser
    const parsed = parseGoogleMapsUrl(trimmed, address);
    return NextResponse.json({
      success: true,
      resolvedUrl: trimmed,
      embedUrl: parsed.embedUrl,
      directUrl: parsed.directUrl,
      label: parsed.label,
    });
  } catch (err: any) {
    console.error('Error resolving Google Maps URL:', err);
    return NextResponse.json(
      { error: err.message || 'Gagal memproses URL Google Maps' },
      { status: 500 }
    );
  }
}
