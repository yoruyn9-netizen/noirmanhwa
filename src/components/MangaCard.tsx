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
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, 25vw"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a23] to-black p-4 text-center">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-white/40">{title}</span>
          </div>
        )}
        
        {isTrending && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-accent text-[9px] font-black uppercase tracking-widest rounded-md flex items-center gap-1 shadow-2xl z-10 border border-white/10 backdrop-blur-md">
            <Flame className="w-3 h-3 fill-white" /> HOT
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-5 z-10">
           <p className="text-[9px] text-accent font-black uppercase tracking-widest mb-1">{manga.attributes.status}</p>
           <h3 className="font-bold text-sm leading-tight line-clamp-2 text-glow">{title}</h3>
        </div>
      </div>
      <div className="mt-4 space-y-1.5 px-1">
        <h3 className="font-bold text-sm line-clamp-1 group-hover:text-accent transition-colors duration-300 tracking-tight">{title}</h3>
        <div className="flex items-center gap-3">
           <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
             <Clock className="w-3 h-3" /> {manga.attributes.year || '2024'}
           </span>
           <span className="w-1 h-1 rounded-full bg-white/10" />
           <span className="text-[9px] font-black text-accent uppercase tracking-widest">{manga.attributes.status}</span>
        </div>
      </div>
    </Link>
  );
}