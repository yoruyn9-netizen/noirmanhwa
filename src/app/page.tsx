
import React from 'react';
import { mangaApi } from '@/lib/api';
import MangaCard from '@/components/MangaCard';
import GenreSlider from '@/components/GenreSlider';
import HeroSlider from '@/components/HeroSlider';
import GlobalChat from '@/components/chat/GlobalChat';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { getMangaTitle } from '@/lib/utils';

export default async function Home() {
  console.log('[Page] Loading Homepage');
  
  let trending: any[] = [];
  let latest: any[] = [];
  let genres: any[] = [];
  let error: string | null = null;

  try {
    const results = await Promise.allSettled([
      mangaApi.getTrending(),
      mangaApi.getLatest(),
      mangaApi.getTags()
    ]);

    if (results[0].status === 'fulfilled') trending = results[0].value.data || [];
    if (results[1].status === 'fulfilled') latest = results[1].value.data || [];
    if (results[2].status === 'fulfilled') genres = results[2].value.data || [];

    if (trending.length === 0 && latest.length === 0) {
      error = "Connection lost. Tap to retry.";
    }
  } catch (err) {
    console.error('[Page Error] Home Fetch Failure:', err);
    error = "Connection lost. Tap to retry.";
  }

  return (
    <div className="space-y-12 pb-32 max-w-4xl mx-auto px-4 relative">
      {/* Top Right Live Telemetry */}
      <div className="absolute top-0 right-4 flex items-center gap-4 pointer-events-none z-10 select-none">
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[6px] font-black text-accent uppercase tracking-[0.4em]">Signal: Stable</span>
            <div className="w-1 h-1 rounded-full bg-accent shadow-[0_0_8px_rgba(139,92,246,0.8)] animate-pulse" />
          </div>
          <span className="text-[5px] font-bold text-neutral-600 uppercase tracking-[0.5em] opacity-40">Uplink: Active / ID-Node</span>
        </div>
      </div>

      {/* Recommended Hero Slider */}
      <section className="w-full pt-4">
        <HeroSlider trending={trending} />
      </section>

      {/* Genre Slider */}
      <section className="animate-in fade-in slide-in-from-left duration-700 delay-300">
        <GenreSlider genres={genres} />
      </section>

      {/* Latest Updates Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
          <div className="space-y-1">
            <h2 className="text-[11px] font-black uppercase tracking-tighter text-white">Latest Uploads</h2>
            <p className="text-[7px] font-black text-neutral-600 uppercase tracking-widest">Real-time Stream Index</p>
          </div>
          <div className="w-12 h-px bg-white/5" />
        </div>

        {error ? (
          <div className="py-20 text-center space-y-4 bg-neutral-900/50 rounded-[2rem] border border-dashed border-white/5 animate-in fade-in">
            <p className="text-[8px] font-black uppercase tracking-widest text-neutral-500">{error}</p>
            <Link href="/" className="inline-block px-8 py-3 bg-accent text-white rounded-xl text-[7px] font-black uppercase tracking-widest shadow-lg shadow-accent/20">Resync Node</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-5 gap-y-10">
            {latest.map((manga, idx) => (
              <div 
                key={manga.id} 
                className="animate-in fade-in slide-in-from-bottom-8 duration-1000"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <MangaCard manga={manga} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Global Real-time Chat Node */}
      <GlobalChat />
    </div>
  );
}
