
'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
  onError?: () => void;
}

/**
 * Optimized SafeImage using the local API Proxy.
 * Prevents CORS blocks and Referer rejection.
 */
export default function SafeImage({ src, alt, className, fallbackText, onError }: SafeImageProps) {
  const [internalError, setInternalError] = useState(false);
  
  // Always route external MangaDex content through the proxy
  const proxiedUrl = (src.includes('mangadex.org') || src.includes('mangadex.network'))
    ? `/api/proxy-image?url=${encodeURIComponent(src)}` 
    : src;

  useEffect(() => {
    setInternalError(false);
  }, [src]);

  const handleError = () => {
    setInternalError(true);
    if (onError) onError();
  };

  if (internalError || !src) {
    return (
      <div className={cn(
        "w-full h-full bg-gradient-to-br from-[#0a0a0f] to-neutral-900 flex items-center justify-center p-4 rounded-xl border border-white/5",
        className
      )}>
        <span className="text-[8px] text-neutral-700 font-black uppercase text-center line-clamp-2 opacity-40 tracking-widest">
          {fallbackText || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={proxiedUrl}
      alt={alt}
      className={cn("w-full h-full object-cover", className)}
      loading="lazy"
      decoding="async"
      onError={handleError}
    />
  );
}
