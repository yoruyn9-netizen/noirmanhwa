
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
 * High-reliability Manga Cover component.
 * Automatically handles thumbnail failures by switching to original files.
 */
export default function MangaCover({ mangaId, relationships, title, className }: MangaCoverProps) {
  const [useOriginal, setUseOriginal] = useState(false);
  const [isError, setIsError] = useState(false);

  const coverRel = relationships?.find(r => r.type === 'cover_art');
  const fileName = coverRel?.attributes?.fileName;

  if (isError || !fileName) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-[#0a0a0f] to-neutral-900 flex items-center justify-center p-6 rounded-[2rem] border border-white/5 ${className}`}>
        <span className="text-[7px] text-neutral-600 font-black uppercase text-center leading-tight tracking-[0.3em] opacity-40">
          {title}
        </span>
      </div>
    );
  }

  // Base URL for the image
  const baseUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
  // MangaDex thumbnail naming: filename.512.jpg
  const imageUrl = useOriginal ? baseUrl : `${baseUrl}.512.jpg`;

  return (
    <SafeImage
      src={imageUrl}
      alt={title}
      className={className}
      onError={() => {
        if (!useOriginal) {
          // If 512px fails (common for new entries), fallback to original
          setUseOriginal(true);
        } else {
          // If both fail, show placeholder
          setIsError(true);
        }
      }}
    />
  );
}
