"use client";

import React from 'react';
import Link from 'next/link';
import { Manga } from '@/types/manga';
import SafeImage from '@/components/SafeImage';
import { motion } from 'framer-motion';
import { Star, Clock, Zap } from 'lucide-react';
import { cn, truncateTitle } from '@/lib/utils';

interface MangaCardProps {
  manga: Manga;
  isRecommended?: boolean;
  compact?: boolean;
}

export default function MangaCard({ manga, isRecommended, compact }: MangaCardProps) {
  const isNew = manga.updatedAt && (Date.now() - new Date(manga.updatedAt).getTime() < 86400000);
  
  const typeLabels = {
    manhwa: { label: 'Manhwa', color: 'bg-indigo-600', flag: '🇰🇷' },
    manga: { label: 'Manga', color: 'bg-red-600', flag: '🇯🇵' },
    manhua: { label: 'Manhua', color: 'bg-amber-600', flag: '🇨🇳' },
  };

  const currentType = typeLabels[manga.type as keyof typeof typeLabels] || typeLabels.manga;
  const displayGenres = manga.genres.slice(0, compact ? 1 : 2);
  const extraGenres = manga.genres.length - displayGenres.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative w-full"
    >
      <Link href={`/manga/${manga.id}?source=${manga.source}`} className="block select-none" draggable={false}>
        <div className="shinigami-card aspect-[2/3] relative rounded-2xl overflow-hidden bg-[#0a0a0f] border border-white/5 transition-all duration-700 group-hover:border-accent/50">
          <SafeImage 
            src={manga.cover} 
            alt={manga.title} 
            className="group-hover:scale-110 transition-transform duration-1000 pointer-events-none"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
          
          <div className="absolute top-2.5 right-2.5 z-20">
             <div className={cn(
                "px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-wider text-white shadow-xl flex items-center gap-1 backdrop-blur-md border border-white/10",
                currentType.color
              )}>
                <span>{currentType.flag}</span>
                {currentType.label}
              </div>
          </div>

          {isNew && !compact && (
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-green-500 text-black text-[7px] font-black uppercase tracking-widest rounded-lg shadow-lg">
              NEW
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
            <span className={cn(
              "text-[6px] font-black uppercase tracking-widest px-2 py-1 bg-black/60 backdrop-blur-xl rounded-lg border border-white/5",
              manga.status === 'Ongoing' ? 'text-accent' : 'text-green-400'
            )}>
              {manga.status}
            </span>
            {manga.rating && (
              <div className="flex items-center gap-1 text-yellow-400 bg-black/40 px-1.5 py-0.5 rounded-lg backdrop-blur-md">
                <Star className="w-2 h-2 fill-current" />
                <span className="text-[7px] font-black">{manga.rating}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 space-y-1.5 px-0.5">
          <h3 className={cn(
            "font-black uppercase tracking-tight text-white leading-tight group-hover:text-accent transition-colors duration-500 manga-title-truncate",
            compact ? "text-[10px]" : "text-[11px]"
          )}>
            {truncateTitle(manga.title, 45)}
          </h3>
          
          <div className="flex items-center gap-2">
             <div className="flex flex-wrap gap-1">
               {displayGenres.map((g, i) => (
                 <span key={i} className="text-[7px] font-bold text-neutral-500 uppercase tracking-widest border border-white/5 px-1.5 py-0.5 rounded-md bg-white/5 whitespace-nowrap">
                   {g}
                 </span>
               ))}
               {extraGenres > 0 && (
                 <span className="text-[7px] font-bold text-neutral-700 uppercase">+{extraGenres}</span>
               )}
             </div>
             <span className="w-0.5 h-0.5 rounded-full bg-neutral-800 shrink-0" />
             <span className="text-[7px] font-bold text-neutral-600 uppercase tracking-widest shrink-0">
               {manga.year || '24'}
             </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function MangaCardSkeleton() {
  return (
    <div className="space-y-3 animate-pulse w-full">
      <div className="aspect-[2/3] bg-neutral-900/50 rounded-2xl border border-white/5" />
      <div className="space-y-2 px-1">
        <div className="h-2.5 bg-neutral-900 rounded-full w-full" />
        <div className="h-2 bg-neutral-900 rounded-full w-2/3" />
      </div>
    </div>
  );
}
