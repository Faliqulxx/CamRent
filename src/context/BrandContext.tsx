'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MountainSnow, Tent, Compass, Trees, Flame } from 'lucide-react';

export interface BrandSettings {
  brandName: string;
  brandTagline: string;
  brandLogoType: 'preset' | 'upload' | 'url';
  brandLogoPreset: 'mountain' | 'tent' | 'compass' | 'trees' | 'flame';
  brandLogoUrl: string;
}

interface BrandContextType extends BrandSettings {
  refreshBrand: () => Promise<void>;
  updateBrandLocally: (newSettings: Partial<BrandSettings>) => void;
}

const defaultBrandSettings: BrandSettings = {
  brandName: 'CampRent',
  brandTagline: 'Outdoor Equipment',
  brandLogoType: 'upload',
  brandLogoPreset: 'mountain',
  brandLogoUrl: '/assets/logo.png',
};

const BrandContext = createContext<BrandContextType>({
  ...defaultBrandSettings,
  refreshBrand: async () => {},
  updateBrandLocally: () => {},
});

export function MountainBrandIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Twin peak mountain silhouette matching CampRent screenshot */}
      <path d="M4 25L13.5 7L18.5 15.5L22 9.5L28 25H4Z" />
      {/* Snow cap highlights */}
      <path
        d="M13.5 7L9.5 14.5L13.5 16L16 12L13.5 7Z"
        fill="white"
        fillOpacity="0.4"
      />
      <path
        d="M22 9.5L19.5 14L22 15.5L25 13L22 9.5Z"
        fill="white"
        fillOpacity="0.4"
      />
    </svg>
  );
}

export function BrandLogoRenderer({
  type = 'upload',
  preset = 'mountain',
  url,
  brandName,
  className = 'w-7 h-7',
}: {
  type?: 'preset' | 'upload' | 'url';
  preset?: 'mountain' | 'tent' | 'compass' | 'trees' | 'flame';
  url?: string;
  brandName?: string;
  className?: string;
}) {
  // If upload or URL is active and image url is present, display image
  if (type !== 'preset' && url && url.trim() !== '') {
    return (
      <img
        src={url}
        alt={brandName || 'Brand Logo'}
        className={`${className} object-contain rounded-lg`}
        onError={(e) => {
          // Fallback to preset if image fails to load
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  switch (preset) {
    case 'tent':
      return <Tent className={className} />;
    case 'compass':
      return <Compass className={className} />;
    case 'trees':
      return <Trees className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'mountain':
    default:
      return <MountainBrandIcon className={className} />;
  }
}

export function BrandNameDisplay({
  name = 'CampRent',
  isDark = false,
  className = '',
}: {
  name?: string;
  isDark?: boolean;
  className?: string;
}) {
  const brand = name || 'CampRent';
  const lower = brand.toLowerCase();
  const campIdx = lower.indexOf('camp');

  if (campIdx !== -1) {
    const rentIdx = lower.indexOf('rent', campIdx + 4);
    if (rentIdx !== -1) {
      const before = brand.slice(0, campIdx);
      const camp = brand.slice(campIdx, campIdx + 4);
      const mid = brand.slice(campIdx + 4, rentIdx);
      const rent = brand.slice(rentIdx, rentIdx + 4);
      const after = brand.slice(rentIdx + 4);

      return (
        <span className={className}>
          {before}
          <span className={isDark ? 'text-white' : 'text-gray-950'}>{camp}</span>
          {mid}
          <span className={isDark ? 'text-emerald-400' : 'text-[#165a3d]'}>{rent}</span>
          {after}
        </span>
      );
    }
  }

  // Fallback for custom multi-word brand name
  const parts = brand.split(' ');
  if (parts.length >= 2) {
    return (
      <span className={className}>
        <span className={isDark ? 'text-white' : 'text-gray-950'}>{parts[0]}</span>{' '}
        <span className={isDark ? 'text-emerald-400' : 'text-[#165a3d]'}>{parts.slice(1).join(' ')}</span>
      </span>
    );
  }

  return (
    <span className={className}>
      <span className={isDark ? 'text-white' : 'text-gray-950'}>{brand}</span>
    </span>
  );
}

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<BrandSettings>(defaultBrandSettings);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) return;
      const data = await res.json();
      if (data && typeof data === 'object') {
        const logoUrl = data.brand_logo_url !== undefined && data.brand_logo_url !== ''
          ? data.brand_logo_url
          : '/assets/logo.png';
        const logoType = (data.brand_logo_type === 'preset' ? 'preset' : 'upload') as 'preset' | 'upload' | 'url';

        setSettings({
          brandName: data.brand_name || 'CampRent',
          brandTagline: data.brand_tagline !== undefined ? data.brand_tagline : 'Outdoor Equipment',
          brandLogoType: logoType,
          brandLogoPreset: (data.brand_logo_preset || 'mountain') as 'mountain' | 'tent' | 'compass' | 'trees' | 'flame',
          brandLogoUrl: logoUrl,
        });
      }
    } catch (err) {
      console.warn('Gagal memuat identitas brand:', err);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateBrandLocally = (newSettings: Partial<BrandSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <BrandContext.Provider
      value={{
        ...settings,
        refreshBrand: fetchSettings,
        updateBrandLocally,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  return useContext(BrandContext);
}
