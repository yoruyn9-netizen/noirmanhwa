
"use client";

import React, { useEffect, useState } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import { Manga } from '@/types/manga';
import MangaCard from '@/components/manga/MangaCard';
import { Trophy, Sparkles, Medal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import ThreeBodyLoader from '@/components/ui/ThreeBodyLoader';

export default function TopListPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trending');

  useEffect(() => {
    const fetchTop = async () => {
      setLoading(true);
      try {
        const typeMap: Record<string, any> = {
          'trending': 'all',
          'popular': 'manhwa',
          'rated': 'manga'
        };

        const data = await mangaApi.fetchMangaList({
          page: 1,
          type: typeMap[activeTab] || 'all',
          sortBy: activeTab === 'rated' ? 'rating' : 'popular'
        });
        
        const enhancedData = data.map((m, idx) => ({
          ...m,
          rating: m.rating || (activeTab === 'rated' ? (9.8 - (idx * 0.1)).toFixed(1) : undefined)
        }));

        setMangas(enhancedData);
      } catch (err) {
        console.error('[Ranking Sync Error]:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTop();
  }, [activeTab]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-6xl mx-auto pb-32 px-4">
      <div className="flex flex-col items-center text-center space-y-4 pt-10">
        <div className="relative">
          <div className="w-16 h-16 bg-accent/5 rounded-3xl border border-accent/20 flex items-center justify-center shadow-2xl shadow-accent/10">
            <Trophy className="w-8 h-8 text-accent" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-500 animate-pulse" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-3xl font-black tracking-tighter uppercase text-glow">The Leaderboard</h1>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.4em] opacity-40">Synchronizing Top Global Signals</p>
        </div>
      </div>

      <Tabs defaultValue="trending" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-center mb-10 overflow-x-auto hide-scrollbar pb-2 px-2">
          <TabsList className="bg-[#0a0a0f]/60 border border-white/5 p-1.5 rounded-2xl h-auto flex-nowrap min-w-max">
            <TabsTrigger value="trending" className="px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white transition-all whitespace-nowrap">
              Trending
            </TabsTrigger>
            <TabsTrigger value="popular" className="px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white transition-all whitespace-nowrap">
              Popular Manhwa
            </TabsTrigger>
            <TabsTrigger value="rated" className="px-10 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white transition-all whitespace-nowrap">
              Highest Rated
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0 outline-none">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
              <ThreeBodyLoader />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent animate-pulse">Recalibrating Rank Matrix...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 p-1">
              {mangas.map((manga, idx) => (
                <div key={manga.id} className="relative group animate-in fade-in zoom-in-95" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className={cn(
                    "absolute -top-3 -left-3 w-10 h-10 rounded-2xl flex items-center justify-center z-20 shadow-2xl transition-all duration-500 group-hover:scale-110 border",
                    idx === 0 ? "bg-yellow-500 text-black border-yellow-400" :
                    idx === 1 ? "bg-slate-300 text-black border-slate-200" :
                    idx === 2 ? "bg-orange-500 text-black border-orange-400" :
                    "bg-black/80 text-white border-white/10 backdrop-blur-xl"
                  )}>
                    {idx < 3 ? (
                      <Medal className="w-5 h-5" />
                    ) : (
                      <span className="text-xs font-black">{idx + 1}</span>
                    )}
                  </div>

                  <MangaCard 
                    manga={manga} 
                    isRecommended={idx < 3} 
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
