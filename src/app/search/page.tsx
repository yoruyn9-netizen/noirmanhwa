"use client";

import React, { useEffect, useState, use } from 'react';
import { mangaApi } from '@/lib/api';
import MangaCard from '@/components/MangaCard';
import { Search as SearchIcon, SlidersHorizontal, Loader2 } from 'lucide-react';
import { Manga } from '@/lib/types';
import { useRouter } from 'next/navigation';

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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const resultsRes = await mangaApi.search({ 
          title: debouncedQuery, 
          limit: 24 
        });
        setResults(resultsRes.data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    if (debouncedQuery) {
      router.replace(`/search?q=${debouncedQuery}`);
    }
  }, [debouncedQuery, router]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tighter">Discovery</h1>
        <p className="text-muted-foreground font-medium text-sm">
          Searching for <span className="text-accent">"{debouncedQuery || 'Latest Titles'}"</span>
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <SearchIcon className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors",
            loading ? "text-accent animate-pulse" : "text-muted-foreground"
          )} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search series, author, or publisher..." 
            className="w-full bg-secondary/30 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50 text-base md:text-lg transition-all"
          />
        </div>
        <button className="p-4 bg-secondary/30 border border-white/10 rounded-2xl hover:bg-secondary transition-colors group">
          <SlidersHorizontal className="w-6 h-6 group-hover:text-accent transition-colors" />
        </button>
      </div>

      {loading && results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
          <Loader2 className="w-12 h-12 text-accent animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scouring MangaDex...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
           <div className="bg-secondary/20 p-6 rounded-full">
             <SearchIcon className="w-12 h-12 text-muted-foreground opacity-20" />
           </div>
           <h3 className="text-xl font-bold">No results found</h3>
           <p className="text-muted-foreground text-sm">Try adjusting your keywords or using broad terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
          {results.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      )}
    </div>
  );
}

// Re-import cn for utility
import { cn } from '@/lib/utils';
