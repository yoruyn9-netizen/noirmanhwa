
'use client';

import React, { useState } from 'react';

interface MangaCoverProps {
  mangaId: string;
  relationships: any[];
  title: string;
  className?: string;
}

export default function MangaCover({ mangaId, relationships, title, className }: MangaCoverProps) {
  const [error, setError] = useState(false);
  const cover = relationships?.find(r => r.type === 'cover_art');
  const fileName = cover?.attributes?.fileName;
  
  // URL construction for MangaDex Covers
  const imageUrl = fileName 
    ? `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.512.jpg`
    : null;

  if (error || !imageUrl) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center p-4 rounded-xl border border-white/5 ${className}`}>
        <span className="text-[10px] text-neutral-500 font-black uppercase text-center line-clamp-2">{title}</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={title}
      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${className}`}
      loading="lazy"
      onError={() => {
        console.error(`[Cover Error] Failed to load: ${imageUrl}`);
        setError(true);
      }}
    />
  );
}
