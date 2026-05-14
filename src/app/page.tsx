
"use client";

import React, { useEffect } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import { verifyApiConnections } from '@/lib/verifyApis';
import GenreSlider from '@/components/GenreSlider';
import HeroSlider from '@/components/HeroSlider';
import GlobalChat from '@/components/chat/GlobalChat';
import ContentTypeFilter from '@/components/manga/ContentTypeFilter';
import SortingOptions from '@/components/manga/SortingOptions';
import AdvancedFilters from '@/components/manga/AdvancedFilters';
import PopularManhwaCarousel from '@/components/manga/PopularManhwaCarousel';
import MangaGrid from '@/components/manga/MangaGrid';

export default function Home() {
  const [trending, setTrending] = React.useState<any[]>([]);
  const [genres, setGenres] = React.useState<any[]>([]);
  const [health, setHealth] = React.useState<any>(null);

  useEffect(() => {
    async function init() {
      const h = await verifyApiConnections();
      setHealth(h);

      try {
        const [tRes, gRes] = await Promise.all([
          mangaApi.fetchMangaList({ page: 1, type: 'all' }),
          mangaApi.getTags()
        ]);
        setTrending(tRes || []);
        setGenres(gRes.data || []);
      } catch (err) {
        console.error('[Page Sync Error]:', err);
      }
    }
    init();
  }, []);

  return (
    <div className="space-y-16 pb-40 max-w-[1600px] mx-auto px-4 relative overflow-x-hidden">
      {/* API Health Monitor - Dev Only Overlay */}
      {health && Object.values(health).some(v => !v) && (
        <div className="fixed top-4 right-4 z-[200] bg-red-600 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase animate-pulse border border-white/20 shadow-2xl">
          ⚠️ Critical: Some Data Nodes Offline
        </div>
      )}

      <section className="w-full pt-4">
        <HeroSlider trending={trending} />
      </section>

      <section className="w-full">
        <PopularManhwaCarousel />
      </section>

      <section className="space-y-10">
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 px-1">
            <div className="space-y-1">
              <h2 className="text-xl font-black uppercase tracking-tighter text-white text-glow">Database Grid</h2>
              <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-[0.4em] ml-1">Universal Discovery</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <ContentTypeFilter />
              <SortingOptions />
            </div>
          </div>

          <div className="px-1">
             <AdvancedFilters />
          </div>
        </div>

        <MangaGrid />
      </section>

      <section className="space-y-10 border-t border-white/5 pt-16">
         <div className="space-y-1 px-1">
            <h2 className="text-lg font-black uppercase tracking-tighter text-white">Categories</h2>
            <p className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.4em] ml-1">Genre Protocols</p>
          </div>
          <GenreSlider genres={genres} />
      </section>

      <GlobalChat previewMode={true} />
    </div>
  );
}
