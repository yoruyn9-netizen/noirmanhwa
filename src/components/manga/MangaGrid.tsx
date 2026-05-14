
"use client";

import React, { useState, useEffect } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import { Manga, MangaSource } from '@/types/manga';
import { useMangaStore } from '@/store/mangaStore';
import MangaCard, { MangaCardSkeleton } from './MangaCard';
import { useInView } from 'react-intersection-observer';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MangaGrid() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const { preferredSource } = useMangaStore();
  const { ref, inView } = useInView({ threshold: 0.1 });

  const loadData = async (reset = false) => {
    if (loading) return;
    setLoading(true);
    setError(false);
    
    try {
      const nextPage = reset ? 1 : page;
      const source = preferredSource === 'all' ? undefined : preferredSource;
      const data = await mangaApi.fetchMangaList(nextPage, source);
      
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setMangas(prev => reset ? data : [...prev, ...data]);
        setPage(nextPage + 1);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, [preferredSource]);

  useEffect(() => {
    if (inView && hasMore && !loading && !error) {
      loadData();
    }
  }, [inView]);

  return (
    <div className="space-y-12">
      <AnimatePresence mode="wait">
        <motion.div 
          key={preferredSource}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-12"
        >
          {mangas.map((m, idx) => (
            <MangaCard key={`${m.id}-${idx}`} manga={m} isRecommended={idx < 5 && page === 2} />
          ))}
          
          {loading && Array.from({ length: 10 }).map((_, i) => (
            <MangaCardSkeleton key={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      {error && (
        <div className="py-20 text-center space-y-6 glass rounded-[3rem] border-dashed border-red-500/20">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto opacity-40" />
          <div className="space-y-2">
            <h3 className="text-base font-black uppercase tracking-tight">Signal Interrupted</h3>
            <p className="text-neutral-500 text-[10px] uppercase tracking-widest">Unable to synchronize with remote nodes.</p>
          </div>
          <button 
            onClick={() => loadData()}
            className="inline-flex items-center gap-3 px-8 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 font-black text-[9px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
          >
            <RefreshCw className="w-3 h-3" /> Re-scan Matrix
          </button>
        </div>
      )}

      {hasMore && !loading && !error && (
        <div ref={ref} className="h-20 flex items-center justify-center">
          <div className="w-1 h-1 bg-accent rounded-full animate-ping" />
        </div>
      )}

      {!hasMore && mangas.length > 0 && (
        <p className="text-center text-[8px] font-black text-neutral-700 uppercase tracking-[0.5em] py-10">
          End of Signal Stream • Terminal Reached
        </p>
      )}
    </div>
  );
}
