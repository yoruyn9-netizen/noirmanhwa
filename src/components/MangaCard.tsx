"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Manga } from '@/lib/types';
import { getCoverUrl, getMangaTitle } from '@/lib/utils';
import { TrendingUp, Clock } from 'lucide-react';

interface MangaCardProps {
  manga: Manga;
  isTrending?: boolean;
}

export default function MangaCard({ manga, isTrending }: MangaCardProps) {
  const coverUrl = getCoverUrl(manga, '512');
  const title = getMangaTitle(manga);

  return (
    <Link href={`/series/${manga.id}`} className="group block h-full">
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-secondary/30 border border-white/5 transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
        <Image
          src={coverUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
        />
        
        {isTrending && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-[10px] font-bold uppercase tracking-tighter rounded flex items-center gap-1 shadow-lg">
            <TrendingUp className="w-3 h-3" /> HOT
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
           <p className="text-[10px] text-accent font-bold uppercase mb-1">{manga.attributes.status}</p>
           <h3 className="font-bold text-sm leading-tight line-clamp-2">{title}</h3>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <h3 className="font-bold text-sm line-clamp-1 group-hover:text-accent transition-colors">{title}</h3>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
           <Clock className="w-3 h-3" /> {manga.attributes.status === 'ongoing' ? 'Weekly' : 'Finished'}
        </div>
      </div>
    </Link>
  );
}