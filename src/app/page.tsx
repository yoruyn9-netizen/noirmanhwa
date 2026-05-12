"use client";

import React, { useEffect, useState } from 'react';
import { mangaApi } from '@/lib/api';
import HeroSlider from '@/components/HeroSlider';
import MangaCard from '@/components/MangaCard';
import { ChevronRight, Sparkles, Flame, AlertCircle, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Manga } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [trending, setTrending] = useState<Manga[]>([]);
  const [latest, setLatest] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [genres, setGenres] = useState<any[]>([]);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);

  const GENRES_TO_SHOW = [
    'Action', 'Comedy', 'Drama', 'Fantasy', 'Romance', 
    'Isekai', 'Horror', 'Adventure', 'Martial Arts'
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const tagsRes = await mangaApi.getTags().catch(() => ({ data: [] }));
      const filteredTags = tagsRes.data.filter((t: any) => 
        GENRES_TO_SHOW.includes(t.attributes.name.en)
      ).sort((a: any, b: any) => GENRES_TO_SHOW.indexOf(a.attributes.name.en) - GENRES_TO_SHOW.indexOf(b.attributes.name.en));
      setGenres(filteredTags);

      const [trendingRes, latestRes] = await Promise.all([
        mangaApi.getTrending().catch(() => ({ data: [] })),
        mangaApi.getLatest(0, activeGenre ? [activeGenre] : []).catch(() => ({ data: [] }))
      ]);
      
      setTrending(trendingRes.data as Manga[]);
      setLatest(latestRes.data as Manga[]);
      
      if (!trendingRes.data?.length && !latestRes.data?.length) {
        setError("MangaDex API is currently under heavy load.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeGenre]);

  if (loading && !latest.length) {
    return (
      <div className="space-y-8">
        <Skeleton className="w-full aspect-[21/10] rounded-2xl" />
        <div className="flex gap-2 overflow-hidden">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-20 rounded-full flex-shrink-0" />)}
        </div>
        <div className="manga-grid">
          {[...Array(12)].map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <HeroSlider trending={trending} />

      <section className="space-y-4">
        <h2 className="text-sm font-black tracking-widest flex items-center gap-2 uppercase opacity-80">
          <TrendingUp className="w-4 h-4 text-accent" /> Categories
        </h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar -mx-4 px-4">
          <button 
            onClick={() => setActiveGenre(null)}
            className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border border-white/5",
              activeGenre === null ? "bg-accent text-white border-accent shadow-[0_0_10px_rgba(153,27,27,0.3)]" : "bg-white/5 text-muted-foreground hover:bg-white/10"
            )}
          >
            All
          </button>
          {genres.map((tag) => (
            <button 
              key={tag.id}
              onClick={() => setActiveGenre(tag.id)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border border-white/5",
                activeGenre === tag.id ? "bg-accent text-white border-accent shadow-[0_0_10px_rgba(153,27,27,0.3)]" : "bg-white/5 text-muted-foreground hover:bg-white/10"
              )}
            >
              {tag.attributes.name.en}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black tracking-tighter flex items-center gap-2 uppercase">
              <Flame className="w-5 h-5 text-accent" /> {activeGenre ? "Curated" : "Latest Updates"}
            </h2>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Real-time transmissions</p>
          </div>
          <Link href="/search" className="text-[9px] font-black text-accent hover:underline flex items-center gap-1 group uppercase tracking-widest bg-accent/5 px-3 py-1.5 rounded-lg border border-accent/10">
            View All <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        
        <div className="manga-grid">
          {latest.map((manga) => (
            <MangaCard key={manga.id} manga={manga} isTrending={manga.attributes.status === 'ongoing'} />
          ))}
        </div>

        {latest.length === 0 && !loading && (
          <div className="py-16 text-center glass rounded-2xl">
            <AlertCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">No titles found</p>
          </div>
        )}
      </section>

      <section className="relative rounded-2xl p-8 overflow-hidden group bg-[#0f0f13] border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent z-0" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent text-white rounded-full text-[8px] font-black uppercase tracking-widest">
              <Sparkles className="w-2.5 h-2.5" /> AI Engine
            </div>
            <h2 className="text-xl font-black tracking-tighter uppercase leading-none">Find your obsession</h2>
            <p className="text-xs text-muted-foreground font-medium max-w-sm">
              Analyzing patterns to discover hidden gems tailored to your taste.
            </p>
            <button className="px-6 py-3 bg-white text-black font-black rounded-xl hover:bg-accent hover:text-white transition-all duration-300 flex items-center gap-2 shadow-xl active:scale-95 text-[10px] uppercase tracking-widest mx-auto md:mx-0">
              Initialize Curator <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}