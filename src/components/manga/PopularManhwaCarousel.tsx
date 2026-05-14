"use client";

import React, { useEffect, useState } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import { Manga } from '@/types/manga';
import MangaCard from './MangaCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Flame, Sparkles } from 'lucide-react';
import { chunkArray } from '@/lib/utils';

import 'swiper/css';
import 'swiper/css/pagination';

export default function PopularManhwaCarousel() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurated = async () => {
      try {
        const data = await mangaApi.fetchCuratedManhwa();
        setMangas(data);
      } catch (err) {
        console.error('[Carousel Load Error]:', err);
      } finally {
        setLoading(false);
      }
    };
    loadCurated();
  }, []);

  if (loading || mangas.length === 0) return null;

  // Split into slides of 10 for paginated layout
  const itemsPerSlide = 10;
  const chunkedMangas = chunkArray(mangas, itemsPerSlide);

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-full overflow-hidden">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-lg font-black uppercase tracking-tighter text-white flex items-center gap-3">
            <Flame className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" /> Trending Manhwa
          </h2>
          <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.4em] ml-1">Ranked Legends</p>
        </div>
        <div className="px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-xl">
           <span className="text-[7px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
             <Sparkles className="w-2.5 h-2.5" /> Featured Data
           </span>
        </div>
      </div>

      <Swiper
        modules={[Pagination, Autoplay]}
        slidesPerView={1}
        spaceBetween={20}
        pagination={{ clickable: true, dynamicBullets: true }}
        autoplay={{ delay: 8000, disableOnInteraction: true }}
        className="!pb-12"
      >
        {chunkedMangas.map((slide, slideIdx) => (
          <SwiperSlide key={`slide-${slideIdx}`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 px-2">
              {slide.map((m, idx) => (
                <MangaCard 
                  key={`${m.id || 'curated'}-${slideIdx}-${idx}`} 
                  manga={m} 
                  isRecommended={true} 
                  compact 
                />
              ))}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
