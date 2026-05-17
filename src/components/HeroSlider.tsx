'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Manga } from '@/types/manga';
import { getCoverUrl, getMangaTitle } from '@/lib/utils';
import Link from 'next/link';
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import MangaImage from '@/components/MangaImage';
import { cn } from '@/lib/utils';

interface HeroSliderProps {
  trending: Manga[];
}

/**
 * Ultra-minimalist Hero Slider with Enhanced Narrative Banners.
 */
export default function HeroSlider({ trending }: HeroSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    const intervalId = setInterval(() => {
      emblaApi.scrollNext();
    }, 6000);
    return () => clearInterval(intervalId);
  }, [emblaApi]);

  if (!trending || trending.length === 0) return null;

  const slides = trending.slice(0, 5);

  return (
    <div className="relative group animate-in fade-in zoom-in-95 duration-1000">
      <div className="overflow-hidden rounded-[2.5rem] border border-white/5 shadow-2xl bg-[#050508]" ref={emblaRef}>
        <div className="flex">
          {slides.map((manga) => (
            <Link 
              key={manga.id} 
              href={`/manga/${manga.id}`}
              className="flex-[0_0_100%] min-w-0 relative aspect-[16/8] sm:aspect-[21/8] cursor-pointer"
            >
              <MangaImage 
                src={manga.cover || getCoverUrl(manga, 'original')} 
                alt={manga.title || getMangaTitle(manga)} 
                className="w-full h-full object-cover brightness-[0.4] transition-all duration-[3000ms] group-hover:scale-105"
                priority
              />
              
              {/* High-Fidelity Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-transparent to-transparent opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#020205]/60 via-transparent to-transparent" />
              
              {/* Narrative Banner Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-accent/20 border border-accent/30 rounded-full flex items-center gap-2">
                    <Activity className="w-3 h-3 text-accent animate-pulse" />
                    <span className="text-[7px] font-black uppercase tracking-[0.4em] text-accent">Node Active</span>
                  </div>
                  <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest">Global Discovery Matrix</span>
                </div>
                
                <h1 className="text-xl sm:text-4xl font-black uppercase tracking-tighter text-white text-glow leading-tight max-w-[90%] sm:max-w-[70%]">
                  {manga.title || getMangaTitle(manga)}
                </h1>

                <div className="flex items-center gap-4">
                  <div className="h-0.5 w-12 bg-accent rounded-full" />
                  <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.3em]">Access Protocol Ready</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Modern Indicators */}
      <div className="absolute bottom-6 right-12 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn(
              "h-1 transition-all duration-500 rounded-full shadow-lg",
              selectedIndex === index 
                ? "w-8 bg-accent shadow-accent/40" 
                : "w-2 bg-white/10"
            )}
          />
        ))}
      </div>

      {/* Manual Navigation Areas */}
      <button 
        onClick={(e) => { e.preventDefault(); emblaApi?.scrollPrev(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center text-white/20 hover:text-white transition-all hidden sm:flex bg-black/20 backdrop-blur-md rounded-2xl border border-white/5 opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={(e) => { e.preventDefault(); emblaApi?.scrollNext(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center text-white/20 hover:text-white transition-all hidden sm:flex bg-black/20 backdrop-blur-md rounded-2xl border border-white/5 opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
