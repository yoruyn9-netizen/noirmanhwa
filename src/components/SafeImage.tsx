
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
 * Optimized SafeImage using a local Proxy to bypass CORS and referer blocks.
 * Specifically handles MangaDex domains for Manga, Manhwa, and Manhua.
 */
export default function SafeImage({ src, alt, className, fallbackText, onError }: SafeImageProps) {
  const [internalError, setInternalError] = useState(false);
  
  // Use the proxy route for all external MangaDex URLs
  const proxiedUrl = src.startsWith('http') 
    ? `/api/proxy-image?url=${encodeURIComponent(src)}` 
    : src;

  // Reset error state if src changes
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
        "w-full h-full bg-gradient-to-br from-neutral-800 to-[#0a0a0f] flex items-center justify-center p-4 rounded-xl border border-white/5",
        className
      )}>
        <span className="text-[10px] text-neutral-500 font-black uppercase text-center line-clamp-2 opacity-50 tracking-widest">
          {fallbackText || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={proxiedUrl}
      alt={alt}
      className={cn("w-full h-full object-cover transition-opacity duration-700", className)}
      loading="lazy"
      decoding="async"
      onError={handleError}
    />
  );
}
