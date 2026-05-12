
"use client";

import React, { useEffect, useState, use } from 'react';
import { mangaApi } from '@/lib/api';
import MangaCard from '@/components/MangaCard';
import { Search as SearchIcon, SlidersHorizontal, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Manga } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; genre?: string }>;
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const params = use(searchParams);
  const router = useRouter();
  const [query, setQuery] = useState(params.q || '');
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [debouncedQuery, setDebouncedQuery] = useState(params.q || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 600);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const resultsRes = await mangaApi.search({ 
          title: debouncedQuery, 
          includedTags: params.genre ? [params.genre] : [],
          limit: 30 
        });
        setResults(resultsRes.data || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    if (debouncedQuery || params.genre) {
      const url = new URL(window.location.href);
      if (debouncedQuery) url.searchParams.set('q', debouncedQuery);
      else url.searchParams.delete('q');
      router.replace(url.pathname + url.search);
    }
  }, [debouncedQuery, params.genre, router]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-3">
        <h1 className="text-6xl font-black tracking-tighter leading-none flex items-center gap-4">
          <Sparkles className="w-12 h-12 text-accent" /> DISCOVERY
        </h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.4em] ml-2">
          {debouncedQuery ? `Filtering node: "${debouncedQuery}"` : "Initializing global scan..."}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <div className="absolute inset-0 bg-accent/5 rounded-3xl blur-xl group-focus-within:bg-accent/10 transition-all" />
          <SearchIcon className={cn(
            "absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors duration-500",
            loading ? "text-accent animate-pulse" : "text-muted-foreground group-focus-within:text-accent"
          )} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Series, Author, or Publisher..." 
            className="w-full bg-[#0f0f13] border border-white/5 rounded-3xl pl-16 pr-6 py-6 focus:outline-none focus:ring-2 focus:ring-accent/40 text-lg font-bold placeholder:text-muted-foreground/30 relative z-10"
          />
        </div>
        <button className="p-6 bg-[#0f0f13] border border-white/5 rounded-3xl hover:bg-secondary transition-all hover:scale-105 active:scale-95 group relative">
          <SlidersHorizontal className="w-6 h-6 group-hover:text-accent transition-colors" />
        </button>
      </div>

      {loading && results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-6">
          <div className="relative">
             <div className="w-20 h-20 border-4 border-accent/20 border-t-accent rounded-full animate-spin" />
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-8 h-8 bg-accent/20 rounded-full animate-pulse" />
             </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Scouring MangaDex Database...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 text-center space-y-6 glass rounded-[4rem]">
           <div className="bg-accent/5 p-10 rounded-full border border-accent/10">
             <AlertCircle className="w-16 h-16 text-accent opacity-40" />
           </div>
           <div className="space-y-2">
             <h3 className="text-3xl font-black tracking-tighter uppercase">Zero Signal Detected</h3>
             <p className="text-muted-foreground font-medium text-sm">No series matches your current frequency signature.</p>
           </div>
           <button onClick={() => setQuery('')} className="text-accent font-black text-xs uppercase tracking-[0.2em] hover:underline">Reset Node</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
          {results.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      )}
    </div>
  );
}
