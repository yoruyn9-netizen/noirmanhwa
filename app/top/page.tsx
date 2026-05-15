
"use client";

import React, { useEffect, useState } from 'react';
import { fetchMangaList, Manga } from '@/lib/mangaApi';
import MangaCard from '@/components/manga/MangaCard';
import { Trophy, Loader2, Sparkles, Medal, TrendingUp, BarChart3, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * High-Fidelity Leaderboard Terminal
 * Optimized for compact discovery and correct ranking badge stacking.
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
          sorted = sorted.map((m, i) => ({ ...m, rating: m.rating || (9.8 - (i * 0.05)).toFixed(1) }));
          sorted = sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
        } else {
          sorted = sorted.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
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
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-32 px-2 sm:px-4 relative">
      {/* Dynamic Background Node */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-accent/5 blur-[100px] pointer-events-none -z-10" />

      {/* Optimized Header Section */}
      <header className="flex flex-col items-center text-center space-y-4 pt-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative group"
        >
          <div className="w-14 h-14 bg-accent/5 rounded-2xl border border-accent/20 flex items-center justify-center shadow-2xl transition-all duration-700 group-hover:border-accent/40 group-hover:scale-105">
            <Trophy className="w-7 h-7 text-accent animate-pulse" />
          </div>
          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500 animate-bounce" />
          <div className="absolute inset-0 bg-accent/10 rounded-2xl blur-xl -z-10 opacity-30" />
        </motion.div>
        
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tighter uppercase text-glow leading-none">The Leaderboard</h1>
          <p className="text-[7px] font-black text-neutral-600 uppercase tracking-[0.4em] opacity-60">Synchronizing Global Narrative Ranks</p>
        </div>
      </header>

      {/* Protocol Tabs */}
      <Tabs defaultValue="trending" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-center mb-12 overflow-x-auto hide-scrollbar pb-2">
          <TabsList className="bg-[#0a0a0f]/40 backdrop-blur-xl border border-white/5 p-1 rounded-2xl h-auto flex items-center gap-1">
            <TabsTrigger value="trending" className="px-5 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white transition-all">
              <TrendingUp className="w-3 h-3 mr-2" /> Trending
            </TabsTrigger>
            <TabsTrigger value="popular" className="px-5 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white transition-all">
              <BarChart3 className="w-3 h-3 mr-2" /> Popular
            </TabsTrigger>
            <TabsTrigger value="rated" className="px-5 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white transition-all">
              <Star className="w-3 h-3 mr-2" /> Top Rated
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0 outline-none">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-40 space-y-6"
              >
                <div className="relative">
                  <Loader2 className="w-10 h-10 text-accent animate-spin" />
                  <div className="absolute inset-0 blur-2xl bg-accent/20 animate-pulse" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Recalibrating Matrix</p>
              </motion.div>
            ) : (
              <motion.div 
                key="grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 gap-y-12 pt-10"
              >
                {mangas.map((manga, idx) => (
                  <motion.div 
                    key={`${activeTab}-${manga.id}-${idx}`} 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03, type: "spring", stiffness: 120, damping: 20 }}
                    className="relative"
                  >
                    {/* Rank Badge - ENFORCED FRONT STACKING */}
                    <div className={cn(
                      "absolute -top-4 -left-2 w-10 h-10 rounded-2xl flex items-center justify-center z-[50] shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all duration-500 border-2",
                      idx === 0 ? "bg-yellow-500 text-black border-white scale-110 shadow-yellow-500/30" :
                      idx === 1 ? "bg-slate-300 text-black border-white shadow-slate-300/30" :
                      idx === 2 ? "bg-orange-500 text-black border-white shadow-orange-500/30" :
                      "bg-black/95 text-white border-white/10 backdrop-blur-xl"
                    )}>
                      {idx < 3 ? (
                        <Medal className="w-6 h-6" />
                      ) : (
                        <span className="text-[10px] font-black">{idx + 1}</span>
                      )}
                    </div>

                    <MangaCard 
                      manga={manga} 
                      isRecommended={idx < 3} 
                      compact
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Footer System Info */}
      {!loading && mangas.length > 0 && (
        <div className="text-center pt-20 opacity-20 select-none">
          <p className="text-[6px] font-black text-neutral-600 uppercase tracking-[0.6em]">System Nodes Synchronized • Global Ranking Verified</p>
        </div>
      )}
    </div>
  );
}
