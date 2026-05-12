"use client";

import React, { useEffect, useState, use } from 'react';
import { mangaApi } from '@/lib/api';
import MangaCard from '@/components/MangaCard';
import { 
  Search as SearchIcon, 
  SlidersHorizontal, 
  Loader2, 
  Sparkles, 
  AlertCircle,
  X,
  Check,
  RotateCcw
} from 'lucide-react';
import { Manga } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; genre?: string }>;
}

const STATUS_OPTIONS = [
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Hiatus', value: 'hiatus' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function SearchPage({ searchParams }: SearchPageProps) {
  const params = use(searchParams);
  const router = useRouter();
  
  const [query, setQuery] = useState(params.q || '');
  const [debouncedQuery, setDebouncedQuery] = useState(params.q || '');
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTags, setSelectedTags] = useState<string[]>(params.genre ? [params.genre] : []);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 600);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    mangaApi.getTags().then(res => {
      if (res.data) setAvailableTags(res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const resultsRes = await mangaApi.search({ 
          title: debouncedQuery, 
          includedTags: selectedTags,
          status: selectedStatus,
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
    
    const url = new URL(window.location.href);
    if (debouncedQuery) url.searchParams.set('q', debouncedQuery);
    else url.searchParams.delete('q');
    
    if (selectedTags.length === 1) url.searchParams.set('genre', selectedTags[0]);
    else url.searchParams.delete('genre');
    
    router.replace(url.pathname + url.search);
  }, [debouncedQuery, selectedTags, selectedStatus, router]);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const resetFilters = () => {
    setSelectedTags([]);
    setSelectedStatus([]);
    setQuery('');
  };

  const activeFilterCount = selectedTags.length + selectedStatus.length;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-5xl mx-auto">
      <div className="space-y-3">
        <h1 className="text-5xl font-black tracking-tighter leading-none flex items-center gap-4 text-glow">
          <Sparkles className="w-10 h-10 text-accent" /> DISCOVERY
        </h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.4em] ml-1 opacity-60">
          Neural link scanning MangaDex network...
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <div className="absolute inset-0 bg-accent/5 rounded-2xl blur-2xl group-focus-within:bg-accent/15 transition-all duration-500" />
          <SearchIcon className={cn(
            "absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-500 z-20",
            loading ? "text-accent animate-pulse" : "text-muted-foreground group-focus-within:text-accent group-focus-within:scale-110"
          )} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Initialize scan for titles, authors, artists..." 
            className="w-full bg-[#0f0f13] border border-white/5 rounded-2xl pl-16 pr-6 py-5 focus:outline-none focus:ring-1 focus:ring-accent/40 text-sm font-bold placeholder:text-muted-foreground/30 relative z-10 transition-all shadow-2xl"
          />
        </div>
        
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <button className={cn(
              "p-5 bg-[#0f0f13] border border-white/5 rounded-2xl hover:bg-white/5 transition-all active:scale-90 group relative shadow-2xl overflow-hidden",
              activeFilterCount > 0 && "border-accent/40 bg-accent/5"
            )}>
              <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <SlidersHorizontal className={cn(
                "w-6 h-6 transition-all duration-500 relative z-10",
                activeFilterCount > 0 ? "text-accent scale-110" : "text-muted-foreground group-hover:text-white"
              )} />
              {activeFilterCount > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(153,27,27,1)] border-2 border-[#050508] z-20">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] bg-[#050508] border-t border-white/10 rounded-t-[3.5rem] p-0 overflow-hidden">
            <div className="h-full flex flex-col p-10 space-y-10">
              <SheetHeader className="flex flex-row items-center justify-between">
                <div className="space-y-2">
                  <SheetTitle className="text-4xl font-black tracking-tighter uppercase leading-none">Deep Filter</SheetTitle>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] opacity-50">Parameters for precise link calibration</p>
                </div>
                <button 
                  onClick={resetFilters}
                  className="p-4 bg-white/5 rounded-2xl text-muted-foreground hover:text-accent transition-all flex items-center gap-3 text-xs font-black uppercase tracking-widest border border-white/5"
                >
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
              </SheetHeader>

              <ScrollArea className="flex-1 -mr-4 pr-4">
                <div className="space-y-12 pb-16">
                  <section className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-accent flex items-center gap-3">
                      <div className="w-8 h-[1px] bg-accent/30" /> STATUS
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => toggleStatus(opt.value)}
                          className={cn(
                            "px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                            selectedStatus.includes(opt.value) 
                              ? "bg-accent border-accent text-white shadow-[0_0_20px_rgba(153,27,27,0.5)] scale-105" 
                              : "bg-[#0f0f13] border-white/5 text-muted-foreground hover:border-accent/40"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-accent flex items-center gap-3">
                      <div className="w-8 h-[1px] bg-accent/30" /> GENRE SIGNATURES
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {availableTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.id)}
                            className={cn(
                              "flex items-center justify-between px-5 py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                              isSelected 
                                ? "bg-accent border-accent text-white shadow-[0_0_20px_rgba(153,27,27,0.4)] scale-[1.02] z-10" 
                                : "bg-[#0f0f13] border-white/5 text-muted-foreground hover:bg-white/5 hover:border-accent/40"
                            )}
                          >
                            <span className="truncate pr-2">{tag.attributes.name.en}</span>
                            {isSelected && <Check className="w-4 h-4 flex-shrink-0 animate-in zoom-in duration-300" />}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </ScrollArea>

              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-full py-6 bg-white text-black font-black rounded-2xl shadow-2xl uppercase tracking-[0.2em] text-sm hover:bg-accent hover:text-white transition-all duration-500 active:scale-95"
              >
                APPLY PARAMETERS
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {loading && results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-6">
          <div className="relative">
             <div className="w-16 h-16 border-4 border-accent/10 border-t-accent rounded-full animate-spin" />
             <div className="absolute inset-0 bg-accent/5 rounded-full blur-xl animate-pulse" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Synchronizing Link...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 text-center space-y-8 glass rounded-[4rem] border-dashed animate-in fade-in duration-1000">
           <div className="bg-accent/5 p-10 rounded-full border border-accent/10 relative">
             <AlertCircle className="w-14 h-14 text-accent opacity-20" />
             <div className="absolute inset-0 bg-accent/5 rounded-full blur-2xl" />
           </div>
           <div className="space-y-2">
             <h3 className="text-3xl font-black tracking-tighter uppercase">Signal Lost</h3>
             <p className="text-muted-foreground font-medium text-sm max-w-xs mx-auto opacity-70">The network returned no matching frequencies. Try re-calibrating your search.</p>
           </div>
           <button onClick={resetFilters} className="px-10 py-4 border border-accent/20 rounded-full text-accent font-black text-[10px] uppercase tracking-[0.2em] hover:bg-accent hover:text-white transition-all">RE-CALIBRATE</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12">
          {results.map((manga, idx) => (
            <div key={manga.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 50}ms` }}>
              <MangaCard manga={manga} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}