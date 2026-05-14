"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import { Manga } from '@/types/manga';
import { useFilterStore } from '@/store/filterStore';
import MangaCard, { MangaCardSkeleton } from './MangaCard';
import { AlertTriangle, RefreshCw, Zap, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ITEMS_PER_PAGE = 20;

export default function MangaGrid() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [allLoadedMangas, setAllLoadedMangas] = useState<Manga[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  const { contentType, sortBy, status, selectedGenres, contentRating } = useFilterStore();

  const loadData = useCallback(async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(false);
    
    try {
      const targetPage = reset ? 1 : page;
      const data = await mangaApi.fetchMangaList({
        page: targetPage,
        type: contentType,
        sortBy,
        status,
        genres: selectedGenres,
        contentRating
      });
      
      if (!data || data.length === 0) {
        if (reset) {
          setMangas([]);
          setAllLoadedMangas([]);
        }
        setHasMore(false);
      } else {
        if (reset) {
          setMangas(data);
          setAllLoadedMangas(data);
          setPage(1);
        } else {
          setAllLoadedMangas(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const uniqueNew = data.filter(m => !existingIds.has(m.id));
            return [...prev, ...uniqueNew];
          });
          setPage(targetPage);
        }
        setHasMore(data.length >= ITEMS_PER_PAGE);
      }
    } catch (err) {
      console.error('[Grid Sync Error]:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [loading, page, contentType, sortBy, status, selectedGenres, contentRating]);

  // Initial load or filter change
  useEffect(() => {
    loadData(true);
  }, [contentType, sortBy, status, selectedGenres, contentRating]);

  const totalPages = Math.ceil(allLoadedMangas.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentItems = allLoadedMangas.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setPage(p);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
    loadData(false);
  };

  const manhwaCount = allLoadedMangas.filter(m => m.type === 'manhwa').length;
  const mangaCount = allLoadedMangas.filter(m => m.type === 'manga').length;

  return (
    <div className="space-y-8 min-h-[600px] overflow-x-hidden w-full relative">
      <div className="flex items-center justify-between px-3 py-2 bg-[#0a0a0f]/40 border border-white/5 rounded-xl">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-3.5 h-3.5 text-accent" />
          <div className="flex items-center gap-4 text-[7px] font-black uppercase tracking-widest text-neutral-500">
             <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-indigo-500" /> {manhwaCount} Manhwa</span>
             <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-red-500" /> {mangaCount} Manga</span>
          </div>
        </div>
        <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest">
          {allLoadedMangas.length} Total Nodes
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={`${contentType}-${sortBy}-${page}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="manga-grid"
        >
          {currentItems.map((m, idx) => (
            <MangaCard 
              key={`${m.id}-${m.source}-${idx}`} 
              manga={m} 
            />
          ))}
          
          {loading && currentItems.length === 0 && Array.from({ length: 12 }).map((_, i) => (
            <MangaCardSkeleton key={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      {!loading && !error && currentItems.length === 0 && (
        <div className="py-32 text-center space-y-4 glass rounded-[2.5rem] border-dashed border-white/10 mx-2">
          <Zap className="w-12 h-12 text-accent opacity-20 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-tight text-white">No Transmissions</h3>
            <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest max-w-[180px] mx-auto">
              No signal detected in this frequency.
            </p>
          </div>
          <button 
            onClick={() => loadData(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent text-white font-black rounded-xl text-[8px] uppercase tracking-widest hover:bg-accent/80 transition-all shadow-xl active:scale-95"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {allLoadedMangas.length > 0 && (
        <div className="space-y-10">
          <div className="pagination-controls">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="pagination-btn"
            >
              <ChevronLeft className="w-4 h-4 mr-1 inline" /> Prev
            </button>

            <div className="page-numbers">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && page > 3) {
                  pageNum = page - 2 + i;
                }
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={cn("page-number", page === pageNum && "active")}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages && !hasMore}
              className="pagination-btn"
            >
              Next <ChevronRight className="w-4 h-4 ml-1 inline" />
            </button>
          </div>

          <div className="load-more-section">
            <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-6">
              Visualizing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, allLoadedMangas.length)} of {allLoadedMangas.length} titles
            </p>
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="load-more-btn"
              >
                {loading ? 'Synchronizing...' : 'Load 20 More Titles'}
              </button>
            )}
          </div>

          <div className="grid-stats">
            <span className="stat-item">📊 Protocol Page {page} of {Math.max(1, totalPages)}</span>
            <span className="stat-item">📚 {allLoadedMangas.length} Loaded Nodes</span>
          </div>
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
    </div>
  );
}