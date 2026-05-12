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
    }, 8000);
    return () => clearInterval(timer);
  }, [trending]);

  if (!trending.length) return null;
  const items = trending.slice(0, 5);

  return (
    <div className="relative w-full aspect-[21/10] overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#050508] shadow-2xl">
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
              className="object-cover object-top brightness-[0.35]"
              priority={idx === 0}
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-accent text-[9px] font-black rounded-xl text-white uppercase tracking-widest flex items-center gap-1.5 border border-white/10 shadow-xl shadow-accent/20">
                  <Flame className="w-3 h-3 fill-white" /> Elite Node #{idx + 1}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black mb-3 leading-tight tracking-tighter uppercase text-glow">
                {title}
              </h1>
              <p className="text-[10px] md:text-xs text-gray-400 line-clamp-2 mb-8 leading-relaxed font-medium opacity-60 max-w-lg">
                {manga.attributes.description.en || Object.values(manga.attributes.description)[0] || "No terminal summary available for this node."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/series/${manga.id}`}
                  className="flex items-center gap-2 px-8 py-3.5 bg-white text-black font-black rounded-2xl hover:bg-accent hover:text-white transition-all duration-500 uppercase tracking-widest text-[10px] shadow-2xl"
                >
                  <Play className="w-4 h-4 fill-current" /> Begin Sync
                </Link>
                <Link
                  href={`/series/${manga.id}`}
                  className="flex items-center gap-2 px-6 py-3.5 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 transition-all border border-white/10 backdrop-blur-3xl uppercase tracking-widest text-[10px]"
                >
                  <Info className="w-4 h-4" /> Node Data
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-8 right-10 flex gap-2 z-20">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={cn(
              "h-1.5 transition-all duration-700 rounded-full",
              idx === activeIndex ? "w-10 bg-accent shadow-[0_0_15px_rgba(139,92,246,1)]" : "w-3 bg-white/10"
            )}
          />
        ))}
      </div>
    </div>
  );
}
