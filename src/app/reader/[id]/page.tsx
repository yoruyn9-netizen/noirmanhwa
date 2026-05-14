
"use client";

import React, { useEffect, useState, use } from 'react';
import { mangaApi } from '@/lib/api';
import ReaderView from '@/components/ReaderView';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Unified Reader Page Node
 * Consolidated to 'id' slug name consistently for the Manga identity.
 * This route handles single chapter reading protocol.
 */
export default function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: chapterId } = use(params);
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadChapter = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await mangaApi.getAtHomeServer(chapterId);
        if (!res || res.error) throw new Error("Server unreachable");
        
        setData(res);
      } catch (err) {
        console.error('[Reader Error]:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadChapter();
  }, [chapterId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#020205] flex flex-col items-center justify-center space-y-6 z-[200]">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
          <div className="absolute inset-0 blur-3xl bg-accent/30 animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Loading Chapter</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-[#020205] flex flex-col items-center justify-center p-10 text-center space-y-8 z-[200]">
        <AlertTriangle className="w-16 h-16 text-red-500 opacity-20" />
        <h2 className="text-xl font-black uppercase tracking-tighter text-white">Failed to Load</h2>
        <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest max-w-xs mx-auto">
          The reader could not establish a connection to the content server.
        </p>
        <button onClick={() => router.back()} className="px-10 py-4 bg-white text-black rounded-2xl font-black text-[9px] uppercase tracking-widest">Go Back</button>
      </div>
    );
  }

  return (
    <ReaderView 
      chapterId={chapterId}
      pages={data.chapter.dataSaver}
      baseUrl={data.baseUrl}
      hash={data.chapter.hash}
      chapterNum="?"
      title="Chapter"
      prevChapterId={null}
      nextChapterId={null}
    />
  );
}
