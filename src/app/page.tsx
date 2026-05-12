"use client";

import React, { useEffect, useState } from 'react';
import { mangaApi } from '@/lib/api';
import HeroSlider from '@/components/HeroSlider';
import MangaCard from '@/components/MangaCard';
import { ChevronRight, Sparkles, Flame, AlertCircle, TrendingUp, ArrowRight, ArrowDown } from 'lucide-react';
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
  const [showReloadHint, setShowReloadHint] = useState(false);

  const GENRES_TO_SHOW = [
    'Action', 'Comedy', 'Drama', 'Fantasy', 'Romance', 
    'Isekai', 'Horror', 'Adventure', 'Martial Arts'
  ];

  const fetchData = async () => {
    if (!latest.length) setLoading(true);
    setError(null);
    setShowReloadHint(false);
    
    try {
      if (genres.length === 0) {
        mangaApi.getTags().then(tagsRes => {
          const filteredTags = tagsRes.data.filter((t: any) => 
            GENRES_TO_SHOW.includes(t.attributes.name.en)
          ).sort((a: any, b: any) => GENRES_TO_SHOW.indexOf(a.attributes.name.en) - GENRES_TO_SHOW.indexOf(b.attributes.name.en));
          setGenres(filteredTags);
        }).catch(() => console.warn("Failed to load tags"));
      }

      const [trendingRes, latestRes] = await Promise.allSettled([
        mangaApi.getTrending(),
        mangaApi.getLatest(0, activeGenre ? [activeGenre] : [])
      ]);
      
      if (trendingRes.status === 'fulfilled') {
        setTrending(trendingRes.value.data as Manga[]);
      }
      
      if (latestRes.status === 'fulfilled') {
        setLatest(latestRes.value.data as Manga[]);
      } else {
        setError("Primary node connection failed. Retrying...");
      }

      if (trendingRes.status === 'rejected' && latestRes.status === 'rejected') {
        throw new Error("MangaDex Network Error: Nodes are unreachable.");
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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading) {
      timer = setTimeout(() => {
        setShowReloadHint(true);
      }, 5000);
    } else {
      setShowReloadHint(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading && !latest.length) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto py-10">
        {showReloadHint && (
          <div className="flex flex-col items-center justify-center py-4 animate-bounce text-accent">
            <ArrowDown className="w-5 h-5 mb-1" />
            <p className="text-[8px] font-black uppercase tracking-widest">Swipe Down to Resync</p>
          </div>
        )}
        <Skeleton className="w-full aspect-[21/10] rounded-[2.5rem]" />
        <div className="flex gap-2 overflow-hidden">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-7 w-20 rounded-full flex-shrink-0" />)}
        </div>
        <div className="manga-grid">
          {[...Array(12)].map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto animate-in fade-in duration-1000">
      {showReloadHint && loading && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center justify-center py-2 text-accent animate-in slide-in-from-top-4">
          <ArrowDown className="w-4 h-4 mb-1 animate-bounce" />
          <p className="text-[7px] font-black uppercase tracking-[0.3em] bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-accent/20">Spectral Resync Recommended</p>
        </div>
      )}

      <HeroSlider trending={trending} />

      <section className="space-y-4">
        <h2 className="text-[9px] font-black tracking-[0.2em] flex items-center gap-2 uppercase opacity-60 ml-1">
          <TrendingUp className="w-3.5 h-3.5 text-accent" /> Spectral Segments
        </h2>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar -mx-4 px-4">
          <button 
            onClick={() => setActiveGenre(null)}
            className={cn(
              "px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
              activeGenre === null ? "bg-accent border-accent text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]" : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10"
            )}
          >
            All Nodes
          </button>
          {genres.map((tag) => (
            <button 
              key={tag.id}
              onClick={() => setActiveGenre(tag.id)}
              className={cn(
                "px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                activeGenre === tag.id ? "bg-accent border-accent text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]" : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10"
              )}
            >
              {tag.attributes.name.en}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-0.5">
            <h2 className="text-lg font-black tracking-tighter flex items-center gap-2 uppercase text-glow">
              <Flame className="w-4.5 h-4.5 text-accent" /> {activeGenre ? "Curated Node" : "Live Transmissions"}
            </h2>
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Real-time database sync</p>
          </div>
          <Link href="/search" className="text-[9px] font-black text-accent hover:opacity-80 flex items-center gap-1.5 group uppercase tracking-widest bg-accent/5 px-4 py-2 rounded-xl border border-accent/10 transition-all">
            Full Network <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        
        {error && latest.length === 0 ? (
          <div className="py-24 text-center glass rounded-[2.5rem] space-y-6">
            <AlertCircle className="w-12 h-12 text-accent/20 mx-auto" />
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">{error}</p>
              <button 
                onClick={() => fetchData()}
                className="px-8 py-3 bg-accent text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all"
              >
                Reconnect to Nodes
              </button>
            </div>
          </div>
        ) : (
          <div className="manga-grid">
            {latest.map((manga) => (
              <MangaCard key={manga.id} manga={manga} isTrending={manga.attributes.status === 'ongoing'} />
            ))}
          </div>
        )}

        {latest.length === 0 && !loading && !error && (
          <div className="py-24 text-center glass rounded-3xl border-dashed">
            <AlertCircle className="w-10 h-10 text-accent/20 mx-auto mb-4" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">No Signal Detected</p>
          </div>
        )}
      </section>

      <section className="relative rounded-[2.5rem] p-10 overflow-hidden group border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-transparent z-0" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/20 text-accent rounded-full text-[8px] font-black uppercase tracking-widest border border-accent/20">
              <Sparkles className="w-3 h-3" /> Neural Curator
            </div>
            <h2 className="text-2xl font-black tracking-tighter uppercase leading-none text-glow">Evolve your taste</h2>
            <p className="text-[11px] text-muted-foreground font-medium max-w-sm leading-relaxed opacity-70">
              Our AI analyzes your reading patterns to discover high-fidelity series across the global network.
            </p>
            <button className="px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-accent hover:text-white transition-all duration-500 flex items-center gap-3 shadow-2xl active:scale-95 text-[10px] uppercase tracking-widest mx-auto md:mx-0">
              Initialize Discovery <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}