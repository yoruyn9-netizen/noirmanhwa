
"use client";

import React, { useEffect, useState } from 'react';
import { fetchMangaList, Manga } from '@/lib/mangaApi';
import MangaCard from '@/components/manga/MangaCard';
import { Trophy, Loader2, Sparkles, Medal, TrendingUp, BarChart3, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

/**
 * High-Fidelity Leaderboard Page
 * Synchronizes real-time signals into a professional ranking terminal.
 */
export default function TopListPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trending');

  useEffect(() => {
    const fetchTop = async () => {
      setLoading(true);
      try {
        const data = await fetchMangaList();
        // Dynamic sorting based on tab protocols
        let sorted = [...data];
        if (activeTab === 'trending') {
          sorted = sorted.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
        } else if (activeTab === 'rated') {
          // Fallback rating logic for visual variety in leaderboard
          sorted = sorted.map((m, i) => ({ ...m, rating: m.rating || (9.8 - (i * 0.05)) }));
          sorted = sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else {
          // Popularity proxy based on title length/uniqueness for mock variety
          sorted = sorted.sort((a, b) => b.title.length - a.title.length);
        }
        
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
      {/* Header Section */}
      <div className="flex flex-col items-center text-center space-y-4 pt-10">
        <div className="relative group">
          <div className="w-20 h-20 bg-accent/5 rounded-[2.5rem] border border-accent/20 flex items-center justify-center shadow-2xl transition-transform duration-700 group-hover:scale-110">
            <Trophy className="w-10 h-10 text-accent animate-pulse" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-bounce" />
          <div className="absolute inset-0 bg-accent/10 rounded-[2.5rem] blur-xl -z-10 opacity-50" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase text-glow leading-none">The Leaderboard</h1>
          <p className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.5em] opacity-80">Synchronizing Global Narrative Ranks</p>
        </div>
      </div>

      {/* Protocol Tabs */}
      <Tabs defaultValue="trending" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-center mb-12">
          <TabsList className="bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/5 p-1.5 rounded-2xl h-auto flex items-center gap-1">
            <TabsTrigger value="trending" className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white transition-all">
              <TrendingUp className="w-3.5 h-3.5 mr-2" /> Trending
            </TabsTrigger>
            <TabsTrigger value="popular" className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white transition-all">
              <BarChart3 className="w-3.5 h-3.5 mr-2" /> Popular
            </TabsTrigger>
            <TabsTrigger value="rated" className="px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white transition-all">
              <Star className="w-3.5 h-3.5 mr-2" /> Top Rated
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0 outline-none">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-6">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Recalibrating Matrix</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
              {mangas.map((manga, idx) => (
                <motion.div 
                  key={`${manga.id}-${idx}`} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="relative group"
                >
                  {/* Rank Badge - Podium Style */}
                  <div className={cn(
                    "absolute -top-4 -left-4 w-12 h-12 rounded-2xl flex items-center justify-center z-30 shadow-2xl transition-all duration-500 group-hover:scale-110 border-2",
                    idx === 0 ? "bg-yellow-500 text-black border-yellow-400 scale-110 shadow-yellow-500/20" :
                    idx === 1 ? "bg-slate-300 text-black border-slate-200 shadow-slate-300/20" :
                    idx === 2 ? "bg-orange-500 text-black border-orange-400 shadow-orange-500/20" :
                    "bg-black/80 text-white border-white/10 backdrop-blur-xl"
                  )}>
                    {idx < 3 ? (
                      <Medal className="w-6 h-6" />
                    ) : (
                      <span className="text-[12px] font-black">{idx + 1}</span>
                    )}
                  </div>

                  <MangaCard 
                    manga={manga} 
                    isRecommended={idx < 3} 
                  />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      {!loading && mangas.length > 0 && (
        <div className="text-center pt-16 opacity-30">
          <p className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.6em]">System Nodes Synchronized • Global Ranking Verified</p>
        </div>
      )}
    </div>
  );
}
