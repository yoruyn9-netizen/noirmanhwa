
"use client";

import React, { useEffect, useState } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import { Manga } from '@/types/manga';
import MangaCard from '@/components/manga/MangaCard';
import { Trophy, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TopListPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trending');

  useEffect(() => {
    const fetchTop = async () => {
      setLoading(true);
      try {
        // Map UI tabs to API content types
        const typeMap: Record<string, any> = {
          'trending': 'all',
          'popular': 'manhwa', // Manhwa prioritized as popular
          'rated': 'manga'
        };

        const data = await mangaApi.fetchMangaList({
          page: 1,
          type: typeMap[activeTab] || 'all',
          sortBy: activeTab === 'rated' ? 'rating' : 'popular'
        });
        setMangas(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTop();
  }, [activeTab]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-5xl mx-auto pb-32">
      <div className="flex flex-col items-center text-center space-y-4 pt-10">
        <div className="w-16 h-16 bg-accent/5 rounded-3xl border border-accent/20 flex items-center justify-center shadow-2xl shadow-accent/10">
          <Trophy className="w-8 h-8 text-accent" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-3xl font-black tracking-tighter uppercase text-glow">Top Rankings</h1>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.4em] opacity-40">Most Popular & Highest Rated Titles</p>
        </div>
      </div>

      <Tabs defaultValue="trending" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-center mb-10">
          <TabsList className="bg-[#0a0a0f]/60 border border-white/5 p-1 rounded-2xl h-auto">
            <TabsTrigger value="trending" className="px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white transition-all">
              Trending
            </TabsTrigger>
            <TabsTrigger value="popular" className="px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white transition-all">
              Popular Manhwa
            </TabsTrigger>
            <TabsTrigger value="rated" className="px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white transition-all">
              Top Rated Manga
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader2 className="w-8 h-8 text-accent animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Syncing Rankings...</p>
            </div>
          ) : (
            <div className="manga-grid">
              {mangas.map((manga, idx) => (
                <div key={manga.id} className="relative group">
                   <div className="absolute -top-3 -left-3 w-8 h-8 bg-black border border-white/10 rounded-full flex items-center justify-center z-20 shadow-xl group-hover:border-accent transition-colors">
                     <span className="text-[10px] font-black text-white">{idx + 1}</span>
                   </div>
                   <MangaCard manga={manga} isRecommended={idx < 3} />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
