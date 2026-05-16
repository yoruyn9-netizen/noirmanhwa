
"use client";

import React, { useEffect, useState } from 'react';
import { fetchMangaList, Manga } from '@/lib/mangaApi';
import HeroSlider from '@/components/HeroSlider';
import PopularManhwaCarousel from '@/components/manga/PopularManhwaCarousel';
import MangaGrid from '@/components/manga/MangaGrid';
import GlobalChat from '@/components/chat/GlobalChat';
import HeaderProfile from '@/components/HeaderProfile';
import ThreeBodyLoader from '@/components/ui/ThreeBodyLoader';
import { WifiOff } from 'lucide-react';

export default function Home() {
  const [trending, setTrending] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const data = await fetchMangaList();
        setTrending(data || []);
        setError(data.length === 0);
      } catch (err) {
        console.error('❌ [Page]: Signal synchronization failure.', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6">
        <ThreeBodyLoader />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Syncing Library</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-40 max-w-[1600px] mx-auto px-4 relative overflow-x-hidden animate-in fade-in duration-1000">
      {/* Top Header Section */}
      <header className="flex items-center justify-between pt-6 px-1">
        <HeaderProfile />
        <div className="text-right hidden sm:block">
          <p className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.5em]">Noir Terminal Alpha-42</p>
        </div>
      </header>

      {error && trending.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
          <WifiOff className="w-12 h-12 text-neutral-800" />
          <div className="space-y-2">
            <h2 className="text-xl font-black uppercase text-white">Total Signal Loss</h2>
            <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Unable to establish link with discovery nodes.</p>
          </div>
          <button onClick={() => window.location.reload()} className="px-10 py-4 bg-accent text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl">Retry Uplink</button>
        </div>
      ) : (
        <>
          <section className="w-full">
            <HeroSlider trending={trending} />
          </section>

          <section className="w-full">
            <PopularManhwaCarousel />
          </section>

          <section className="space-y-10">
            <div className="space-y-2 px-1">
              <h2 className="text-xl font-black uppercase tracking-tighter text-white text-glow">Real-Time Feed</h2>
              <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-[0.4em]">Live Discovery</p>
            </div>
            <MangaGrid />
          </section>

          <section>
            <GlobalChat previewMode={true} />
          </section>
        </>
      )}
    </div>
  );
}
