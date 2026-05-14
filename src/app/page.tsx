
import React from 'react';
import { mangaApi } from '@/lib/api';
import MangaCard from '@/components/MangaCard';
import GenreSlider from '@/components/GenreSlider';
import HeroSlider from '@/components/HeroSlider';
import GlobalChat from '@/components/chat/GlobalChat';

export default async function Home() {
  let trending: any[] = [];
  let latest: any[] = [];
  let genres: any[] = [];

  try {
    const [trendingRes, latestRes, genresRes] = await Promise.all([
      mangaApi.getTrending(),
      mangaApi.getLatest(),
      mangaApi.getTags()
    ]);

    trending = trendingRes.data || [];
    latest = latestRes.data || [];
    genres = genresRes.data || [];
  } catch (err) {
    console.error('[Page Error]:', err);
  }

  return (
    <div className="space-y-16 pb-32 max-w-5xl mx-auto px-4 relative">
      {/* Telemetry Status */}
      <div className="absolute top-0 right-4 flex items-center gap-4 pointer-events-none z-10 select-none">
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[6px] font-black text-accent uppercase tracking-[0.4em]">Grid: Synchronized</span>
            <div className="w-1 h-1 rounded-full bg-accent shadow-[0_0_8px_rgba(139,92,246,0.8)] animate-pulse" />
          </div>
          <span className="text-[5px] font-bold text-neutral-600 uppercase tracking-[0.5em] opacity-40">Uplink: Active</span>
        </div>
      </div>

      <section className="w-full pt-4">
        <HeroSlider trending={trending} />
      </section>

      <section className="space-y-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
          <div className="space-y-1">
            <h2 className="text-[14px] font-black uppercase tracking-tighter text-white">Neural Stream</h2>
            <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Latest signal captures</p>
          </div>
          <GenreSlider genres={genres} />
        </div>

        <div className="manga-grid">
          {latest.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      </section>

      {/* Global Transmission Preview */}
      <GlobalChat previewMode={true} />
    </div>
  );
}
