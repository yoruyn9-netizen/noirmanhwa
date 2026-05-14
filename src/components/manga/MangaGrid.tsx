
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import { Manga } from '@/types/manga';
import MangaCard, { MangaCardSkeleton } from './MangaCard';
import { AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MangaGrid() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await mangaApi.fetchMangaList({ page: 1 });
      if (data && data.length > 0) {
        setMangas(data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('[Grid Sync Error]:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (error) {
    return (
      <div className="py-32 text-center space-y-8 bg-red-600/5 border border-red-600/20 rounded-[3rem] mx-4 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-red-600/10 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black uppercase tracking-tight text-white">All Sources Offline</h3>
          <p className="text-neutral-500 text-[10px] uppercase tracking-widest max-w-[280px] mx-auto leading-relaxed">
            Asura, Flame, and Komiku nodes are currently unreachable. Retrying neural link...
          </p>
        </div>
        <button 
          onClick={loadData}
          className="px-12 py-4 bg-white text-black rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95"
        >
          <RefreshCw className="w-4 h-4 mr-2 inline" /> Retry Uplink
        </button>
      </div>
    );
  }

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
            <div className="col-span-full py-32 text-center space-y-4">
              <Zap className="w-12 h-12 text-accent opacity-20 mx-auto" />
              <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">No Signals Detected</p>
            </div>
          ) : (
            mangas.map((m, idx) => (
              <MangaCard 
                key={`${m.id}-${idx}`} 
                manga={m} 
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
