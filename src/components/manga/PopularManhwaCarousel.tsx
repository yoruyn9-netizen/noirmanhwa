
"use client";

import React, { useEffect, useState } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import { Manga } from '@/types/manga';
import MangaCard from './MangaCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Autoplay } from 'swiper/modules';
import { Flame, Sparkles } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/free-mode';

export default function PopularManhwaCarousel() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurated = async () => {
      const data = await mangaApi.fetchCuratedManhwa();
      setMangas(data);
      setLoading(false);
    };
    loadCurated();
  }, []);

  if (loading || mangas.length === 0) return null;

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
            <Flame className="w-6 h-6 text-red-500 fill-red-500 animate-pulse" /> Trending Manhwa
          </h2>
          <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-[0.4em] ml-1">Legendary Korean series</p>
        </div>
        <div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-lg">
           <span className="text-[7px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
             <Sparkles className="w-2 h-2" /> Curated List
           </span>
        </div>
      </div>

      <Swiper
        slidesPerView={2.3}
        spaceBetween={20}
        freeMode={true}
        autoplay={{ delay: 5000 }}
        modules={[FreeMode, Autoplay]}
        className="!overflow-visible"
        breakpoints={{
          640: { slidesPerView: 3.5 },
          1024: { slidesPerView: 5.5 },
          1440: { slidesPerView: 6.5 }
        }}
      >
        {mangas.map((m) => (
          <SwiperSlide key={m.id}>
             <MangaCard manga={m} isRecommended={true} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
