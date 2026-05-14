
"use client";

import React, { useEffect, useState, use } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import { MangaSource } from '@/types/manga';
import { useSearchParams, useRouter } from 'next/navigation';
import ReaderView from '@/components/manga/ReaderView';
import { Loader2, AlertTriangle } from 'lucide-react';

/**
 * Unified Reader Page (Single Segment Protocol)
 * Handles /reader/[id] links by synchronizing with the Noir Reader protocol.
 * Consolidates 'chapterId' and 'id' slugs to resolve routing conflicts.
 */
export default function SingleChapterReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: chapterId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const source = (searchParams.get('source') as MangaSource) || 'mangadex';
  
  const [images, setImages] = useState<string[]>([]);
  const [mangaTitle, setMangaTitle] = useState('Active Node');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadReader = async () => {
      setLoading(true);
      setError(false);
      try {
        // Attempt to fetch chapter images
        const imgs = await mangaApi.fetchChapterImages(chapterId, source);
        if (!imgs || imgs.length === 0) throw new Error('Empty node signal');
        setImages(imgs);
        
        // UX: We don't have the mangaId here directly for some sources, 
        // so we use a placeholder or attempt title fetch if source allows.
      } catch (err) {
        console.error('[Reader Node Failure]:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadReader();
  }, [chapterId, source]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#020205] flex flex-col items-center justify-center space-y-6 z-[200]">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-accent animate-spin" />
          <div className="absolute inset-0 blur-3xl bg-accent/30 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-sm font-black uppercase tracking-[0.5em] text-white">Syncing Matrix</h2>
          <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Calibrating sensory input streams</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-[#020205] flex flex-col items-center justify-center p-10 text-center space-y-8 z-[200]">
        <div className="w-20 h-20 bg-red-500/10 rounded-[2.5rem] border border-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase tracking-tighter text-white">Transmission Interrupted</h2>
          <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest max-w-xs mx-auto">
            The remote node failed to return a valid visual stream. Check your neural link status.
          </p>
        </div>
        <button 
          onClick={() => router.back()}
          className="px-12 py-5 bg-white text-black rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-accent hover:text-white transition-all"
        >
          RETURN TO GRID
        </button>
      </div>
    );
  }

  return (
    <ReaderView 
      images={images}
      mangaTitle={mangaTitle}
      chapterNum="?"
      source={source}
    />
  );
}
