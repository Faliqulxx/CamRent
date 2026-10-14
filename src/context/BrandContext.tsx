'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MountainSnow, Tent, Compass, Trees, Flame } from 'lucide-react';

export interface BrandSettings {
  brandName: string;
  brandTagline: string;
  brandLogoType: 'preset' | 'url';
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
  brandLogoType: 'preset',
  brandLogoPreset: 'mountain',
  brandLogoUrl: '',
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
  type,
  preset,
  url,
  brandName,
  className = 'w-7 h-7',
}: {
  type?: 'preset' | 'url';
  preset?: 'mountain' | 'tent' | 'compass' | 'trees' | 'flame';
  url?: string;
  brandName?: string;
  className?: string;
}) {
  if (type === 'url' && url && url.trim() !== '') {
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

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<BrandSettings>(defaultBrandSettings);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) return;
      const data = await res.json();
      if (data && typeof data === 'object') {
        setSettings({
          brandName: data.brand_name || 'CampRent',
          brandTagline: data.brand_tagline !== undefined ? data.brand_tagline : 'Outdoor Equipment',
          brandLogoType: (data.brand_logo_type === 'url' ? 'url' : 'preset') as 'preset' | 'url',
          brandLogoPreset: (data.brand_logo_preset || 'mountain') as 'mountain' | 'tent' | 'compass' | 'trees' | 'flame',
          brandLogoUrl: data.brand_logo_url || '',
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
