/**
 * Helper to parse and convert any Google Maps URL or iframe embed code into:
 * 1. embedUrl: Valid URL to safely render inside an <iframe> without X-Frame-Options blocking
 * 2. directUrl: Valid link to open directly in Google Maps (web / mobile app navigation)
 */

export interface ParsedGoogleMaps {
  embedUrl: string;
  directUrl: string;
  isCustom: boolean;
  type: 'embed_code' | 'embed_url' | 'place' | 'coords' | 'shortlink' | 'query' | 'fallback';
  label?: string;
}

export function parseGoogleMapsUrl(
  input?: string | null,
  fallbackAddress: string = 'Jl. Riau No. 45, Bandung, Jawa Barat'
): ParsedGoogleMaps {
  let cleaned = (input || '').trim();

  // If empty, fallback to address search embed
  if (!cleaned) {
    const q = encodeURIComponent(fallbackAddress || 'Bandung');
    return {
      embedUrl: `https://maps.google.com/maps?q=${q}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
      directUrl: `https://www.google.com/maps/search/?api=1&query=${q}`,
      isCustom: false,
      type: 'fallback',
      label: 'Otomatis dari Alamat Toko',
    };
  }

  // 1. If user pasted an iframe HTML tag: <iframe src="..." ...></iframe>
  const iframeMatch = cleaned.match(/src=["']([^"']+)["']/i);
  if (iframeMatch) {
    cleaned = iframeMatch[1];
    return {
      embedUrl: cleaned,
      directUrl: fallbackAddress
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackAddress)}`
        : cleaned,
      isCustom: true,
      type: 'embed_code',
      label: 'Kode Sematkan (iframe) Google Maps',
    };
  }

  // 2. If it's already an explicit embed URL
  if (cleaned.includes('/maps/embed') || cleaned.includes('output=embed')) {
    return {
      embedUrl: cleaned,
      directUrl: fallbackAddress
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fallbackAddress)}`
        : cleaned,
      isCustom: true,
      type: 'embed_url',
      label: 'Link Embed Google Maps',
    };
  }

  // 3. Shortlink (maps.app.goo.gl or goo.gl/maps)
  if (cleaned.includes('maps.app.goo.gl') || cleaned.includes('goo.gl/maps')) {
    const q = encodeURIComponent(fallbackAddress || 'Lokasi Toko');
    return {
      // Direct URL opens native Google Maps app or web
      directUrl: cleaned,
      // For embed, use fallback address until resolved, or search
      embedUrl: fallbackAddress
        ? `https://maps.google.com/maps?q=${q}&t=&z=15&ie=UTF8&iwloc=&output=embed`
        : cleaned,
      isCustom: true,
      type: 'shortlink',
      label: 'Link Singkat / Share Google Maps',
    };
  }

  // 4. Coordinates in URL (@lat,lng)
  const coordsMatch = cleaned.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordsMatch) {
    const lat = coordsMatch[1];
    const lng = coordsMatch[2];
    return {
      embedUrl: `https://maps.google.com/maps?q=${lat},${lng}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
      directUrl: cleaned,
      isCustom: true,
      type: 'coords',
      label: `Koordinat GPS (${lat}, ${lng})`,
    };
  }

  // 5. Place URL: /place/Place+Name
  const placeMatch = cleaned.match(/\/place\/([^/@?]+)/);
  if (placeMatch) {
    const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    return {
      embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&t=&z=16&ie=UTF8&iwloc=&output=embed`,
      directUrl: cleaned,
      isCustom: true,
      type: 'place',
      label: `Tempat: ${placeName}`,
    };
  }

  // 6. Query param (?q=... or /search/...)
  const queryParamMatch = cleaned.match(/[?&]q=([^&]+)/);
  const searchPathMatch = cleaned.match(/\/search\/([^/?]+)/);
  const queryText = queryParamMatch
    ? decodeURIComponent(queryParamMatch[1].replace(/\+/g, ' '))
    : searchPathMatch
    ? decodeURIComponent(searchPathMatch[1].replace(/\+/g, ' '))
    : null;

  if (queryText) {
    return {
      embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(queryText)}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
      directUrl: cleaned,
      isCustom: true,
      type: 'query',
      label: `Pencarian: ${queryText}`,
    };
  }

  // 7. General fallback with custom string/URL
  const isUrl = cleaned.startsWith('http://') || cleaned.startsWith('https://');
  return {
    embedUrl: `https://maps.google.com/maps?q=${encodeURIComponent(isUrl ? fallbackAddress || cleaned : cleaned)}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
    directUrl: isUrl ? cleaned : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleaned)}`,
    isCustom: true,
    type: 'query',
    label: isUrl ? 'Link URL Google Maps' : 'Nama Lokasi',
  };
}
