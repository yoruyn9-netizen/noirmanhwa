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
            className="object-cover transition-transform duration-1000 group-hover:scale-110 brightness-[0.85] group-hover:brightness-100"
            sizes="(max-width: 640px) 50vw, 25vw"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a0f] to-black p-4 text-center">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">{title}</span>
          </div>
        )}
        
        {isTrending && (
          <div className="absolute top-3 left-3 px-2 py-0.5 bg-accent text-[8px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 z-10 border border-white/10 backdrop-blur-md shadow-lg shadow-accent/20">
            <Flame className="w-3 h-3 fill-white" /> Trending
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-4 z-10">
           <h3 className="font-bold text-[10px] leading-tight line-clamp-2 text-glow uppercase tracking-wider">{title}</h3>
        </div>
      </div>
      <div className="mt-3 space-y-1 px-1.5">
        <h3 className="font-black text-[11px] line-clamp-1 group-hover:text-accent transition-colors tracking-tight uppercase">{title}</h3>
        <div className="flex items-center gap-2">
           <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
             <Clock className="w-3 h-3" /> {manga.attributes.year || '2024'}
           </span>
           <span className="w-1 h-1 rounded-full bg-white/5" />
           <span className="text-[8px] font-black text-accent uppercase tracking-widest opacity-80">{manga.attributes.status}</span>
        </div>
      </div>
    </Link>
  );
}
