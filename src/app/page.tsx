
"use client";

import React, { useEffect } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import GenreSlider from '@/components/GenreSlider';
import HeroSlider from '@/components/HeroSlider';
import GlobalChat from '@/components/chat/GlobalChat';
import PopularManhwaCarousel from '@/components/manga/PopularManhwaCarousel';
import MangaGrid from '@/components/manga/MangaGrid';

export default function Home() {
  const [trending, setTrending] = React.useState<any[]>([]);

  useEffect(() => {
    async function init() {
      console.log('📡 [System]: Initializing Neural Link Discovery...');
      try {
        const tRes = await mangaApi.fetchMangaList({ page: 1 });
        setTrending(tRes || []);
      } catch (err) {
        console.error('[Page Sync Error]:', err);
      }
    }
    init();
  }, []);

  return (
    <div className="space-y-16 pb-40 max-w-[1600px] mx-auto px-4 relative overflow-x-hidden">
      <section className="w-full pt-4">
        <HeroSlider trending={trending} />
      </section>

      <section className="w-full">
        <PopularManhwaCarousel />
      </section>

      <section className="space-y-10">
        <div className="space-y-2 px-1">
          <h2 className="text-xl font-black uppercase tracking-tighter text-white text-glow">Database Grid</h2>
          <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-[0.4em]">Multi-Source Signal discovery</p>
        </div>
        <MangaGrid />
      </section>

      <GlobalChat previewMode={true} />
    </div>
  );
}
