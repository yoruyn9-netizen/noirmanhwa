
'use client';

import React, { useState } from 'react';

interface MangaCoverProps {
  mangaId: string;
  relationships: any[];
  title: string;
  className?: string;
}

export default function MangaCover({ mangaId, relationships, title, className }: MangaCoverProps) {
  const [errorCount, setErrorCount] = useState(0);
  const cover = relationships?.find(r => r.type === 'cover_art');
  const fileName = cover?.attributes?.fileName;
  
  // URL construction for MangaDex Covers
  // Attempt 1: 512px thumbnail
  // Attempt 2: Original image
  const getUrl = () => {
    if (!fileName) return null;
    if (errorCount === 0) return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.512.jpg`;
    return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}`;
  };

  const imageUrl = getUrl();

  if (errorCount >= 2 || !imageUrl) {
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
        setErrorCount(prev => prev + 1);
      }}
    />
  );
}
