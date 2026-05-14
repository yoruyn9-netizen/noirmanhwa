
import React from 'react';
import { mangaApi as legacyApi } from '@/lib/api';
import MangaCard from '@/components/MangaCard';
import GenreSlider from '@/components/GenreSlider';
import HeroSlider from '@/components/HeroSlider';
import GlobalChat from '@/components/chat/GlobalChat';
import SourceFilter from '@/components/manga/SourceFilter';
import MangaGrid from '@/components/manga/MangaGrid';
import Link from 'next/link';

export default async function Home() {
  console.log('[Page] Loading Homepage Nodes');
  
  let trending: any[] = [];
  let genres: any[] = [];

  try {
    const results = await Promise.allSettled([
      legacyApi.getTrending(),
      legacyApi.getTags()
    ]);

    if (results[0].status === 'fulfilled') trending = results[0].value.data || [];
    if (results[1].status === 'fulfilled') genres = results[1].value.data || [];
  } catch (err) {
    console.error('[Page Error]:', err);
  }

  return (
    <div className="space-y-16 pb-32 max-w-5xl mx-auto px-4 relative">
      {/* Telemetry */}
      <div className="absolute top-0 right-4 flex items-center gap-4 pointer-events-none z-10 select-none">
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[6px] font-black text-accent uppercase tracking-[0.4em]">Grid: Synchronized</span>
            <div className="w-1 h-1 rounded-full bg-accent shadow-[0_0_8px_rgba(139,92,246,0.8)] animate-pulse" />
          </div>
          <span className="text-[5px] font-bold text-neutral-600 uppercase tracking-[0.5em] opacity-40">Uplink: Active / Multisource</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="w-full pt-4">
        <HeroSlider trending={trending} />
      </section>

      {/* Control Interface */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
        <SourceFilter />
        <div className="flex-1 h-px bg-white/5 hidden sm:block mx-8" />
        <GenreSlider genres={genres} />
      </div>

      {/* Main Signal Grid (Multi-Source + Infinite Scroll) */}
      <section className="space-y-10">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h2 className="text-[14px] font-black uppercase tracking-tighter text-white">Live Data Matrix</h2>
            <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Scanning remote repositories</p>
          </div>
        </div>

        <MangaGrid />
      </section>

      {/* Global Transmission Preview */}
      <GlobalChat previewMode={true} />
    </div>
  );
}
