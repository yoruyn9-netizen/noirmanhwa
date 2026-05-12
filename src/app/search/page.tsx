
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tighter leading-none flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-accent" /> DISCOVERY
        </h1>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] ml-1">
          {debouncedQuery ? `Filtering node: "${debouncedQuery}"` : "Initializing global scan..."}
        </p>
      </div>

      <div className="flex items-center gap-3 max-w-2xl">
        <div className="flex-1 relative group">
          <div className="absolute inset-0 bg-accent/5 rounded-2xl blur-lg group-focus-within:bg-accent/10 transition-all" />
          <SearchIcon className={cn(
            "absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-500",
            loading ? "text-accent animate-pulse" : "text-muted-foreground group-focus-within:text-accent"
          )} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Series, Author, or Publisher..." 
            className="w-full bg-[#0f0f13] border border-white/5 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-1 focus:ring-accent/40 text-sm font-bold placeholder:text-muted-foreground/30 relative z-10 transition-all"
          />
        </div>
        <button className="p-4 bg-[#0f0f13] border border-white/5 rounded-2xl hover:bg-secondary transition-all active:scale-95 group relative">
          <SlidersHorizontal className="w-5 h-5 group-hover:text-accent transition-colors" />
        </button>
      </div>

      {loading && results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative">
             <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Scouring Database...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 glass rounded-[3rem] border-dashed">
           <div className="bg-accent/5 p-8 rounded-full border border-accent/10">
             <AlertCircle className="w-12 h-12 text-accent opacity-30" />
           </div>
           <div className="space-y-1">
             <h3 className="text-xl font-black tracking-tighter uppercase">Zero Signal</h3>
             <p className="text-muted-foreground font-medium text-xs">No matching frequency signature found.</p>
           </div>
           <button onClick={() => setQuery('')} className="text-accent font-black text-[10px] uppercase tracking-widest hover:underline">Reset Node</button>
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
