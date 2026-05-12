"use client";

import React, { useState, useEffect } from 'react';
import { Manga } from '@/lib/types';
import { getCoverUrl, getMangaTitle } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Flame, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSliderProps {
  trending: Manga[];
}

export default function HeroSlider({ trending }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (trending.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % Math.min(trending.length, 5));
    }, 6000);
    return () => clearInterval(timer);
  }, [trending]);

  if (!trending.length) return null;
  const items = trending.slice(0, 5);

  return (
    <div className="relative w-full aspect-[21/10] overflow-hidden rounded-2xl border border-white/5 bg-[#08080a] shadow-2xl">
      {items.map((manga, idx) => {
        const title = getMangaTitle(manga);
        const coverUrl = getCoverUrl(manga, 'original');

        return (
          <div
            key={manga.id}
            className={cn(
              "absolute inset-0 transition-all duration-1000",
              idx === activeIndex ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
            )}
          >
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover object-top brightness-[0.4]"
              priority={idx === 0}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-accent/90 text-[8px] font-black rounded text-white uppercase tracking-widest flex items-center gap-1 border border-white/10">
                  <Flame className="w-2.5 h-2.5 fill-white" /> Rank #{idx + 1}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black mb-2 leading-tight tracking-tighter uppercase text-glow">
                {title}
              </h1>
              <p className="text-[10px] md:text-xs text-gray-400 line-clamp-2 mb-6 leading-relaxed font-medium opacity-80">
                {manga.attributes.description.en || Object.values(manga.attributes.description)[0] || "No synapsis available."}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/series/${manga.id}`}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-accent text-white font-black rounded-lg hover:bg-red-600 transition-all uppercase tracking-widest text-[9px]"
                >
                  <Play className="w-3 h-3 fill-current" /> Read Now
                </Link>
                <Link
                  href={`/series/${manga.id}`}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white/5 text-white font-black rounded-lg hover:bg-white/10 transition-all border border-white/5 backdrop-blur-xl uppercase tracking-widest text-[9px]"
                >
                  <Info className="w-3 h-3" /> Details
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-4 right-6 flex gap-1.5 z-20">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={cn(
              "h-1 transition-all duration-500 rounded-full",
              idx === activeIndex ? "w-6 bg-accent shadow-[0_0_5px_rgba(153,27,27,1)]" : "w-1.5 bg-white/20"
            )}
          />
        ))}
      </div>
    </div>
  );
}