
"use client";

import React from 'react';
import Link from 'next/link';
import { Manga } from '@/types/manga';
import SafeImage from '@/components/SafeImage';
import FlagBadge from '@/components/ui/FlagBadge';
import { motion } from 'framer-motion';
import { Star, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MangaCardProps {
  manga: Manga;
  isRecommended?: boolean;
}

export default function MangaCard({ manga, isRecommended }: MangaCardProps) {
  // Check if updated in last 24h
  const isNew = manga.updatedAt && (Date.now() - new Date(manga.updatedAt).getTime() < 86400000);
  
  const typeLabels = {
    manhwa: { label: 'Manhwa', color: 'bg-indigo-600', flag: '🇰🇷' },
    manga: { label: 'Manga', color: 'bg-red-600', flag: '🇯🇵' },
    manhua: { label: 'Manhua', color: 'bg-amber-600', flag: '🇨🇳' },
  };

  const currentType = typeLabels[manga.type as keyof typeof typeLabels] || typeLabels.manga;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <Link href={`/manga/${manga.id}?source=${manga.source}`} className="block">
        <div className="relative aspect-[2/3] rounded-[2.2rem] overflow-hidden border border-white/5 bg-[#0a0a0f] shadow-2xl transition-all duration-700 group-hover:border-accent/50 group-hover:shadow-[0_20px_40px_rgba(139,92,246,0.2)]">
          <SafeImage 
            src={manga.cover} 
            alt={manga.title} 
            className="group-hover:scale-110 transition-transform duration-1000"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
          
          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            <div className={cn(
              "px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest text-white shadow-xl flex items-center gap-2 backdrop-blur-md border border-white/10",
              currentType.color
            )}>
              <span>{currentType.flag}</span>
              {currentType.label}
            </div>
            
            {isNew && (
              <div className="px-3 py-1 bg-green-500 text-black text-[8px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-green-500/20 animate-bounce">
                NEW
              </div>
            )}
          </div>

          {/* Status Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <span className={cn(
              "text-[7px] font-black uppercase tracking-widest px-2.5 py-1.5 bg-black/60 backdrop-blur-xl rounded-xl border border-white/5",
              manga.status === 'Ongoing' ? 'text-accent' : 'text-green-400'
            )}>
              {manga.status}
            </span>
            {manga.rating && (
              <div className="flex items-center gap-1 text-yellow-400 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-md">
                <Star className="w-2.5 h-2.5 fill-current" />
                <span className="text-[8px] font-black">{manga.rating}</span>
              </div>
            )}
          </div>
          
          {isRecommended && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
               <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.6)]">
                  <Zap className="w-6 h-6 text-white fill-current" />
               </div>
            </div>
          )}
        </div>

        <div className="mt-5 space-y-2 px-1">
          <h3 className="text-[12px] font-black uppercase tracking-tight text-white line-clamp-2 leading-tight group-hover:text-accent transition-colors duration-500">
            {manga.title}
          </h3>
          <div className="flex items-center gap-3">
             <div className="flex -space-x-1.5">
               {manga.genres.slice(0, 2).map((g, i) => (
                 <span key={i} className="text-[6px] font-black text-neutral-500 uppercase tracking-widest border border-white/5 px-2 py-0.5 rounded-full bg-white/5">
                   {g}
                 </span>
               ))}
             </div>
             <span className="w-1 h-1 rounded-full bg-neutral-800" />
             <span className="text-[7px] font-bold text-neutral-600 uppercase tracking-widest">
               {manga.year || '2024'}
             </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function MangaCardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="aspect-[2/3] bg-neutral-900 rounded-[2.5rem] border border-white/5" />
      <div className="space-y-3 px-2">
        <div className="h-3 bg-neutral-900 rounded-full w-full" />
        <div className="h-2 bg-neutral-900 rounded-full w-2/3" />
      </div>
    </div>
  );
}
