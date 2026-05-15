
"use client";

import React from 'react';
import Link from 'next/link';
import { Manga } from '@/types/manga';
import SafeImage from '@/components/SafeImage';
import { motion } from 'framer-motion';
import { Star, Clock, Zap, ExternalLink } from 'lucide-react';
import { cn, truncateTitle } from '@/lib/utils';
import FlagBadge from '../ui/FlagBadge';

interface MangaCardProps {
  manga: Manga;
  isRecommended?: boolean;
  compact?: boolean;
}

/**
 * Standardized High-Fidelity Manga Card
 * Optimized for grid display with proper star ratings and source identification.
 */
export default function MangaCard({ manga, isRecommended, compact }: MangaCardProps) {
  // Logic for 'New' badge (updated within 48 hours)
  const isNew = manga.updatedAt && (Date.now() - new Date(manga.updatedAt).getTime() < 172800000);
  
  const displayGenres = manga.genres.slice(0, compact ? 1 : 2);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative w-full h-full"
    >
      <Link href={`/manga/${manga.id}?source=${manga.source}`} className="block select-none">
        {/* Poster Matrix */}
        <div className={cn(
          "shinigami-card aspect-[2/3] relative rounded-[2rem] overflow-hidden bg-[#0a0a0f] border transition-all duration-700 shadow-2xl",
          isRecommended ? "border-accent/40 ring-1 ring-accent/20" : "border-white/5 group-hover:border-accent/30"
        )}>
          <SafeImage 
            src={manga.cover} 
            alt={manga.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          />
          
          {/* Narrative Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
          
          {/* Origin Node Badge */}
          <div className="absolute top-4 right-4 z-20">
             <FlagBadge source={manga.source} size="sm" className="shadow-2xl" />
          </div>

          {/* New Signal Indicator */}
          {isNew && !compact && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-black text-[7px] font-black uppercase tracking-widest rounded-lg shadow-xl shadow-green-500/20">
              NEW SIGNAL
            </div>
          )}

          {/* Data Meta Footer */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border backdrop-blur-md",
                manga.status.toLowerCase() === 'ongoing' ? 'text-accent border-accent/20 bg-accent/5' : 'text-green-400 border-green-500/20 bg-green-500/5'
              )}>
                {manga.status}
              </span>
            </div>

            {/* Performance Metric (Rating) */}
            {manga.rating && (
              <div className="flex items-center gap-1 text-yellow-400 bg-black/80 px-2 py-1 rounded-lg backdrop-blur-md border border-white/10 shadow-2xl">
                <Star className="w-2.5 h-2.5 fill-current" />
                <span className="text-[8px] font-black">{manga.rating}</span>
              </div>
            )}
          </div>

          {/* Quick Access Overlay (Hover) */}
          <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
             <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 transform scale-75 group-hover:scale-100 transition-transform">
                <ExternalLink className="w-5 h-5 text-white" />
             </div>
          </div>
        </div>

        {/* Narrative Signature */}
        <div className="mt-4 space-y-2 px-1">
          <h3 className={cn(
            "font-black uppercase tracking-tight text-white leading-tight group-hover:text-accent transition-colors duration-500 line-clamp-1",
            compact ? "text-[10px]" : "text-[12px]"
          )}>
            {truncateTitle(manga.title, 40)}
          </h3>
          
          <div className="flex items-center gap-3">
             <div className="flex flex-wrap gap-1.5">
               {displayGenres.map((g, i) => (
                 <span key={i} className="text-[7px] font-bold text-neutral-500 uppercase tracking-widest border border-white/5 px-2 py-0.5 rounded-md bg-white/5 whitespace-nowrap">
                   {g}
                 </span>
               ))}
             </div>
             <span className="w-1 h-1 rounded-full bg-neutral-800 shrink-0" />
             <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-[0.2em] shrink-0">
               {manga.year || '2024'}
             </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
