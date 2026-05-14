"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import { Manga } from '@/types/manga';
import { useFilterStore } from '@/store/filterStore';
import MangaCard, { MangaCardSkeleton } from './MangaCard';
import { useInView } from 'react-intersection-observer';
import { AlertTriangle, RefreshCw, Zap, BarChart2 } from 'lucide-react';
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
        setHasMore(data.length >= 24);
      }
    } catch (err) {
      console.error('[Grid Sync Error]:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [loading, page, contentType, sortBy, status, selectedGenres, contentRating]);

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

  return (
    <div className="space-y-8 min-h-[400px] overflow-x-hidden w-full relative">
      <div className="flex items-center gap-3 px-3 py-2 bg-[#0a0a0f]/40 border border-white/5 rounded-xl w-fit">
        <BarChart2 className="w-3.5 h-3.5 text-accent" />
        <div className="flex items-center gap-4 text-[7px] font-black uppercase tracking-widest text-neutral-500">
           <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-indigo-500" /> {manhwaCount} Manhwa</span>
           <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-red-500" /> {mangaCount} Manga</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={`${contentType}-${sortBy}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="manga-grid"
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

      {!loading && !error && mangas.length === 0 && (
        <div className="py-32 text-center space-y-4 glass rounded-[2.5rem] border-dashed border-white/10 mx-2">
          <Zap className="w-12 h-12 text-accent opacity-20 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-tight text-white">No Transmissions</h3>
            <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest max-w-[180px] mx-auto">
              Empty results for current filter protocols.
            </p>
          </div>
          <button 
            onClick={() => loadData(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent text-white font-black rounded-xl text-[8px] uppercase tracking-widest hover:bg-accent/80 transition-all shadow-xl active:scale-95"
          >
            <RefreshCw className="w-3 h-3" /> Reset Matrix
          </button>
        </div>
      )}

      {error && (
        <div className="py-20 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto opacity-30" />
          <h3 className="text-sm font-black uppercase tracking-tight">Sync Failure</h3>
          <button 
            onClick={() => loadData(true)}
            className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 text-white font-black text-[8px] uppercase tracking-widest hover:bg-red-700 transition-all rounded-xl"
          >
            <RefreshCw className="w-3 h-3" /> Retry Uplink
          </button>
        </div>
      )}

      {hasMore && !loading && !error && mangas.length > 0 && (
        <div ref={ref} className="h-40 flex flex-col items-center justify-center space-y-3">
          <div className="w-1 h-1 bg-accent rounded-full animate-ping" />
          <span className="text-[7px] font-black text-neutral-700 uppercase tracking-[0.4em]">Syncing Next Wave</span>
        </div>
      )}
    </div>
  );
}
