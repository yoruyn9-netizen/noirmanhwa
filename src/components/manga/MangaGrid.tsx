
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import { Manga } from '@/types/manga';
import { useMangaStore } from '@/store/mangaStore';
import MangaCard, { MangaCardSkeleton } from './MangaCard';
import { useInView } from 'react-intersection-observer';
import { Loader2, AlertTriangle, RefreshCw, SearchX } from 'lucide-react';
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
      
      console.log(`🌀 Initializing sequence scan... Page: ${nextPage}, Source: ${preferredSource}`);
      const data = await mangaApi.fetchMangaList(nextPage, source);
      
      if (!data || data.length === 0) {
        if (reset) {
          setMangas([]);
        }
        setHasMore(false);
      } else {
        setMangas(prev => reset ? data : [...prev, ...data]);
        setPage(nextPage + 1);
        setHasMore(true);
      }
    } catch (err) {
      console.error('[Grid Sync Error]:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [loading, page, preferredSource]);

  useEffect(() => {
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
        <div className="py-32 text-center space-y-6">
          <h3 className="text-sm font-black uppercase tracking-tight text-neutral-400">No Signal Detected</h3>
          <button 
            onClick={() => loadData(true)}
            className="inline-flex items-center gap-2 px-10 py-3 bg-accent text-white font-black rounded-xl text-[8px] uppercase tracking-widest hover:bg-accent/80 transition-all shadow-xl active:scale-95"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="py-20 text-center space-y-6">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto opacity-40" />
          <div className="space-y-2">
            <h3 className="text-base font-black uppercase tracking-tight">Sync Interrupted</h3>
            <p className="text-neutral-500 text-[10px] uppercase tracking-widest">Neural connection to remote nodes failed.</p>
          </div>
          <button 
            onClick={() => loadData(true)}
            className="inline-flex items-center gap-3 px-8 py-3 bg-red-500 text-white font-black text-[9px] uppercase tracking-widest hover:bg-red-600 transition-all rounded-xl shadow-xl"
          >
            <RefreshCw className="w-3 h-3" /> Re-establish Link
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
          End of Stream • Matrix Fully Scanned
        </p>
      )}
    </div>
  );
}
