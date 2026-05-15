
"use client";

import React, { useEffect, useState } from 'react';
import { fetchMangaList, Manga } from '@/lib/mangaApi';
import MangaCard from '@/components/manga/MangaCard';
import { Trophy, Loader2, Sparkles, Medal } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

export default function TopListPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trending');

  useEffect(() => {
    const fetchTop = async () => {
      setLoading(true);
      try {
        const data = await fetchMangaList();
        // Visual sort simulation for Ranking UI
        const sorted = [...data].sort((a, b) => b.title.length - a.title.length);
        setMangas(sorted);
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 p-1">
        {loading ? (
           Array.from({ length: 8 }).map((_, i) => (
             <div key={i} className="aspect-[2/3] bg-white/5 rounded-2xl animate-pulse" />
           ))
        ) : (
          mangas.map((manga, idx) => (
            <div key={manga.id} className="relative group animate-in fade-in zoom-in-95" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className={cn(
                "absolute -top-3 -left-3 w-10 h-10 rounded-2xl flex items-center justify-center z-20 shadow-2xl transition-all duration-500 group-hover:scale-110 border",
                idx === 0 ? "bg-yellow-500 text-black border-yellow-400" :
                idx === 1 ? "bg-slate-300 text-black border-slate-200" :
                idx === 2 ? "bg-orange-500 text-black border-orange-400" :
                "bg-black/80 text-white border-white/10 backdrop-blur-xl"
              )}>
                {idx < 3 ? <Medal className="w-5 h-5" /> : <span className="text-xs font-black">{idx + 1}</span>}
              </div>
              <MangaCard manga={manga} isRecommended={idx < 3} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
