
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
import { Badge } from '@/components/ui/badge';
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
  
  // Search state
  const [query, setQuery] = useState(params.q || '');
  const [debouncedQuery, setDebouncedQuery] = useState(params.q || '');
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [selectedTags, setSelectedTags] = useState<string[]>(params.genre ? [params.genre] : []);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 600);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch available tags once
  useEffect(() => {
    mangaApi.getTags().then(res => {
      if (res.data) setAvailableTags(res.data);
    }).catch(console.error);
  }, []);

  // Main search effect
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
    
    // Update URL without reloading to reflect state
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tighter leading-none flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-accent" /> DISCOVERY
        </h1>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] ml-1">
          {debouncedQuery ? `Filtering node: "${debouncedQuery}"` : "Initializing global scan..."}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative group">
          <div className="absolute inset-0 bg-accent/5 rounded-2xl blur-lg group-focus-within:bg-accent/10 transition-all" />
          <SearchIcon className={cn(
            "absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-500",
            loading ? "text-accent animate-pulse" : "text-muted-foreground group-focus-within:text-accent"
          )} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles..." 
            className="w-full bg-[#0f0f13] border border-white/5 rounded-2xl pl-12 pr-5 py-3.5 focus:outline-none focus:ring-1 focus:ring-accent/40 text-sm font-bold placeholder:text-muted-foreground/30 relative z-10 transition-all"
          />
        </div>
        
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <button className={cn(
              "p-3.5 bg-[#0f0f13] border border-white/5 rounded-2xl hover:bg-secondary transition-all active:scale-95 group relative",
              activeFilterCount > 0 && "border-accent/40 bg-accent/5"
            )}>
              <SlidersHorizontal className={cn(
                "w-5 h-5 transition-colors",
                activeFilterCount > 0 ? "text-accent" : "text-muted-foreground group-hover:text-accent"
              )} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-[#050508]">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] bg-[#050508] border-t border-white/5 rounded-t-[3rem] p-0">
            <div className="h-full flex flex-col p-8 space-y-8">
              <SheetHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <SheetTitle className="text-3xl font-black tracking-tighter uppercase">Deep Filter</SheetTitle>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Neural search parameters</p>
                </div>
                <button 
                  onClick={resetFilters}
                  className="p-3 bg-white/5 rounded-2xl text-muted-foreground hover:text-accent transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </SheetHeader>

              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-10 pb-12">
                  <section className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent">Publication Status</h3>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => toggleStatus(opt.value)}
                          className={cn(
                            "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                            selectedStatus.includes(opt.value) 
                              ? "bg-accent border-accent text-white shadow-[0_0_15px_rgba(153,27,27,0.3)]" 
                              : "bg-white/5 border-white/5 text-muted-foreground hover:bg-white/10"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-accent">Genre Signatures</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {availableTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.id)}
                            className={cn(
                              "flex items-center justify-between px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                              isSelected 
                                ? "bg-accent border-accent text-white shadow-[0_0_15px_rgba(153,27,27,0.2)]" 
                                : "bg-[#0f0f13] border-white/5 text-muted-foreground hover:border-accent/40"
                            )}
                          >
                            <span className="truncate pr-2">{tag.attributes.name.en}</span>
                            {isSelected && <Check className="w-3 h-3 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </ScrollArea>

              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-full py-5 bg-accent text-white font-black rounded-2xl shadow-2xl uppercase tracking-widest text-xs hover:bg-red-600 transition-all active:scale-95"
              >
                Apply Transmissions
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {loading && results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="relative">
             <div className="w-10 h-10 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Decoding Frequencies...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 glass rounded-[3rem] border-dashed">
           <div className="bg-accent/5 p-8 rounded-full border border-accent/10">
             <AlertCircle className="w-10 h-10 text-accent opacity-30" />
           </div>
           <div className="space-y-1">
             <h3 className="text-xl font-black tracking-tighter uppercase">No Signal</h3>
             <p className="text-muted-foreground font-medium text-xs">The network couldn't find a matching frequency.</p>
           </div>
           <button onClick={resetFilters} className="text-accent font-black text-[10px] uppercase tracking-widest hover:underline">Re-calibrate Link</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-10">
          {results.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      )}
    </div>
  );
}
