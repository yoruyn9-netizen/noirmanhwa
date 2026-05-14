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

/**
 * Redesigned Manga Card
 * Optimized for grid display with proper star ratings and type badges.
 */
export default function MangaCard({ manga, isRecommended, compact }: MangaCardProps) {
  // Logic for 'New' badge (updated within 24 hours)
  const isNew = manga.updatedAt && (Date.now() - new Date(manga.updatedAt).getTime() < 86400000);
  
  const typeConfig = {
    manhwa: { label: 'Manhwa', color: 'bg-indigo-600', flag: '🇰🇷' },
    manga: { label: 'Manga', color: 'bg-red-600', flag: '🇯🇵' },
    manhua: { label: 'Manhua', color: 'bg-amber-600', flag: '🇨🇳' },
  };

  const currentType = typeConfig[manga.type as keyof typeof typeConfig] || typeConfig.manga;
  const displayGenres = manga.genres.slice(0, compact ? 1 : 2);
  const extraGenresCount = manga.genres.length - displayGenres.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative w-full h-full"
    >
      <Link href={`/manga/${manga.id}?source=${manga.source}`} className="block select-none" draggable={false}>
        {/* Poster Container */}
        <div className={cn(
          "shinigami-card aspect-[2/3] max-h-[300px] relative rounded-2xl overflow-hidden bg-[#0a0a0f] border transition-all duration-700",
          isRecommended ? "border-accent/40 shadow-[0_0_20px_rgba(139,92,246,0.15)]" : "border-white/5 group-hover:border-accent/30"
        )}>
          <SafeImage 
            src={manga.cover} 
            alt={manga.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 pointer-events-none"
          />
          
          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />
          
          {/* Type Badge */}
          <div className="absolute top-2.5 right-2.5 z-20">
             <div className={cn(
                "px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-wider text-white shadow-xl flex items-center gap-1 backdrop-blur-md border border-white/10",
                currentType.color
              )}>
                <span>{currentType.flag}</span>
                {currentType.label}
              </div>
          </div>

          {/* New Tag */}
          {isNew && !compact && (
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-green-500 text-black text-[7px] font-black uppercase tracking-widest rounded-lg shadow-lg">
              NEW
            </div>
          )}

          {/* Metadata Footer */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
            <span className={cn(
              "text-[6px] font-black uppercase tracking-widest px-2 py-1 bg-black/60 backdrop-blur-xl rounded-lg border border-white/5",
              manga.status === 'Ongoing' ? 'text-accent' : 'text-green-400'
            )}>
              {manga.status}
            </span>

            {/* STAR RATING - Actual Rating Display */}
            {manga.rating && (
              <div className="flex items-center gap-1 text-yellow-400 bg-black/80 px-2 py-1 rounded-lg backdrop-blur-md border border-white/5 shadow-xl">
                <Star className="w-2.5 h-2.5 fill-current" />
                <span className="text-[8px] font-black">{manga.rating}</span>
              </div>
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className="mt-3 space-y-1.5 px-0.5">
          <h3 className={cn(
            "font-black uppercase tracking-tight text-white leading-tight group-hover:text-accent transition-colors duration-500 line-clamp-2",
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
               {extraGenresCount > 0 && (
                 <span className="text-[7px] font-bold text-neutral-700 uppercase">+{extraGenresCount}</span>
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

/**
 * Skeleton Loader for Grid Synchronization
 */
export function MangaCardSkeleton() {
  return (
    <div className="space-y-3 animate-pulse w-full">
      <div className="aspect-[2/3] max-h-[300px] bg-neutral-900/50 rounded-2xl border border-white/5" />
      <div className="space-y-2 px-1">
        <div className="h-2.5 bg-neutral-900 rounded-full w-full" />
        <div className="h-2 bg-neutral-900 rounded-full w-2/3" />
      </div>
    </div>
  );
}
