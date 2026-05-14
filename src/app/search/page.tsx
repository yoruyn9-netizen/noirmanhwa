
"use client";

import React, { useEffect, useState, use } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import MangaCard from '@/components/manga/MangaCard';
import { 
  Search as SearchIcon, 
  SlidersHorizontal, 
  Loader2, 
  SearchIcon as SearchIconLucide, 
  AlertCircle,
  RotateCcw,
  Filter,
  Languages,
  Tags
} from 'lucide-react';
import { Manga } from '@/types/manga';
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
];

const LANGUAGE_OPTIONS = [
  { label: 'English Sub', value: 'en' },
  { label: 'Indonesian Sub', value: 'id' },
];

export default function SearchPage({ searchParams }: SearchPageProps) {
  const params = use(searchParams);
  const router = useRouter();
  
  const [query, setQuery] = useState(params.q || '');
  const [debouncedQuery, setDebouncedQuery] = useState(params.q || '');
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(params.genre ? [params.genre] : []);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(params.genre ? ['en'] : []); // Default to en if genre selected as mint might not support it
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await mangaApi.getTags();
        if (res.data) setGenres(res.data);
      } catch (err) {
        console.error("Genre fetch error:", err);
      }
    };
    fetchGenres();
  }, []);

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
        const source = selectedLanguages.includes('id') ? 'mangamint' : 'mangadex';
        const res = await mangaApi.search(debouncedQuery, source, selectedGenres);
        let filtered = res;

        if (selectedStatus.length > 0) {
          filtered = filtered.filter(m => selectedStatus.includes(m.status.toLowerCase()));
        }

        setResults(filtered);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    
    // Update URL without full reload
    const url = new URL(window.location.href);
    if (debouncedQuery) url.searchParams.set('q', debouncedQuery);
    else url.searchParams.delete('q');
    
    if (selectedGenres.length > 0) url.searchParams.set('genre', selectedGenres[0]);
    else url.searchParams.delete('genre');
    
    router.replace(url.pathname + url.search);
  }, [debouncedQuery, selectedStatus, selectedLanguages, selectedGenres, router]);

  const toggleStatus = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [lang] // Single source selection for clarity
    );
  };

  const toggleGenre = (id: string) => {
    setSelectedGenres(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const resetFilters = () => {
    setSelectedStatus([]);
    setSelectedLanguages([]);
    setSelectedGenres([]);
    setQuery('');
  };

  const activeFilterCount = selectedStatus.length + selectedLanguages.length + selectedGenres.length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-5xl mx-auto">
      <div className="space-y-1 ml-1">
        <h1 className="text-xl font-black tracking-tighter flex items-center gap-3 uppercase text-glow">
          <SearchIconLucide className="w-5 h-5 text-accent" /> Search Manga
        </h1>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40 ml-1">
          Find your next favorite title
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative group">
          <SearchIcon className={cn(
            "absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-500 z-20",
            loading ? "text-accent animate-pulse" : "text-muted-foreground group-focus-within:text-accent"
          )} />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles..." 
            className="w-full bg-[#0a0a0f] border border-white/5 rounded-2xl pl-12 pr-5 py-3.5 focus:outline-none focus:ring-1 focus:ring-accent/40 text-[12px] font-black placeholder:text-muted-foreground/30 relative z-10 transition-all shadow-2xl"
          />
        </div>
        
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <button className={cn(
              "p-4 bg-[#0a0a0f] border border-white/5 rounded-2xl hover:bg-white/5 transition-all active:scale-95 relative shadow-2xl",
              activeFilterCount > 0 && "border-accent/40 bg-accent/5"
            )}>
              <SlidersHorizontal className={cn(
                "w-5 h-5",
                activeFilterCount > 0 ? "text-accent" : "text-muted-foreground"
              )} />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#020205] shadow-lg shadow-accent/40">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] bg-[#020205]/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[3rem] p-0 overflow-hidden z-[150]">
            <div className="h-full flex flex-col p-10 space-y-8">
              <SheetHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <SheetTitle className="text-xl font-black tracking-tight uppercase text-glow">Filters</SheetTitle>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">Refine your search results</p>
                </div>
                <button 
                  onClick={resetFilters}
                  className="px-4 py-2 bg-white/5 rounded-xl text-muted-foreground hover:text-accent transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </SheetHeader>

              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-10 pb-20">
                  {/* Language Section */}
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 flex items-center gap-2">
                      <Languages className="w-3.5 h-3.5" /> Subtitle Language
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {LANGUAGE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => toggleLanguage(opt.value)}
                          className={cn(
                            "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-500",
                            selectedLanguages.includes(opt.value) 
                              ? "bg-accent border-accent text-white shadow-xl shadow-accent/20" 
                              : "bg-[#0a0a0f] border-white/5 text-muted-foreground"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Status Section */}
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 flex items-center gap-2">
                      <Filter className="w-3.5 h-3.5" /> Status
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => toggleStatus(opt.value)}
                          className={cn(
                            "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-500",
                            selectedStatus.includes(opt.value) 
                              ? "bg-accent border-accent text-white shadow-xl shadow-accent/20" 
                              : "bg-[#0a0a0f] border-white/5 text-muted-foreground"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Genre Section */}
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 flex items-center gap-2">
                      <Tags className="w-3.5 h-3.5" /> Genres
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {genres.map((genre) => (
                        <button
                          key={genre.id}
                          onClick={() => toggleGenre(genre.id)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all duration-500",
                            selectedGenres.includes(genre.id) 
                              ? "bg-accent border-accent text-white shadow-lg" 
                              : "bg-[#0a0a0f] border-white/5 text-neutral-500"
                          )}
                        >
                          {genre.attributes.name.en}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              </ScrollArea>

              <div className="pt-4 bg-gradient-to-t from-[#020205] to-transparent pb-6">
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-5 bg-white text-black font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-accent hover:text-white transition-all shadow-2xl"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {loading && results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Searching...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 glass rounded-[3rem] border-dashed">
           <AlertCircle className="w-12 h-12 text-accent opacity-20" />
           <div className="space-y-2">
             <h3 className="text-base font-black uppercase tracking-tight">No Results Found</h3>
             <p className="text-muted-foreground font-medium text-[11px] opacity-50 max-w-[240px] mx-auto">Try adjusting your filters or search terms.</p>
           </div>
           <button onClick={resetFilters} className="px-8 py-3 bg-accent/10 border border-accent/20 rounded-2xl text-accent font-black text-[10px] uppercase tracking-widest hover:bg-accent hover:text-white transition-all">Clear All Filters</button>
        </div>
      ) : (
        <div className="manga-grid">
          {results.map((manga) => (
            <MangaCard key={`${manga.id}-${manga.source}`} manga={manga} />
          ))}
        </div>
      )}
    </div>
  );
}
