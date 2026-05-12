"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Manga } from '@/lib/types';
import { getCoverUrl, getMangaTitle } from '@/lib/utils';
import { Flame, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MangaCardProps {
  manga: Manga;
  isTrending?: boolean;
}

export default function MangaCard({ manga, isTrending }: MangaCardProps) {
  const [imgError, setImgError] = useState(false);
  const coverUrl = getCoverUrl(manga, '512');
  const title = getMangaTitle(manga);

  return (
    <Link href={`/series/${manga.id}`} className="group block">
      <div className="shinigami-card aspect-[2/3]">
        {!imgError && coverUrl ? (
          <Image
            src={coverUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, 25vw"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a23] to-black p-4 text-center">
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{title}</span>
          </div>
        )}
        
        {isTrending && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-accent text-[8px] font-black uppercase tracking-widest rounded flex items-center gap-1 z-10 border border-white/10 backdrop-blur-md">
            <Flame className="w-2.5 h-2.5 fill-white" /> Hot
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-3 z-10">
           <h3 className="font-bold text-[11px] leading-tight line-clamp-2 text-glow">{title}</h3>
        </div>
      </div>
      <div className="mt-2.5 space-y-1 px-1">
        <h3 className="font-bold text-[12px] line-clamp-1 group-hover:text-accent transition-colors tracking-tight">{title}</h3>
        <div className="flex items-center gap-2">
           <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
             <Clock className="w-2.5 h-2.5" /> {manga.attributes.year || '2024'}
           </span>
           <span className="w-0.5 h-0.5 rounded-full bg-white/10" />
           <span className="text-[9px] font-black text-accent uppercase tracking-widest">{manga.attributes.status}</span>
        </div>
      </div>
    </Link>
  );
}