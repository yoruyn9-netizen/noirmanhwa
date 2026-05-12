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
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-[2rem] border border-white/5 bg-[#08080a] shadow-2xl">
      {items.map((manga, idx) => {
        const title = getMangaTitle(manga);
        const coverUrl = getCoverUrl(manga, 'original');

        return (
          <div
            key={manga.id}
            className={cn(
              "absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]",
              idx === activeIndex ? "opacity-100 scale-100" : "opacity-0 scale-110 pointer-events-none"
            )}
          >
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover object-top brightness-[0.4] saturate-[1.2]"
              priority={idx === 0}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 max-w-4xl">
              <div className="flex items-center gap-3 mb-6 animate-in slide-in-from-left duration-700 delay-200">
                <span className="px-4 py-1.5 bg-accent/90 text-[10px] font-black rounded-full text-white uppercase tracking-[0.2em] flex items-center gap-2 backdrop-blur-xl border border-white/10 shadow-[0_0_20px_rgba(153,27,27,0.4)]">
                  <Flame className="w-3 h-3 fill-white" /> WORLD RANK #{idx + 1}
                </span>
                <span className="px-4 py-1.5 bg-white/5 text-[10px] font-black rounded-full text-muted-foreground uppercase tracking-[0.2em] backdrop-blur-xl border border-white/5">
                  {manga.attributes.status}
                </span>
              </div>
              <h1 className="text-4xl md:text-7xl font-black mb-6 leading-[0.9] tracking-tighter drop-shadow-2xl animate-in slide-in-from-left duration-700 delay-300">
                {title}
              </h1>
              <p className="text-sm md:text-lg text-gray-400 line-clamp-2 md:line-clamp-3 mb-10 max-w-2xl leading-relaxed font-medium animate-in slide-in-from-left duration-700 delay-400">
                {manga.attributes.description.en || Object.values(manga.attributes.description)[0] || "No description available."}
              </p>
              <div className="flex flex-wrap gap-4 animate-in slide-in-from-left duration-700 delay-500">
                <Link
                  href={`/series/${manga.id}`}
                  className="flex items-center gap-3 px-10 py-5 bg-accent text-white font-black rounded-2xl hover:bg-red-600 transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(153,27,27,0.6)] active:scale-95 uppercase tracking-widest text-xs"
                >
                  <Play className="w-4 h-4 fill-current" /> START READING
                </Link>
                <Link
                  href={`/series/${manga.id}`}
                  className="flex items-center gap-3 px-8 py-5 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 transition-all border border-white/5 backdrop-blur-xl uppercase tracking-widest text-xs"
                >
                  <Info className="w-4 h-4" /> DETAILS
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-10 right-10 flex gap-3 z-20">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={cn(
              "h-1.5 transition-all duration-500 rounded-full",
              idx === activeIndex ? "w-12 bg-accent shadow-[0_0_15px_rgba(153,27,27,1)]" : "w-3 bg-white/20 hover:bg-white/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}