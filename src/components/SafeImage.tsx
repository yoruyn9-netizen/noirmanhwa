
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
}

/**
 * A robust image component that uses an API proxy to bypass CORS
 * and provides stylized fallbacks for missing content.
 */
export default function SafeImage({ src, alt, className, fallbackText }: SafeImageProps) {
  const [error, setError] = useState(false);
  
  // Use the proxy route for external URLs
  const proxiedUrl = src.startsWith('http') 
    ? `/api/proxy-image?url=${encodeURIComponent(src)}` 
    : src;

  if (error || !src) {
    return (
      <div className={cn(
        "w-full h-full bg-gradient-to-br from-neutral-800 to-[#0a0a0f] flex items-center justify-center p-4 rounded-xl border border-white/5",
        className
      )}>
        <span className="text-[10px] text-neutral-500 font-black uppercase text-center line-clamp-2">
          {fallbackText || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={proxiedUrl}
      alt={alt}
      className={cn("w-full h-full object-cover transition-opacity duration-500", className)}
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
    />
  );
}
