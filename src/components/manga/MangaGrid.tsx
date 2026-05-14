
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import { Manga } from '@/types/manga';
import { useFilterStore } from '@/store/filterStore';
import MangaCard, { MangaCardSkeleton } from './MangaCard';
import { useInView } from 'react-intersection-observer';
import { Loader2, AlertTriangle, RefreshCw, Zap, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MangaGrid() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const { contentType, sortBy, status, selectedGenres, contentRating } = useFilterStore();
  const { ref, inView } = useInView({ threshold: 0.1 });

  const loadData = useCallback(async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(false);
    
    try {
      const nextPage = reset ? 1 : page;
      const data = await mangaApi.fetchMangaList({
        page: nextPage,
        type: contentType,
        sortBy,
        status,
        genres: selectedGenres,
        contentRating
      });
      
      if (!data || data.length === 0) {
        if (reset) setMangas([]);
        setHasMore(false);
      } else {
        setMangas(prev => reset ? data : [...prev, ...data]);
        setPage(nextPage + 1);
        setHasMore(data.length >= 20);
      }
    } catch (err) {
      console.error('[Grid Sync Error]:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [loading, page, contentType, sortBy, status, selectedGenres, contentRating]);

  // Handle filter changes
  useEffect(() => {
    setMangas([]);
    setPage(1);
    setHasMore(true);
    loadData(true);
  }, [contentType, sortBy, status, selectedGenres, contentRating]);

  useEffect(() => {
    if (inView && hasMore && !loading && !error && mangas.length > 0) {
      loadData();
    }
  }, [inView, hasMore, loading, error, mangas.length, loadData]);

  const manhwaCount = mangas.filter(m => m.type === 'manhwa').length;
  const mangaCount = mangas.filter(m => m.type === 'manga').length;
  const manhuaCount = mangas.filter(m => m.type === 'manhua').length;

  return (
    <div className="space-y-10 min-h-[400px]">
      {/* Stats Bar */}
      <div className="flex items-center gap-4 px-4 py-3 bg-[#0a0a0f]/40 border border-white/5 rounded-2xl w-fit">
        <BarChart2 className="w-4 h-4 text-accent" />
        <div className="flex items-center gap-6 text-[8px] font-black uppercase tracking-widest text-neutral-500">
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {manhwaCount} Manhwa</span>
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500" /> {mangaCount} Manga</span>
           <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {manhuaCount} Manhua</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={`${contentType}-${sortBy}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-8 gap-y-16"
        >
          {mangas.map((m, idx) => (
            <MangaCard 
              key={`${m.id}-${m.source}-${idx}`} 
              manga={m} 
            />
          ))}
          
          {loading && Array.from({ length: 12 }).map((_, i) => (
            <MangaCardSkeleton key={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {!loading && !error && mangas.length === 0 && (
        <div className="py-40 text-center space-y-6 glass rounded-[3.5rem] border-dashed border-white/10">
          <Zap className="w-16 h-16 text-accent opacity-20 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight text-white">No Transmissions</h3>
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest max-w-xs mx-auto opacity-60">
              The matrix found no titles matching your current filter protocols.
            </p>
          </div>
          <button 
            onClick={() => loadData(true)}
            className="inline-flex items-center gap-3 px-12 py-5 bg-accent text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-accent/80 transition-all shadow-2xl active:scale-95"
          >
            <RefreshCw className="w-4 h-4" /> Reset Grid
          </button>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="py-20 text-center space-y-6">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto opacity-30" />
          <div className="space-y-2">
            <h3 className="text-xl font-black uppercase tracking-tight">Sync Failure</h3>
            <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Atmospheric interference detected.</p>
          </div>
          <button 
            onClick={() => loadData(true)}
            className="inline-flex items-center gap-3 px-10 py-4 bg-red-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all rounded-2xl shadow-2xl"
          >
            <RefreshCw className="w-4 h-4" /> Retry Uplink
          </button>
        </div>
      )}

      {hasMore && !loading && !error && mangas.length > 0 && (
        <div ref={ref} className="h-40 flex flex-col items-center justify-center space-y-4">
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-ping" />
          <span className="text-[7px] font-black text-neutral-700 uppercase tracking-[0.5em]">Synchronizing Next Wave</span>
        </div>
      )}

      {!hasMore && mangas.length > 0 && (
        <div className="text-center py-20 opacity-30">
          <p className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.8em]">END OF SIGNAL</p>
        </div>
      )}
    </div>
  );
}
