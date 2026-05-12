"use client";

import React, { useEffect, useState } from 'react';
import { mangaApi } from '@/lib/api';
import HeroSlider from '@/components/HeroSlider';
import MangaCard from '@/components/MangaCard';
import { ChevronRight, Sparkles, Flame, AlertCircle, RefreshCcw, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Manga } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
    'Isekai', 'Horror', 'Adventure', 'Martial Arts', 
    'Supernatural', 'Thriller', 'Slice of Life'
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
        setError("MangaDex API is currently under heavy load. Please try again.");
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
      <div className="space-y-12">
        <Skeleton className="w-full aspect-[21/9] rounded-3xl" />
        <div className="flex gap-2 overflow-hidden py-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />)}
        </div>
        <div className="manga-grid">
          {[...Array(12)].map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <HeroSlider trending={trending} />

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-accent" /> TOP CATEGORIES
          </h2>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar -mx-4 px-4">
          <button 
            onClick={() => setActiveGenre(null)}
            className={cn(
              "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border border-white/5",
              activeGenre === null ? "bg-accent text-white border-accent shadow-[0_0_15px_rgba(153,27,27,0.4)]" : "bg-white/5 text-muted-foreground hover:bg-white/10"
            )}
          >
            Discover All
          </button>
          {genres.map((tag) => (
            <button 
              key={tag.id}
              onClick={() => setActiveGenre(tag.id)}
              className={cn(
                "px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border border-white/5",
                activeGenre === tag.id ? "bg-accent text-white border-accent shadow-[0_0_15px_rgba(153,27,27,0.4)]" : "bg-white/5 text-muted-foreground hover:bg-white/10"
              )}
            >
              {tag.attributes.name.en}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
              <Flame className="w-8 h-8 text-accent animate-pulse" /> {activeGenre ? "CURATED TITLES" : "NEW TRANSMISSIONS"}
            </h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Updated real-time from MangaDex</p>
          </div>
          <Link href="/search" className="text-xs font-black text-accent hover:underline flex items-center gap-1 group uppercase tracking-widest bg-accent/5 px-4 py-2 rounded-xl border border-accent/10">
            VIEW ALL <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <div className="manga-grid">
          {latest.map((manga) => (
            <MangaCard key={manga.id} manga={manga} isTrending={manga.attributes.status === 'ongoing'} />
          ))}
        </div>

        {latest.length === 0 && !loading && (
          <div className="py-20 text-center glass rounded-3xl">
            <AlertCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground italic font-medium">No titles found. Try another transmission frequency.</p>
          </div>
        )}
      </section>

      <section className="relative rounded-[2rem] p-10 overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent z-0" />
        <div className="absolute inset-0 bg-[#0f0f13] z-[-1]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-[100px] group-hover:bg-accent/20 transition-all duration-700" />
        
        <div className="relative z-10 grid md:grid-cols-2 items-center gap-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent text-white rounded-full text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> NOIR AI ENGINE
            </div>
            <h2 className="text-5xl font-black tracking-tighter leading-none">CAN'T FIND YOUR NEXT OBSESSION?</h2>
            <p className="text-lg text-muted-foreground font-medium">
              Our neural network analyzes your reading patterns to discover hidden gems tailored to your specific taste.
            </p>
            <button className="px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-accent hover:text-white transition-all duration-300 flex items-center gap-3 shadow-2xl active:scale-95 text-sm uppercase tracking-widest">
              INITIALIZE AI CURATOR <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="hidden md:flex justify-end">
            <div className="w-64 h-80 rounded-3xl border border-white/10 glass rotate-6 -mr-10 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            </div>
            <div className="w-64 h-80 rounded-3xl border border-accent/20 glass -rotate-3 relative overflow-hidden shadow-[0_0_50px_rgba(153,27,27,0.2)]">
               <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { ArrowRight } from 'lucide-react';