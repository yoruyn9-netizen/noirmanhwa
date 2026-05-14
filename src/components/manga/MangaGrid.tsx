"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import { Manga } from '@/types/manga';
import MangaCard, { MangaCardSkeleton } from './MangaCard';
import { RefreshCw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Noir Discovery Grid
 * Automatically switches to fallback signal if primary uplink fails.
 */
export default function MangaGrid() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // fetchMangaList now handles proxy and fallback internally
      const data = await mangaApi.fetchMangaList({ page: 1 });
      setMangas(data);
    } catch (err) {
      console.warn('⚠️ [Grid]: Sync interruption, activating secondary signal.');
      setMangas([]); // Will trigger empty state if even fallback fails (unlikely)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-8 min-h-[600px] w-full relative">
      <AnimatePresence mode="wait">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-3"
        >
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <MangaCardSkeleton key={i} />
            ))
          ) : mangas.length === 0 ? (
            <div className="col-span-full py-32 text-center space-y-6">
              <div className="w-16 h-16 bg-accent/5 rounded-full flex items-center justify-center mx-auto border border-dashed border-accent/20">
                <Zap className="w-8 h-8 text-accent/20" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Total Signal Loss in Sector</p>
                <button 
                  onClick={loadData}
                  className="flex items-center gap-2 mx-auto px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase text-white hover:bg-white/10"
                >
                  <RefreshCw className="w-3 h-3" /> Reconnect Uplink
                </button>
              </div>
            </div>
          ) : (
            mangas.map((m, idx) => (
              <MangaCard 
                key={`${m.source}-${m.id}-${idx}`} 
                manga={m} 
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
