"use client";

import React, { useEffect, useState, use, Suspense } from 'react';
import { fetchMangaList, Manga } from '@/lib/mangaApi';
import MangaCard from '@/components/manga/MangaCard';
import { 
  Search as SearchIcon, 
  Loader2, 
  SearchIcon as SearchIconLucide, 
  AlertCircle,
  RotateCcw,
  Filter
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ThreeBodyLoader from '@/components/ui/ThreeBodyLoader';

const STATUS_OPTIONS = [
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Hiatus', value: 'hiatus' },
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const { openPanel, closePanel } = useUIStore();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetchMangaList();
        let filtered = res;

        if (query) {
          filtered = filtered.filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
        }

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

    const timer = setTimeout(fetchResults, 400);
    return () => clearTimeout(timer);
  }, [query, selectedStatus]);

  const toggleStatus = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const resetFilters = () => {
    setSelectedStatus([]);
    setQuery('');
  };

  const handleFilterOpenChange = (open: boolean) => {
    setIsFilterOpen(open);
    if (open) {
      openPanel('search');
    } else {
      closePanel();
    }
  };

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

      <div className="flex items-center gap-3 px-2">
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
        
        <Sheet open={isFilterOpen} onOpenChange={handleFilterOpenChange}>
          <SheetTrigger asChild>
            <button className={cn(
              "p-4 bg-[#0a0a0f] border border-white/5 rounded-2xl hover:bg-white/5 transition-all active:scale-95 relative shadow-2xl",
              selectedStatus.length > 0 && "border-accent/40 bg-accent/5"
            )}>
              <Filter className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[50vh] bg-[#020205]/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[3rem] p-10">
            <SheetHeader className="flex flex-row items-center justify-between mb-8">
              <SheetTitle className="text-xl font-black tracking-tight uppercase">Filters</SheetTitle>
              <button onClick={resetFilters} className="text-[10px] font-black uppercase text-accent">Reset</button>
            </SheetHeader>
            <div className="space-y-6">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Status</h3>
               <div className="flex flex-wrap gap-2">
                 {STATUS_OPTIONS.map(opt => (
                   <button 
                     key={opt.value}
                     onClick={() => toggleStatus(opt.value)}
                     className={cn(
                       "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                       selectedStatus.includes(opt.value) ? "bg-accent border-accent text-white" : "bg-white/5 border-white/5 text-neutral-500"
                     )}
                   >
                     {opt.label}
                   </button>
                 ))}
               </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {loading && results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <ThreeBodyLoader />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Syncing Library...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 glass rounded-[3rem] border-dashed mx-2">
           <AlertCircle className="w-12 h-12 text-accent opacity-20" />
           <div className="space-y-2">
             <h3 className="text-base font-black uppercase tracking-tight">No Results Found</h3>
             <p className="text-muted-foreground font-medium text-[11px] opacity-50">Try adjusting your search query.</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-2 sm:px-4">
          {results.map((manga) => (
            <MangaCard key={`${manga.id}-${manga.source}`} manga={manga} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  );
}
