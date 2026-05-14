
"use client";

import React, { useEffect, useState, use } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import { MangaSource } from '@/types/manga';
import { useSearchParams, useRouter } from 'next/navigation';
import ReaderView from '@/components/manga/ReaderView';
import { Loader2, AlertTriangle } from 'lucide-react';

/**
 * Unified Reader Page (Single Segment)
 * Handles /reader/[chapterId] legacy links by synchronizing with the new Reader protocol.
 */
export default function SingleChapterReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: chapterId } = use(params);
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
        const imgs = await mangaApi.fetchChapterImages(chapterId, source);
        if (imgs.length === 0) throw new Error('Empty node');
        setImages(imgs);
      } catch (err) {
        console.error('[Reader Error]:', err);
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
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Syncing Matrix</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-[#020205] flex flex-col items-center justify-center p-10 text-center space-y-8 z-[200]">
        <AlertTriangle className="w-16 h-16 text-red-500 opacity-20" />
        <h2 className="text-xl font-black uppercase tracking-tighter text-white">Transmission Interrupted</h2>
        <button onClick={() => window.location.reload()} className="px-12 py-5 bg-white text-black rounded-2xl font-black text-[9px] uppercase tracking-widest">Re-establish Link</button>
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
