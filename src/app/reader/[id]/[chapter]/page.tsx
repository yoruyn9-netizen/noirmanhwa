
"use client";

import React, { useEffect, useState, use } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import { MangaSource } from '@/types/manga';
import { useSearchParams } from 'next/navigation';
import ReaderView from '@/components/manga/ReaderView';
import { Loader2, AlertTriangle } from 'lucide-react';

/**
 * High-Fidelity Reader Page (Nested Segments)
 * Handles /reader/[id]/[chapter] where id is MangaID and chapter is ChapterID.
 * Consistently uses 'id' for the first dynamic segment to match unified reader protocol.
 */
export default function ReaderDynamicPage({ params }: { params: Promise<{ id: string; chapter: string }> }) {
  const { id: mangaId, chapter: chapterId } = use(params);
  const searchParams = useSearchParams();
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
        const [imgs, detail] = await Promise.all([
          mangaApi.fetchChapterImages(chapterId, source),
          mangaApi.fetchMangaDetail(mangaId, source)
        ]);
        
        if (imgs.length === 0) throw new Error('Empty node signal');
        
        setImages(imgs);
        if (detail) setMangaTitle(detail.title);
      } catch (err) {
        console.error('[Reader Detail Failure]:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadReader();
  }, [mangaId, chapterId, source]);

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
          onClick={() => window.location.reload()}
          className="px-12 py-5 bg-white text-black rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-accent hover:text-white transition-all"
        >
          RE-ESTABLISH LINK
        </button>
      </div>
    );
  }

  return (
    <ReaderView 
      images={images}
      mangaTitle={mangaTitle}
      chapterNum={chapterId.substring(0, 4)}
      source={source}
    />
  );
}
