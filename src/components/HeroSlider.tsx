
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Manga } from '@/lib/types';
import { getCoverUrl, getMangaTitle } from '@/lib/utils';
import Link from 'next/link';
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react';
import MangaImage from '@/components/MangaImage';
import { cn } from '@/lib/utils';

interface HeroSliderProps {
  trending: Manga[];
}

/**
 * Ultra-minimalist Hero Slider.
 * Panoramic aspect ratio with focus on title and essential system data.
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
              href={`/series/${manga.id}`}
              className="flex-[0_0_100%] min-w-0 relative aspect-[16/7] sm:aspect-[21/7] cursor-pointer"
            >
              <MangaImage 
                src={getCoverUrl(manga, 'original')} 
                alt={getMangaTitle(manga)} 
                className="w-full h-full object-cover brightness-[0.4] transition-all duration-[3000ms] group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-transparent to-transparent opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#020205]/40 via-transparent to-transparent" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-2.5 h-2.5 text-accent animate-pulse" />
                  <span className="text-[6px] font-black uppercase tracking-[0.4em] text-accent opacity-80">Recommended Node</span>
                </div>
                
                <h1 className="text-sm sm:text-2xl font-black uppercase tracking-tighter text-white text-glow truncate max-w-[80%]">
                  {getMangaTitle(manga)}
                </h1>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Subtle Indicators */}
      <div className="absolute bottom-4 right-8 flex gap-1.5 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn(
              "h-1 transition-all duration-500 rounded-full",
              selectedIndex === index 
                ? "w-6 bg-accent" 
                : "w-1 bg-white/10"
            )}
          />
        ))}
      </div>

      {/* Invisible navigation hit areas for manual control */}
      <button 
        onClick={(e) => { e.preventDefault(); emblaApi?.scrollPrev(); }}
        className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center text-white/0 hover:text-white/20 transition-all sm:flex hidden"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={(e) => { e.preventDefault(); emblaApi?.scrollNext(); }}
        className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-white/0 hover:text-white/20 transition-all sm:flex hidden"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}
