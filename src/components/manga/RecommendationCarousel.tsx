
"use client";

import React from 'react';
import { Manga } from '@/types/manga';
import MangaCard from './MangaCard';
import { cn } from '@/lib/utils';

interface RecommendationCarouselProps {
  mangas: Manga[];
  title?: string;
}

/**
 * Recommendation Carousel
 * Provides a genre-matched horizontal discovery stream.
 * Uses native CSS scroll-snapping for performance and simplicity.
 */
export default function RecommendationCarousel({ mangas, title = "🔥 You Might Also Like" }: RecommendationCarouselProps) {
  if (!mangas || mangas.length === 0) return null;

  return (
    <section className="space-y-6 pt-12 border-t border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="px-2">
        <h2 className="text-[12px] font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
          <span className="w-8 h-px bg-accent/40" /> {title}
        </h2>
      </div>

      <div className="relative group">
        {/* Horizontal Scroll Container */}
        <div className="flex gap-4 overflow-x-auto pb-8 pt-2 px-2 hide-scrollbar snap-x snap-mandatory">
          {mangas.map((manga) => (
            <div 
              key={manga.id} 
              className="min-w-[140px] sm:min-w-[160px] flex-shrink-0 snap-start"
            >
              <MangaCard manga={manga} compact />
            </div>
          ))}
        </div>

        {/* Visual Edge Fades */}
        <div className="absolute top-0 left-0 bottom-8 w-12 bg-gradient-to-r from-[#020205] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-0 right-0 bottom-8 w-12 bg-gradient-to-l from-[#020205] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
