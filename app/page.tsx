"use client";

import React, { useEffect, useState } from 'react';
import { fetchMangaList, Manga } from '@/lib/mangaApi';
import HeroSlider from '@/components/HeroSlider';
import PopularManhwaCarousel from '@/components/manga/PopularManhwaCarousel';
import MangaGrid from '@/components/manga/MangaGrid';
import GlobalChat from '@/components/chat/GlobalChat';
import HeaderProfile from '@/components/HeaderProfile';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [trending, setTrending] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const data = await fetchMangaList();
        setTrending(data || []);
      } catch (err) {
        console.error('❌ [Page]: Signal synchronization failure.', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Syncing Matrix</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-40 max-w-[1600px] mx-auto px-4 relative overflow-x-hidden animate-in fade-in duration-1000">
      {/* Top Header Section */}
      <header className="flex items-center justify-between pt-6 px-1">
        <HeaderProfile />
        <div className="text-right hidden sm:block">
          <p className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.5em]">Noir Manhwa Node: Alpha-42</p>
        </div>
      </header>

      <section className="w-full">
        <HeroSlider trending={trending as any} />
      </section>

      <section className="w-full">
        <PopularManhwaCarousel />
      </section>

      <section className="space-y-10">
        <div className="space-y-2 px-1">
          <h2 className="text-xl font-black uppercase tracking-tighter text-white text-glow">Real-Time Feed</h2>
          <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-[0.4em]">Live Discovery Node: Asura & Flame Scans</p>
        </div>
        <MangaGrid />
      </section>

      <section>
        <GlobalChat previewMode={true} />
      </section>
    </div>
  );
}
