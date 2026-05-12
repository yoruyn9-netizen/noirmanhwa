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
          limit: 24 
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-xl font-black tracking-tighter flex items-center gap-3 uppercase text-glow">
          <Sparkles className="w-5 h-5 text-accent" /> Discovery
        </h1>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 ml-1">
          Scanning network frequencies...
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 relative group">
          <SearchIcon className={cn(
            "absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-300 z-20",
            loading ? "text-accent animate-pulse" : "text-muted-foreground group-focus-within:text-accent"
          )} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles..." 
            className="w-full bg-[#0f0f13] border border-white/5 rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-accent/40 text-[13px] font-bold placeholder:text-muted-foreground/30 relative z-10 transition-all shadow-xl"
          />
        </div>
        
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <button className={cn(
              "p-3.5 bg-[#0f0f13] border border-white/5 rounded-xl hover:bg-white/5 transition-all active:scale-90 relative",
              activeFilterCount > 0 && "border-accent/40 bg-accent/5"
            )}>
              <SlidersHorizontal className={cn(
                "w-4.5 h-4.5",
                activeFilterCount > 0 ? "text-accent" : "text-muted-foreground"
              )} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-[#050508]">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh] bg-[#050508] border-t border-white/10 rounded-t-[2rem] p-0">
            <div className="h-full flex flex-col p-8 space-y-8">
              <SheetHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <SheetTitle className="text-lg font-black tracking-tight uppercase">Deep Filter</SheetTitle>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Calibrate signal parameters</p>
                </div>
                <button 
                  onClick={resetFilters}
                  className="px-3 py-1.5 bg-white/5 rounded-lg text-muted-foreground hover:text-accent transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </SheetHeader>

              <ScrollArea className="flex-1">
                <div className="space-y-8 pb-10">
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-accent">Status</h3>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => toggleStatus(opt.value)}
                          className={cn(
                            "px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                            selectedStatus.includes(opt.value) 
                              ? "bg-accent border-accent text-white" 
                              : "bg-[#0f0f13] border-white/5 text-muted-foreground"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-accent">Genres</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availableTags.map((tag) => {
                        const isSelected = selectedTags.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.id)}
                            className={cn(
                              "flex items-center justify-between px-3 py-2.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all",
                              isSelected 
                                ? "bg-accent border-accent text-white" 
                                : "bg-[#0f0f13] border-white/5 text-muted-foreground"
                            )}
                          >
                            <span className="truncate">{tag.attributes.name.en}</span>
                            {isSelected && <Check className="w-3 h-3" />}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </ScrollArea>

              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-full py-4 bg-white text-black font-black rounded-xl text-[10px] uppercase tracking-widest hover:bg-accent hover:text-white transition-all"
              >
                Apply Parameters
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {loading && results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-6 h-6 text-accent animate-spin" />
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Synchronizing...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 glass rounded-2xl border-dashed">
           <AlertCircle className="w-10 h-10 text-accent opacity-20" />
           <div className="space-y-1">
             <h3 className="text-sm font-black uppercase tracking-tight">Signal Lost</h3>
             <p className="text-muted-foreground font-medium text-[11px] opacity-70">No matching frequencies detected.</p>
           </div>
           <button onClick={resetFilters} className="px-6 py-2 border border-accent/20 rounded-full text-accent font-black text-[9px] uppercase tracking-widest">Re-calibrate</button>
        </div>
      ) : (
        <div className="manga-grid">
          {results.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      )}
    </div>
  );
}