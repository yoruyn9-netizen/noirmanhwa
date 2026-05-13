
"use client";

import React from 'react';
import Link from 'next/link';
import { Manga } from '@/lib/types';
import { getCoverUrl, getMangaTitle } from '@/lib/utils';
import { Flame, Clock } from 'lucide-react';
import MangaImage from '@/components/MangaImage';

interface MangaCardProps {
  manga: Manga;
  isTrending?: boolean;
}

export default function MangaCard({ manga, isTrending }: MangaCardProps) {
  const coverUrl = getCoverUrl(manga, '512');
  const title = getMangaTitle(manga);

  return (
    <Link href={`/series/${manga.id}`} className="group block">
      <div className="shinigami-card aspect-[2/3] relative rounded-2xl overflow-hidden bg-[#0a0a0f] border border-white/5 transition-all duration-500 hover:border-accent/40 hover:-translate-y-1">
        <MangaImage
          src={coverUrl}
          alt={title}
          className="w-full h-full group-hover:scale-110"
        />
        
        {isTrending && (
          <div className="absolute top-3 left-3 px-2 py-0.5 bg-accent text-[8px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5 z-10 border border-white/10 backdrop-blur-md shadow-lg shadow-accent/20">
            <Flame className="w-3 h-3 fill-white" /> Trending
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-4 z-10">
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
