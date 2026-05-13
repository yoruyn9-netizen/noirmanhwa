
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Manga } from '@/lib/types';
import { getCoverUrl, getMangaTitle, getMangaDescription } from '@/lib/utils';
import Link from 'next/link';
import { Play, Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import MangaImage from '@/components/MangaImage';
import { cn } from '@/lib/utils';

interface HeroSliderProps {
  trending: Manga[];
}

/**
 * Modern Hero Slider using Embla Carousel.
 * Supports manual swipe and automatic scanning logic.
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

  // Automatic "Scanning" logic
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
      <div className="overflow-hidden rounded-[3rem] border border-white/5 shadow-2xl bg-[#050508]" ref={emblaRef}>
        <div className="flex">
          {slides.map((manga) => (
            <div key={manga.id} className="flex-[0_0_100%] min-w-0 relative aspect-[4/5] sm:aspect-[16/8]">
              <MangaImage 
                src={getCoverUrl(manga, 'original')} 
                alt={getMangaTitle(manga)} 
                className="w-full h-full object-cover brightness-[0.35] transition-transform duration-[3000ms] group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-[#020205]/20 to-transparent" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-14 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent/20 rounded-full w-fit backdrop-blur-md">
                  <Activity className="w-3 h-3 text-accent animate-pulse" />
                  <span className="text-[7px] font-black uppercase tracking-widest text-accent">Recommended Scan</span>
                </div>
                
                <div className="space-y-2 max-w-xl">
                  <h1 className="text-2xl sm:text-5xl font-black uppercase tracking-tighter leading-tight text-white drop-shadow-2xl">
                    {getMangaTitle(manga)}
                  </h1>
                  <p className="text-[10px] sm:text-[13px] text-neutral-400 font-medium line-clamp-2 sm:line-clamp-3 leading-relaxed opacity-80">
                    {getMangaDescription(manga)}
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <Link 
                    href={`/series/${manga.id}`}
                    className="inline-flex items-center gap-2 px-10 py-4 bg-white text-black font-black rounded-2xl text-[9px] uppercase tracking-widest hover:bg-accent hover:text-white transition-all duration-500 shadow-xl active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Read Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn(
              "h-1.5 transition-all duration-500 rounded-full",
              selectedIndex === index 
                ? "w-10 bg-accent shadow-[0_0_15px_rgba(139,92,246,1)]" 
                : "w-2.5 bg-white/20 hover:bg-white/40"
            )}
          />
        ))}
      </div>

      {/* Manual Directional Controls */}
      <button 
        onClick={(e) => { e.preventDefault(); emblaApi?.scrollPrev(); }}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/5 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 hidden sm:flex hover:bg-accent/20 hover:border-accent/40 hover:scale-110 active:scale-95"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={(e) => { e.preventDefault(); emblaApi?.scrollNext(); }}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/5 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 hidden sm:flex hover:bg-accent/20 hover:border-accent/40 hover:scale-110 active:scale-95"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
