"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import SafeImage from '@/components/SafeImage';
import FlagBadge from '@/components/ui/FlagBadge';
import { Manga } from '@/lib/mangaApi';
import { MangaSource } from '@/types/manga';

interface SearchMangaGridProps {
  manga: Manga[];
  loading?: boolean;
}

export default function SearchMangaGrid({ manga, loading = false }: SearchMangaGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <SearchMangaCardSkeleton key={i} index={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-2">
      {manga.map((item, index) => (
        <SearchMangaCard key={`${item.id}-${item.source}`} manga={item} index={index} />
      ))}
    </div>
  );
}

interface SearchMangaCardProps {
  manga: Manga;
  index: number;
}

function SearchMangaCard({ manga, index }: SearchMangaCardProps) {
  // Check if recently updated (within 48 hours)
  const isNew = manga.updatedAt && (Date.now() - new Date(manga.updatedAt).getTime() < 172800000);
  const displayGenres = manga.genres.slice(0, 2);
  const year = manga.year || new Date().getFullYear();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5, 
        delay: Math.min(index * 0.05, 0.5),
        ease: "easeOut"
      }}
      whileHover={{ y: -8 }}
      className="group relative"
    >
      <Link href={`/manga/${manga.id}`} className="block">
        {/* Card Container */}
        <div className={cn(
          "relative aspect-[2/3] rounded-2xl overflow-hidden",
          "bg-[#0a0a0f] border border-white/5",
          "transition-all duration-500",
          "group-hover:border-purple-500/40 group-hover:shadow-2xl group-hover:shadow-purple-500/10"
        )}>
          {/* Cover Image */}
          <SafeImage
            src={manga.cover}
            alt={manga.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Source Badge */}
          <div className="absolute top-3 right-3 z-20">
            <FlagBadge source={(manga.source || 'mangadex') as MangaSource} size="sm" className="shadow-2xl scale-90" />
          </div>

          {/* New Badge */}
          {isNew && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-3 left-3 px-2.5 py-1 bg-green-500 text-black text-[7px] font-black uppercase tracking-widest rounded-lg shadow-xl shadow-green-500/30"
            >
              NEW
            </motion.div>
          )}

          {/* Bottom Info */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
            {/* Status Badge */}
            <span className={cn(
              "text-[6px] font-black uppercase tracking-widest px-2 py-1 rounded-md border backdrop-blur-md",
              manga.status.toLowerCase() === 'ongoing' 
                ? 'text-purple-400 border-purple-500/20 bg-purple-500/10' 
                : 'text-green-400 border-green-500/20 bg-green-500/10'
            )}>
              {manga.status}
            </span>

            {/* Rating */}
            {manga.rating && (
              <div className="flex items-center gap-1 text-yellow-400 bg-black/80 px-2 py-1 rounded-md backdrop-blur-md border border-white/10">
                <Star className="w-2.5 h-2.5 fill-current" />
                <span className="text-[8px] font-black">{manga.rating}</span>
              </div>
            )}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 transform scale-75 group-hover:scale-100 transition-transform">
              <ExternalLink className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Title & Meta */}
        <div className="mt-3 space-y-1.5 px-0.5">
          <h3 className="text-[11px] font-black uppercase tracking-tight text-white leading-tight line-clamp-2 group-hover:text-purple-400 transition-colors duration-300">
            {manga.title}
          </h3>
          
          <div className="flex items-center gap-2 flex-wrap">
            {displayGenres.map((genre, i) => (
              <span 
                key={i} 
                className="text-[6px] font-bold text-neutral-500 uppercase tracking-widest border border-white/5 px-1.5 py-0.5 rounded bg-white/5"
              >
                {genre}
              </span>
            ))}
            {displayGenres.length > 0 && (
              <span className="w-0.5 h-0.5 rounded-full bg-neutral-700" />
            )}
            <span className="text-[7px] font-bold text-neutral-600 uppercase tracking-wider">
              {year}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SearchMangaCardSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="animate-pulse"
    >
      {/* Card Skeleton */}
      <div className="aspect-[2/3] rounded-2xl bg-white/5 border border-white/5 overflow-hidden relative">
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-shimmer" />
      </div>

      {/* Text Skeleton */}
      <div className="mt-3 space-y-2 px-0.5">
        <div className="h-3 w-3/4 bg-white/10 rounded-full" />
        <div className="flex items-center gap-2">
          <div className="h-2 w-12 bg-white/5 rounded-full" />
          <div className="h-2 w-10 bg-white/5 rounded-full" />
        </div>
      </div>
    </motion.div>
  );
}
