
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface MangaImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

/**
 * Resilient Image component using the dedicated /api/image proxy.
 */
export default function MangaImage({ src, alt, className = '', priority = false }: MangaImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // If no source or failed previously, show Noir-styled placeholder
  if (error || !src) {
    return (
      <div className={cn(
        "bg-gradient-to-br from-neutral-900 to-[#020205] flex flex-col items-center justify-center p-4 border border-white/5",
        className
      )}>
        <div className="w-10 h-10 mb-2 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
          <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-[7px] font-black uppercase tracking-widest text-neutral-700 text-center line-clamp-2">
          {alt || 'Frame Failed'}
        </p>
      </div>
    );
  }

  // Route through the local proxy
  const proxyUrl = `/api/image?url=${encodeURIComponent(src)}`;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {loading && (
        <div className="absolute inset-0 bg-neutral-900/50 animate-pulse flex items-center justify-center">
           <div className="w-4 h-4 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
        </div>
      )}
      <img
        src={proxyUrl}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-all duration-700",
          loading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
        )}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoading(false)}
        onError={() => {
          console.warn(`[Image Fail]: ${src}`);
          setError(true);
          setLoading(false);
        }}
      />
    </div>
  );
}
