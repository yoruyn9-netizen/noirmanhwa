"use client";

import React, { useState, useEffect } from 'react';
import { Manga } from '@/lib/types';
import { getCoverUrl, getMangaTitle } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Play, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSliderProps {
  trending: Manga[];
}

export default function HeroSlider({ trending }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (trending.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % Math.min(trending.length, 5));
    }, 6000);
    return () => clearInterval(timer);
  }, [trending]);

  if (!trending.length) return null;
  const items = trending.slice(0, 5);

  const handleImageError = (mangaId: string) => {
    console.warn(`[HeroSlider] Failed to load image for manga: ${mangaId}`);
    setFailedImages(prev => ({ ...prev, [mangaId]: true }));
  };

  return (
    <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-2xl group border border-white/5 bg-neutral-900">
      {items.map((manga, idx) => {
        const title = getMangaTitle(manga);
        const coverUrl = getCoverUrl(manga, 'original');
        const isFailed = failedImages[manga.id];

        return (
          <div
            key={manga.id}
            className={cn(
              "absolute inset-0 transition-all duration-1000 ease-out",
              idx === activeIndex ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-105 translate-x-full pointer-events-none"
            )}
          >
            {!isFailed && coverUrl ? (
              <Image
                src={coverUrl}
                alt={title}
                fill
                className="object-cover object-top brightness-[0.5] saturate-[1.1]"
                priority={idx === 0}
                onError={() => handleImageError(manga.id)}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-red-950 to-neutral-900 flex items-center justify-center opacity-40" />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-accent/80 text-[10px] font-bold rounded-full text-white uppercase tracking-widest flex items-center gap-1 backdrop-blur-md">
                  <TrendingUp className="w-3 h-3" /> Trending Rank #{idx + 1}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-4 leading-none tracking-tighter drop-shadow-2xl">
                {title}
              </h1>
              <p className="text-sm md:text-base text-gray-300 line-clamp-2 md:line-clamp-3 mb-8 max-w-lg leading-relaxed font-medium">
                {manga.attributes.description.en || Object.values(manga.attributes.description)[0] || "No description available."}
              </p>
              <div className="flex gap-4">
                <Link
                  href={`/series/${manga.id}`}
                  className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-black rounded-xl hover:bg-accent transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(153,27,27,0.5)] active:scale-95 z-20"
                >
                  <Play className="w-5 h-5 fill-current" /> BACA SEKARANG
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-6 right-8 flex gap-2 z-20">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={cn(
              "h-1.5 transition-all duration-300 rounded-full",
              idx === activeIndex ? "w-8 bg-accent" : "w-2 bg-white/20 hover:bg-white/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}
