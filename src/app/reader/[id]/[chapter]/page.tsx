
"use client";

import React, { useEffect, useState, use } from 'react';
import { getChapterServer } from '@/lib/mangaDexChapter';
import { MangaSource } from '@/types/manga';
import { useSearchParams, useRouter } from 'next/navigation';
import ImagePage from '@/components/reader/ImagePage';
import { AlertTriangle, ArrowLeft, Settings, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/ui';
import { syncHistoryToFirestore } from '@/lib/firestore';
import { cn } from '@/lib/utils';

export default function ReaderDynamicPage({ params }: { params: Promise<{ id: string; chapter: string }> }) {
  const { id: mangaId, chapter: chapterId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const { addToHistory: updateLocalHistory } = useUIStore();
  const source = (searchParams.get('source') as MangaSource) || 'mangadex';
  
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showUI, setShowUI] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const serverData = await getChapterServer(chapterId);
        if (!serverData) throw new Error("Server Unreachable");

        const { baseUrl, chapter } = serverData;
        const imgs = (chapter.dataSaver || []).map((f: string) => `${baseUrl}/data-saver/${chapter.hash}/${f}`);
        
        setImages(imgs);
        
        // SYNC NARRATIVE HISTORY
        const historyItem = {
          mangaId,
          chapterId,
          chapterNum: chapter.chapter || 'X',
          title: mangaId.replace(/-/g, ' ').toUpperCase(),
          lastRead: new Date().toISOString(),
          progress: 0
        };

        // 1. Local Persistence (Zustand)
        updateLocalHistory(historyItem);

        // 2. Remote Synchronization (Firestore)
        if (user) {
          syncHistoryToFirestore(user.uid, {
            ...historyItem,
            lastRead: serverTimestamp() as any
          });
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [chapterId, mangaId, user, updateLocalHistory]);

  if (loading) return (
    <div className="fixed inset-0 bg-[#020205] flex flex-col items-center justify-center space-y-6">
      <div className="w-12 h-12 border-2 border-accent/20 border-t-accent rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent animate-pulse">Syncing Chapter</p>
    </div>
  );

  if (error) return (
    <div className="fixed inset-0 bg-[#020205] flex flex-col items-center justify-center p-10 text-center">
      <AlertTriangle className="w-20 h-20 text-red-500/20 mb-6" />
      <h2 className="text-xl font-black uppercase tracking-tighter text-white">Neural Link Failure</h2>
      <button onClick={() => window.location.reload()} className="mt-8 px-12 py-5 bg-white text-black rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl">RETRY UPLINK</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black relative">
      <header className={cn(
        "fixed top-0 inset-x-0 h-16 bg-black/80 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-6 transition-transform",
        !showUI && "-translate-y-full"
      )}>
        <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-xl"><ArrowLeft className="w-5 h-5 text-white" /></button>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Chapter Node</p>
          <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">MangaDex Node Stream</p>
        </div>
        <button className="p-2 hover:bg-white/5 rounded-xl"><Settings className="w-5 h-5 text-neutral-400" /></button>
      </header>

      <main className="pt-16 pb-32 flex flex-col items-center" onClick={() => setShowUI(!showUI)}>
        {images.map((url, i) => <ImagePage key={i} url={url} index={i} />)}
      </main>

      <footer className={cn(
        "fixed bottom-0 inset-x-0 h-20 bg-black/80 backdrop-blur-xl border-t border-white/5 z-50 flex items-center justify-center gap-10 px-6 transition-transform",
        !showUI && "translate-y-full"
      )}>
        <button className="p-4 text-white hover:bg-white/5 rounded-2xl"><ChevronLeft className="w-6 h-6" /></button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase text-accent flex items-center gap-1.5"><Zap className="w-3 h-3 fill-accent" /> SYNCED</span>
          <p className="text-[9px] font-black text-neutral-500 uppercase">{images.length} Pages</p>
        </div>
        <button className="p-4 text-white hover:bg-white/5 rounded-2xl"><ChevronRight className="w-6 h-6" /></button>
      </footer>
    </div>
  );
}

// Added missing import for firestore helper
import { serverTimestamp } from 'firebase/firestore';
