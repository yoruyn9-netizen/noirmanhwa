"use client";

import React, { useEffect, useState } from 'react';
import { mangaApi } from '@/lib/api';
import HeroSlider from '@/components/HeroSlider';
import MangaCard from '@/components/MangaCard';
import { ChevronRight, Sparkles, Flame, AlertCircle, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { Manga } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [trending, setTrending] = useState<Manga[]>([]);
  const [latest, setLatest] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [genres, setGenres] = useState<any[]>([]);
  const [activeGenre, setActiveGenre] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch tags first to build the filter, but don't let it block everything
      const tagsRes = await mangaApi.getTags().catch(err => {
        console.error("Tags fetch failed", err);
        return { data: [] };
      });
      
      const popularTags = tagsRes.data.filter((t: any) => 
        ['Action', 'Comedy', 'Drama', 'Fantasy', 'Romance', 'Sci-Fi', 'Horror', 'Adventure'].includes(t.attributes.name.en)
      ).slice(0, 10);
      setGenres(popularTags);

      // Fetch trending and latest in parallel with individual error handling
      const [trendingRes, latestRes] = await Promise.all([
        mangaApi.getTrending().catch(err => {
          console.error("Trending fetch error:", err);
          return { data: [] };
        }),
        mangaApi.getLatest(0, activeGenre ? [activeGenre] : []).catch(err => {
          console.error("Latest fetch error:", err);
          return { data: [] };
        })
      ]);
      
      setTrending(trendingRes.data as Manga[]);
      setLatest(latestRes.data as Manga[]);
      
      if ((trendingRes.data as any[]).length === 0 && (latestRes.data as any[]).length === 0) {
        setError("MangaDex is currently unresponsive. Please check your connection or try again later.");
      }

    } catch (err: any) {
      console.error("Home main fetch error:", err);
      setError(err.message || "An unexpected error occurred while summoning manga.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeGenre]);

  if (error && trending.length === 0 && latest.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in duration-500">
        <div className="p-6 bg-destructive/10 rounded-full">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-black tracking-tighter uppercase">Connection Interrupted</h2>
          <p className="text-sm text-muted-foreground font-medium">{error}</p>
        </div>
        <Button 
          onClick={() => fetchData()} 
          variant="outline"
          className="rounded-xl font-black gap-2 border-white/10"
        >
          <RefreshCcw className="w-4 h-4" /> TRY AGAIN
        </Button>
      </div>
    );
  }

  if (loading && trending.length === 0) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="w-full aspect-[21/9] bg-secondary/20 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-secondary/20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <HeroSlider trending={trending} />

      {/* Genre Filter Tabs */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-4 hide-scrollbar -mx-4 px-4">
          <button 
            onClick={() => setActiveGenre(null)}
            className={cn(
              "px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
              activeGenre === null ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-secondary/30 text-muted-foreground hover:text-white"
            )}
          >
            All Genres
          </button>
          {genres.map((tag) => (
            <button 
              key={tag.id}
              onClick={() => setActiveGenre(tag.id)}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                activeGenre === tag.id ? "bg-accent text-white shadow-lg shadow-accent/20" : "bg-secondary/30 text-muted-foreground hover:text-white"
              )}
            >
              {tag.attributes.name.en}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-black tracking-tighter flex items-center gap-2">
            <Flame className="w-6 h-6 text-accent animate-pulse" /> {activeGenre ? "FILTERED RESULTS" : "LATEST UPDATES"}
          </h2>
          <Link href="/search" className="text-[10px] font-black text-accent hover:underline flex items-center gap-1 group uppercase tracking-widest">
            Explore More <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {latest.map((manga) => (
            <MangaCard key={manga.id} manga={manga} isTrending={manga.attributes.status === 'ongoing'} />
          ))}
          {latest.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center">
              <p className="text-muted-foreground italic font-medium">No titles found in this category.</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-secondary/10 rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-accent border border-white/5">
            <Sparkles className="w-3 h-3" /> Noir Recommendation
          </div>
          <h2 className="text-3xl font-black tracking-tighter">Cant find anything?</h2>
          <p className="text-muted-foreground max-w-xl font-medium text-sm">
            Our AI analysis engine can scan through thousands of titles on MangaDex to find your next favorite based on what you've read before.
          </p>
          <button className="px-8 py-3 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2 shadow-xl active:scale-95">
            LAUNCH AI CURATOR
          </button>
        </div>
      </section>
    </div>
  );
}