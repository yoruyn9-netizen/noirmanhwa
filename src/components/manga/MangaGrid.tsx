"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import { Manga } from '@/types/manga';
import MangaCard, { MangaCardSkeleton } from './MangaCard';
import { RefreshCw, Zap, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Noir Discovery Grid - PURE REAL DATA VERSION
 * Strictly shows real API results or an explicit error state.
 */
export default function MangaGrid() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await mangaApi.fetchMangaList({ page: 1 });
      setMangas(data);
    } catch (err) {
      console.error('⚠️ [Grid]: Neural link synchronization failure.');
      setError(err instanceof Error ? err.message : 'All discovery nodes offline');
      setMangas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <MangaCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in slide-in-from-bottom-4">
        <div className="w-20 h-20 bg-red-500/10 rounded-[2.5rem] border border-red-500/20 flex items-center justify-center mb-8 shadow-2xl shadow-red-500/5">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-2">Neural Link Failure</h3>
        <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest max-w-[280px] mb-10 leading-relaxed">
          {error.includes('503') ? 'Primary discovery nodes are under heavy load.' : error}
        </p>
        <button
          onClick={loadData}
          className="px-12 py-5 bg-white text-black rounded-2xl font-black text-[9px] uppercase tracking-[0.3em] hover:bg-accent hover:text-white transition-all shadow-2xl active:scale-95 flex items-center gap-3"
        >
          <RefreshCw className="w-4 h-4" /> RECONNECT UPLINK
        </button>
      </div>
    );
  }

  if (mangas.length === 0) {
    return (
      <div className="py-32 text-center space-y-6">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-dashed border-white/10">
          <Zap className="w-8 h-8 text-neutral-800" />
        </div>
        <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">No active signals found in this sector</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4"
    >
      {mangas.map((m, idx) => (
        <MangaCard 
          key={`${m.source}-${m.id}-${idx}`} 
          manga={m} 
        />
      ))}
    </motion.div>
  );
}
