
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Manga } from '@/types/manga';
import SafeImage from '@/components/SafeImage';
import { motion } from 'framer-motion';
import { Star, ExternalLink } from 'lucide-react';
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
      <Link href={`/manga/${manga.id}`} className="block select-none">
        {/* Poster Matrix */}
        <div className={cn(
          "shinigami-card aspect-[2/3] relative rounded-3xl overflow-hidden bg-[#0a0a0f] border transition-all duration-700 shadow-2xl",
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
          <div className="absolute top-3 right-3 z-20">
             <FlagBadge source={manga.source} size="sm" className="shadow-2xl scale-90" />
          </div>

          {/* New Signal Indicator */}
          {isNew && !compact && (
            <div className="absolute top-4 left-4 px-3 py-1 bg-green-500 text-black text-[7px] font-black uppercase tracking-widest rounded-lg shadow-xl shadow-green-500/20">
              NEW SIGNAL
            </div>
          )}

          {/* Data Meta Footer */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[6px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border backdrop-blur-md",
                manga.status.toLowerCase() === 'ongoing' ? 'text-accent border-accent/20 bg-accent/5' : 'text-green-400 border-green-500/20 bg-green-500/5'
              )}>
                {manga.status}
              </span>
            </div>

            {/* Performance Metric (Rating) */}
            {manga.rating && (
              <div className="flex items-center gap-1 text-yellow-400 bg-black/80 px-1.5 py-0.5 rounded-md backdrop-blur-md border border-white/10 shadow-2xl">
                <Star className="w-2 h-2 fill-current" />
                <span className="text-[7px] font-black">{manga.rating}</span>
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
        <div className="mt-3 space-y-1.5 px-0.5">
          <h3 className={cn(
            "font-black uppercase tracking-tight text-white leading-tight group-hover:text-accent transition-colors duration-500 line-clamp-1",
            compact ? "text-[9px]" : "text-[11px]"
          )}>
            {truncateTitle(manga.title, compact ? 30 : 40)}
          </h3>
          
          <div className="flex items-center gap-2">
             <div className="flex flex-wrap gap-1">
               {displayGenres.map((g, i) => (
                 <span key={i} className="text-[6px] font-bold text-neutral-500 uppercase tracking-widest border border-white/5 px-1.5 py-0.5 rounded bg-white/5 whitespace-nowrap">
                   {g}
                 </span>
               ))}
             </div>
             <span className="w-0.5 h-0.5 rounded-full bg-neutral-800 shrink-0" />
             <span className="text-[7px] font-bold text-neutral-700 uppercase tracking-[0.1em]">
               {manga.year || '2024'}
             </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * High-fidelity loading skeleton for the MangaCard component.
 */
export function MangaCardSkeleton() {
  return (
    <div className="w-full h-full animate-pulse">
      <div className="aspect-[2/3] w-full bg-white/5 rounded-3xl border border-white/5 mb-4" />
      <div className="space-y-2 px-1">
        <div className="h-3 w-3/4 bg-white/10 rounded-full" />
        <div className="flex items-center gap-2">
          <div className="h-2 w-1/3 bg-white/5 rounded-full" />
          <div className="h-2 w-1/4 bg-white/5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * EXAMPLE: API Consumer Component
 * This component demonstrates fetching data from the `/api/manga` endpoint
 * and rendering the presentational `MangaCard` component with the result.
 * It is self-contained and does not alter the behavior of the main MangaCard.
 */
export function MangaCardApiExample({ mangaId }: { mangaId: string }) {
  const [manga, setManga] = useState<Manga | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchManga = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/manga?id=${mangaId}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch manga');
        }
        const data: Manga = await res.json();
        setManga(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (mangaId) {
      fetchManga();
    }
  }, [mangaId]);

  if (isLoading) {
    return <MangaCardSkeleton />;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!manga) {
    return null;
  }

  return <MangaCard manga={manga} />;
}
