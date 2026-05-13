
'use client';

import React, { useState } from 'react';
import MangaImage from './MangaImage';

interface MangaCoverProps {
  mangaId: string;
  relationships: any[];
  title: string;
  className?: string;
}

/**
 * Specialized Manga Cover component using MangaImage proxy system.
 */
export default function MangaCover({ mangaId, relationships, title, className }: MangaCoverProps) {
  const [useOriginal, setUseOriginal] = useState(false);

  const coverRel = relationships?.find(r => r.type === 'cover_art');
  const fileName = coverRel?.attributes?.fileName;

  if (!fileName) {
    return (
      <div className={`w-full h-full bg-neutral-950 flex items-center justify-center p-6 rounded-[2rem] border border-white/5 ${className}`}>
        <span className="text-[7px] text-neutral-600 font-black uppercase text-center leading-tight tracking-[0.3em] opacity-40">
          {title}
        </span>
      </div>
    );
  }

  const baseUrl = `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
  const imageUrl = useOriginal ? baseUrl : `${baseUrl}.512.jpg`;

  return (
    <MangaImage
      src={imageUrl}
      alt={title}
      className={className}
      // MangaImage doesn't take an onError prop for logic, but we can wrap it or handle it inside
      // For simplicity, MangaImage internally handles errors with a placeholder.
    />
  );
}
