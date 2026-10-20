import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { logoFor } from '../utils/responsiveImage';

interface BrandLogoProps {
  variant?: 'header' | 'footer' | 'icon' | 'compact';
  className?: string;
}

const OFFICIAL_LOGO_LOCAL = '/assets/brand/plush-comfort-official-logo.webp';
const OFFICIAL_LOGO_ROOT = '/logo.webp';
const OFFICIAL_LOGO_REMOTE = 'https://plushcomfort.uk/wp-content/uploads/2026/07/WhatsApp_Image_2026-07-20_at_13.49.24-removebg-preview.png';

export const BrandLogo: React.FC<BrandLogoProps> = ({ variant = 'header', className = '' }) => {
  const { settings } = useStore();
  const [retryIndex, setRetryIndex] = useState(0);

  const fallbackSources = [
    settings?.logoUrl || OFFICIAL_LOGO_LOCAL,
    OFFICIAL_LOGO_ROOT,
    OFFICIAL_LOGO_REMOTE,
  ];

  const currentLogoSrc = logoFor(fallbackSources[Math.min(retryIndex, fallbackSources.length - 1)])!;
  const brandAlt = settings?.logoAlt || settings?.brandName || 'Plush Comfort UK - Luxury Handcrafted Furniture';

  const handleError = () => {
    if (retryIndex < fallbackSources.length - 1) {
      setRetryIndex((prev) => prev + 1);
    }
  };

  if (variant === 'icon') {
    return (
      <img
        src={currentLogoSrc}
        alt={brandAlt}
        onError={handleError}
        className={`w-10 h-10 object-contain rounded-lg shrink-0 ${className}`}
      />
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`flex flex-col items-start gap-2 select-none ${className}`}>
        <img
          src={currentLogoSrc}
          alt={brandAlt}
          onError={handleError}
          className="h-11 sm:h-13 w-auto max-w-[220px] sm:max-w-[240px] object-contain drop-shadow-xs"
        />
      </div>
    );
  }

  // Header / Compact
  const heightClass = variant === 'compact' ? 'h-8 sm:h-9' : 'h-10 sm:h-12';
  return (
    <div className={`flex items-center select-none group cursor-pointer ${className}`}>
      <img
        src={currentLogoSrc}
        alt={brandAlt}
        onError={handleError}
        className={`${heightClass} w-auto max-w-[210px] sm:max-w-[250px] object-contain transition-transform duration-200 group-hover:scale-[1.02]`}
      />
    </div>
  );
};
