"use client";

import React, { useEffect, useState } from 'react';
import { fetchMangaList, Manga } from '@/lib/mangaApi';
import MangaCard from '@/components/manga/MangaCard';
import { Trophy, Sparkles, Medal, TrendingUp, BarChart3, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeBodyLoader from '@/components/ui/ThreeBodyLoader';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

/**
 * High-Fidelity Leaderboard Terminal
 * Optimized for compact discovery and correct ranking badge stacking.
 */
export default function TopListPage() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('trending');

  useEffect(() => {
    const fetchTop = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMangaList();
        if (!data || data.length === 0) {
          throw new Error('No manga data available.');
        }
        let sorted = [...data];
        if (activeTab === 'trending') {
          sorted = sorted.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
        } else if (activeTab === 'rated') {
          sorted = sorted.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
        } else {
          sorted = sorted.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        }
        setMangas(sorted);
      } catch (err: any) {
        console.error('[Ranking Sync Error]:', err);
        setError(err.message || 'Failed to load leaderboard data');
        setMangas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTop();
  }, [activeTab]);

  return (
    <ErrorBoundary fallback={<div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6"><Trophy className="w-16 h-16 text-red-500" /><p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">A runtime error occurred. Please refresh.</p></div>}>
      <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto pb-32 px-2 relative overflow-x-hidden">
        {/* Dynamic Background Node */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-accent/5 blur-[100px] pointer-events-none -z-10" />

        {/* Optimized Header Section */}
        <header className="flex flex-col items-center text-center space-y-3 pt-2">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative group"
          >
            <div className="w-12 h-12 bg-accent/5 rounded-xl border border-accent/20 flex items-center justify-center shadow-2xl transition-all duration-700 group-hover:border-accent/40 group-hover:scale-105">
              <Trophy className="w-6 h-6 text-accent animate-pulse" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500 animate-bounce" />
            <div className="absolute inset-0 bg-accent/10 rounded-xl blur-xl -z-10 opacity-30" />
          </motion.div>
          
          <div className="space-y-1">
            <h1 className="text-xl font-black tracking-tighter uppercase text-glow leading-none">The Leaderboard</h1>
            <p className="text-[7px] font-black text-neutral-600 uppercase tracking-0.4em opacity-60">Synchronizing Global Narrative Ranks</p>
          </div>
        </header>

        {/* Protocol Tabs */}
        <Tabs defaultValue="trending" className="w-full" onValueChange={setActiveTab}>
          <div className="flex justify-center mb-8 overflow-x-auto hide-scrollbar pb-2">
            <TabsList className="bg-[#0a0a0f]/40 backdrop-blur-xl border border-white/5 p-1 rounded-2xl h-auto flex items-center gap-1">
              <TabsTrigger value="trending" className="px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white transition-all">
                <TrendingUp className="w-3 h-3 mr-2" /> Trending
              </TabsTrigger>
              <TabsTrigger value="popular" className="px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white transition-all">
                <BarChart3 className="w-3 h-3 mr-2" /> Popular
              </TabsTrigger>
              <TabsTrigger value="rated" className="px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest data-[state=active]:bg-accent data-[state=active]:text-white transition-all">
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
                    <ThreeBodyLoader />
                    <div className="absolute inset-0 blur-2xl bg-accent/20 animate-pulse" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">LOADING</p>
                </motion.div>
              ) : error ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-40 space-y-8"
                >
                  <Trophy className="w-16 h-16 text-red-500 opacity-30" />
                  <div className="text-center space-y-3">
                    <h3 className="text-lg font-black uppercase tracking-tighter text-red-500">Signal Lost</h3>
                    <p className="text-[11px] text-neutral-400 font-medium max-w-xl">{error}</p>
                  </div>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-accent text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all"
                  >
                    Retry Sync
                  </button>
                </motion.div>
              ) : mangas.length === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-40 space-y-6"
                >
                  <Trophy className="w-16 h-16 text-accent opacity-30" />
                  <p className="text-[11px] text-neutral-400 font-medium">No manga available</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="grid"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-2 gap-y-10 pt-6"
                >
                  {mangas.map((manga, idx) => (
                    <motion.div 
                      key={`${activeTab}-${manga.id}-${idx}`} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.02, type: "spring", stiffness: 120, damping: 20 }}
                      className="relative z-0"
                    >
                      <div className={cn(
                        "absolute -top-3 -left-1 w-8 h-8 rounded-xl flex items-center justify-center z-[100] shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all duration-500 border-2",
                        idx === 0 ? "bg-yellow-500 text-black border-white scale-110 shadow-yellow-500/40" :
                        idx === 1 ? "bg-slate-300 text-black border-white shadow-slate-300/40" :
                        idx === 2 ? "bg-orange-500 text-black border-white shadow-orange-500/40" :
                        "bg-black/95 text-white border-white/10 backdrop-blur-xl"
                      )}>
                        {idx < 3 ? (
                          <Medal className="w-5 h-5" />
                        ) : (
                          <span className="text-[9px] font-black">{idx + 1}</span>
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
    </ErrorBoundary>
  );
}
