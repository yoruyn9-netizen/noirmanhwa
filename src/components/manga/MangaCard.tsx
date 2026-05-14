
"use client";

import React from 'react';
import Link from 'next/link';
import { Manga } from '@/types/manga';
import SafeImage from '@/components/SafeImage';
import FlagBadge from '@/components/ui/FlagBadge';
import { motion } from 'framer-motion';
import { Star, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MangaCardProps {
  manga: Manga;
  isRecommended?: boolean;
}

export default function MangaCard({ manga, isRecommended }: MangaCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group relative"
    >
      <Link href={`/manga/${manga.id}?source=${manga.source}`} className="block">
        <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden border border-white/5 bg-[#0a0a0f] shadow-2xl transition-all duration-700 group-hover:border-accent/40 group-hover:shadow-accent/10">
          <SafeImage 
            src={manga.cover} 
            alt={manga.title} 
            className="group-hover:scale-110 transition-transform duration-1000"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          
          {/* Status Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <span className="text-[7px] font-black uppercase tracking-widest px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-neutral-400 border border-white/5">
              {manga.status}
            </span>
            {manga.rating && (
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="w-2.5 h-2.5 fill-current" />
                <span className="text-[8px] font-black">{manga.rating}</span>
              </div>
            )}
          </div>

          {/* Badges */}
          <FlagBadge 
            source={manga.source} 
            language={manga.language} 
            className="absolute top-3 right-3" 
            size="sm"
          />
          
          {isRecommended && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-accent to-pink-500 text-white text-[7px] font-black uppercase tracking-widest rounded-lg shadow-lg animate-pulse">
              ⭐ REC
            </div>
          )}
        </div>

        <div className="mt-4 space-y-1 px-1">
          <h3 className="text-[11px] font-black uppercase tracking-tight text-white line-clamp-2 leading-tight group-hover:text-accent transition-colors">
            {manga.title}
          </h3>
          <div className="flex items-center gap-2 opacity-40">
            <Clock className="w-2.5 h-2.5 text-neutral-500" />
            <span className="text-[7px] font-bold uppercase tracking-widest text-neutral-500">Modified Signal</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function MangaCardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="aspect-[2/3] bg-neutral-900 rounded-[2rem] border border-white/5" />
      <div className="space-y-2 px-2">
        <div className="h-3 bg-neutral-900 rounded w-full" />
        <div className="h-2 bg-neutral-900 rounded w-1/2" />
      </div>
    </div>
  );
}
