
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import { Manga } from '@/types/manga';
import { useMangaStore } from '@/store/mangaStore';
import MangaCard, { MangaCardSkeleton } from './MangaCard';
import { useInView } from 'react-intersection-observer';
import { Loader2, AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MangaGrid() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const { preferredSource } = useMangaStore();
  const { ref, inView } = useInView({ threshold: 0.1 });

  const loadData = useCallback(async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(false);
    
    try {
      const nextPage = reset ? 1 : page;
      const source = preferredSource === 'all' ? undefined : preferredSource;
      
      const data = await mangaApi.fetchMangaList(nextPage, source);
      
      if (!data || data.length === 0) {
        if (reset) {
          setMangas([]);
        }
        setHasMore(false);
      } else {
        setMangas(prev => reset ? data : [...prev, ...data]);
        setPage(nextPage + 1);
        setHasMore(data.length >= 20); // Assume more if we hit limit
      }
    } catch (err) {
      console.error('[Grid Sync Error]:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [loading, page, preferredSource]);

  // Handle source switch
  useEffect(() => {
    setMangas([]);
    setPage(1);
    setHasMore(true);
    loadData(true);
  }, [preferredSource]);

  useEffect(() => {
    if (inView && hasMore && !loading && !error && mangas.length > 0) {
      loadData();
    }
  }, [inView, hasMore, loading, error, mangas.length, loadData]);

  return (
    <div className="space-y-12 min-h-[400px]">
      <AnimatePresence mode="wait">
        <motion.div 
          key={preferredSource}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12"
        >
          {mangas.map((m, idx) => (
            <MangaCard 
              key={`${m.id}-${m.source}-${idx}`} 
              manga={m} 
              isRecommended={idx < 4 && page === 2 && preferredSource === 'all'} 
            />
          ))}
          
          {loading && Array.from({ length: 10 }).map((_, i) => (
            <MangaCardSkeleton key={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {!loading && !error && mangas.length === 0 && (
        <div className="py-32 text-center space-y-6 glass rounded-[3rem] border-dashed">
          <Zap className="w-12 h-12 text-accent opacity-20 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-base font-black uppercase tracking-tight">No signals detected</h3>
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">The matrix is silent on this frequency.</p>
          </div>
          <button 
            onClick={() => loadData(true)}
            className="inline-flex items-center gap-2 px-10 py-3 bg-accent text-white font-black rounded-xl text-[8px] uppercase tracking-widest hover:bg-accent/80 transition-all shadow-xl active:scale-95"
          >
            <RefreshCw className="w-3 h-3" /> Refresh Grid
          </button>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="py-20 text-center space-y-6">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto opacity-40" />
          <div className="space-y-2">
            <h3 className="text-base font-black uppercase tracking-tight">Sync Failed</h3>
            <p className="text-neutral-500 text-[10px] uppercase tracking-widest">Network connectivity issues detected.</p>
          </div>
          <button 
            onClick={() => loadData(true)}
            className="inline-flex items-center gap-3 px-8 py-3 bg-red-500 text-white font-black text-[9px] uppercase tracking-widest hover:bg-red-600 transition-all rounded-xl shadow-xl"
          >
            <RefreshCw className="w-3 h-3" /> Retry Sync
          </button>
        </div>
      )}

      {hasMore && !loading && !error && mangas.length > 0 && (
        <div ref={ref} className="h-20 flex items-center justify-center">
          <div className="w-1 h-1 bg-accent rounded-full animate-ping" />
        </div>
      )}

      {!hasMore && mangas.length > 0 && (
        <p className="text-center text-[8px] font-black text-neutral-700 uppercase tracking-[0.5em] py-10">
          End of Visual Signal
        </p>
      )}
    </div>
  );
}
