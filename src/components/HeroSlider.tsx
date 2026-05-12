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
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-2xl border border-white/5 bg-[#08080a] shadow-2xl">
      {items.map((manga, idx) => {
        const title = getMangaTitle(manga);
        const coverUrl = getCoverUrl(manga, 'original');

        return (
          <div
            key={manga.id}
            className={cn(
              "absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]",
              idx === activeIndex ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"
            )}
          >
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover object-top brightness-[0.35] saturate-[1.1]"
              priority={idx === 0}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-4xl">
              <div className="flex items-center gap-2 mb-4 animate-in slide-in-from-left duration-700 delay-200">
                <span className="px-3 py-1 bg-accent/90 text-[9px] font-black rounded-lg text-white uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-xl border border-white/10">
                  <Flame className="w-2.5 h-2.5 fill-white" /> RANK #{idx + 1}
                </span>
                <span className="px-3 py-1 bg-white/5 text-[9px] font-black rounded-lg text-muted-foreground uppercase tracking-widest backdrop-blur-xl border border-white/5">
                  {manga.attributes.status}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-4 leading-none tracking-tighter drop-shadow-2xl animate-in slide-in-from-left duration-700 delay-300">
                {title}
              </h1>
              <p className="text-xs md:text-base text-gray-400 line-clamp-2 mb-8 max-w-xl leading-relaxed font-medium animate-in slide-in-from-left duration-700 delay-400">
                {manga.attributes.description.en || Object.values(manga.attributes.description)[0] || "No description available."}
              </p>
              <div className="flex flex-wrap gap-3 animate-in slide-in-from-left duration-700 delay-500">
                <Link
                  href={`/series/${manga.id}`}
                  className="flex items-center gap-2 px-6 py-3.5 bg-accent text-white font-black rounded-xl hover:bg-red-600 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest text-[10px]"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> READ NOW
                </Link>
                <Link
                  href={`/series/${manga.id}`}
                  className="flex items-center gap-2 px-5 py-3.5 bg-white/5 text-white font-black rounded-xl hover:bg-white/10 transition-all border border-white/5 backdrop-blur-xl uppercase tracking-widest text-[10px]"
                >
                  <Info className="w-3.5 h-3.5" /> DETAILS
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-6 right-6 flex gap-2 z-20">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={cn(
              "h-1 transition-all duration-500 rounded-full",
              idx === activeIndex ? "w-8 bg-accent shadow-[0_0_10px_rgba(153,27,27,1)]" : "w-2 bg-white/20 hover:bg-white/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}
