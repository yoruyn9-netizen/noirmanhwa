
'use client';

import React, { useState } from 'react';
import SafeImage from './SafeImage';

interface MangaCoverProps {
  mangaId: string;
  relationships: any[];
  title: string;
  className?: string;
}

/**
 * Resilient Manga Cover component.
 * Uses a triple-redundant strategy:
 * 1. Proxied Thumbnail (512px)
 * 2. Proxied Original (Full Res)
 * 3. Styled Placeholder
 */
export default function MangaCover({ mangaId, relationships, title, className }: MangaCoverProps) {
  const [useOriginal, setUseOriginal] = useState(false);
  const [isError, setIsError] = useState(false);

  const cover = relationships?.find(r => r.type === 'cover_art');
  const fileName = cover?.attributes?.fileName;

  if (isError || !fileName) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-neutral-800 to-[#0a0a0f] flex items-center justify-center p-6 rounded-2xl border border-white/5 ${className}`}>
        <span className="text-[9px] text-neutral-500 font-black uppercase text-center leading-tight tracking-widest opacity-60">
          {title}
        </span>
      </div>
    );
  }

  // Construct URL. Fallback to original if 512px fails.
  const baseUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
  const imageUrl = useOriginal ? baseUrl : `${baseUrl}.512.jpg`;

  return (
    <SafeImage
      src={imageUrl}
      alt={title}
      className={className}
      onError={() => {
        if (!useOriginal) {
          // Attempt loading original if thumbnail fails
          setUseOriginal(true);
        } else {
          // Total failure, show placeholder
          setIsError(true);
        }
      }}
    />
  );
}
