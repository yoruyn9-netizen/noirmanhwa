"use client";

import React, { useEffect, useState } from 'react';
import HeroSlider from '@/components/HeroSlider';
import MangaCard from '@/components/MangaCard';
import { Flame, Sparkles, TrendingUp, ArrowDown } from 'lucide-react';
import Link from 'next/link';
import { Manga } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [trending, setTrending] = useState<Manga[]>([]);
  const [latest, setLatest] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    console.log('Fetching Home Data...');
    
    try {
      const [trendingRes, latestRes] = await Promise.all([
        fetch('https://api.mangadex.org/manga?limit=10&includes[]=cover_art&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive'),
        fetch('https://api.mangadex.org/manga?limit=24&includes[]=cover_art&order[latestUploadedChapter]=desc&contentRating[]=safe')
      ]);

      if (!trendingRes.ok || !latestRes.ok) {
        throw new Error('API request failed');
      }

      const trendingData = await trendingRes.json();
      const latestData = await latestRes.json();

      setTrending(trendingData.data);
      setLatest(latestData.data);
      console.log('Data Loaded Successfully:', { trending: trendingData.data.length, latest: latestData.data.length });
    } catch (err: any) {
      console.error('Fetch Error:', err);
      setError("Failed to connect to MangaDex. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !latest.length) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto py-10">
        <Skeleton className="w-full aspect-[21/10] rounded-[2.5rem]" />
        <div className="manga-grid">
          {[...Array(12)].map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto animate-in fade-in duration-1000">
      <HeroSlider trending={trending} />

      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black tracking-tighter flex items-center gap-2 uppercase text-glow">
              <Flame className="w-4.5 h-4.5 text-accent" /> Latest Uploads
            </h2>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Direct MangaDex Stream</p>
          </div>
        </div>
        
        {error ? (
          <div className="py-24 text-center glass rounded-[2.5rem] space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{error}</p>
              <button 
                onClick={() => fetchData()}
                className="px-8 py-3 bg-accent text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-accent/20"
              >
                Retry Connection
              </button>
            </div>
          </div>
        ) : (
          <div className="manga-grid">
            {latest.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        )}
      </section>

      <section className="relative rounded-[2.5rem] p-10 overflow-hidden group border border-white/5 bg-[#0a0a0f]">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent z-0" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/20 text-accent rounded-full text-[8px] font-black uppercase tracking-widest border border-accent/20">
              <Sparkles className="w-3 h-3" /> Recommendation Engine
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase leading-none text-glow">Expand your library</h2>
            <p className="text-[11px] text-muted-foreground font-medium max-w-sm leading-relaxed opacity-70">
              Discover the most followed and trending series across the global network.
            </p>
            <Link href="/search" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-accent hover:text-white transition-all duration-500 text-[10px] uppercase tracking-widest mx-auto md:mx-0">
              Go to Search <ArrowDown className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
