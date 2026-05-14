
"use client";

import React from 'react';
import { Manga } from '@/types/manga';
import MangaCard from './MangaCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/free-mode';

interface RecommendationCarouselProps {
  mangas: Manga[];
  title?: string;
}

export default function RecommendationCarousel({ mangas, title = "🔥 You Might Also Like" }: RecommendationCarouselProps) {
  if (mangas.length === 0) return null;

  return (
    <section className="space-y-6 pt-10 border-t border-white/5">
      <div className="px-4">
        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white flex items-center gap-3">
          <span className="w-8 h-px bg-accent" /> {title}
        </h2>
      </div>

      <Swiper
        slidesPerView={2.3}
        spaceBetween={16}
        freeMode={true}
        modules={[FreeMode]}
        className="px-4 !overflow-visible"
        breakpoints={{
          640: { slidesPerView: 3.5 },
          1024: { slidesPerView: 5.5 }
        }}
      >
        {mangas.map((m) => (
          <SwiperSlide key={m.id}>
            <div className="w-full">
              <MangaCard manga={m} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
