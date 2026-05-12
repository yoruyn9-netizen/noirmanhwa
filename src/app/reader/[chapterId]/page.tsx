"use client";

import React, { useEffect, useState, useRef } from 'react';
import { mangaApi } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Settings, ImageOff, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';

interface ReaderPageProps {
  params: Promise<{ chapterId: string }>;
}

export default function ReaderPage({ params }: ReaderPageProps) {
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [hash, setHash] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { openPanel, readerSettings } = useUIStore();
  const scrollInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    params.then(p => setChapterId(p.chapterId));
  }, [params]);

  useEffect(() => {
    if (!chapterId) return;

    const fetchPages = async () => {
      try {
        setLoading(true);
        const atHome = await mangaApi.getAtHomeServer(chapterId);
        if (atHome?.chapter?.data) {
          setBaseUrl(atHome.baseUrl);
          setHash(atHome.chapter.hash);
          setPages(atHome.chapter.data);
        } else {
          throw new Error("No pages found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load chapter");
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [chapterId]);

  // Handle Auto Scroll
  useEffect(() => {
    if (readerSettings.autoScroll && !loading && pages.length > 0) {
      scrollInterval.current = setInterval(() => {
        window.scrollBy({ top: 1 * readerSettings.autoScrollSpeed, behavior: 'auto' });
      }, 20);
    } else {
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    }
    return () => {
      if (scrollInterval.current) clearInterval(scrollInterval.current);
    };
  }, [readerSettings.autoScroll, readerSettings.autoScrollSpeed, loading, pages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Summoning Pages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-black">
        <ImageOff className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-4">Transmission Lost</h1>
        <p className="text-muted-foreground mb-8">The MangaDex network node is currently unreachable.</p>
        <Link href="/" className="px-6 py-3 bg-primary rounded-xl font-bold">Return to Library</Link>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen -mx-4 sm:-mx-6 lg:-mx-8 -mt-6 transition-colors duration-300",
      readerSettings.theme === 'dark' ? "bg-black text-white" : 
      readerSettings.theme === 'sepia' ? "bg-[#f4ecd8] text-[#5b4636]" : 
      "bg-white text-black"
    )}>
      <header className="fixed top-0 inset-x-0 h-16 glass z-50 flex items-center justify-between px-4">
        <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div className="text-center">
          <h1 className="text-[10px] font-black tracking-widest uppercase opacity-60">Noir Reader</h1>
          <p className="text-xs font-bold text-accent uppercase tracking-widest truncate max-w-[150px]">Chapter {chapterId?.substring(0, 8)}</p>
        </div>
        <button 
          onClick={() => openPanel('readerSettings')}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <Settings className="w-6 h-6" />
        </button>
      </header>

      <div className={cn(
        "pt-16 pb-24 flex min-h-screen",
        readerSettings.direction === 'vertical' ? "flex-col items-center" : 
        readerSettings.direction === 'rtl' ? "flex-row-reverse overflow-x-auto snap-x snap-mandatory" : 
        "flex-row overflow-x-auto snap-x snap-mandatory"
      )}>
        {pages.map((page, idx) => {
          const pageUrl = `${baseUrl}/data/${hash}/${page}`;
          return (
            <div 
              key={idx} 
              className={cn(
                "relative flex-shrink-0 flex items-center justify-center",
                readerSettings.direction === 'vertical' ? "w-full" : "w-screen h-[calc(100vh-8rem)] snap-center",
                readerSettings.fitMode === 'fit' ? "max-w-4xl" : 
                readerSettings.fitMode === 'stretch' ? "w-full" : "w-auto"
              )}
            >
              <img
                src={pageUrl}
                alt={`Page ${idx + 1}`}
                className={cn(
                  "block mx-auto",
                  readerSettings.fitMode === 'fit' ? "w-full h-auto" : 
                  readerSettings.fitMode === 'stretch' ? "w-full h-screen object-fill" : "w-auto h-auto max-w-none"
                )}
                loading={idx < 3 ? "eager" : "lazy"}
              />
            </div>
          );
        })}
      </div>

      <footer className="fixed bottom-0 inset-x-0 h-14 glass z-50 flex items-center justify-between px-6">
         <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
           {pages.length} Pages Loaded
         </div>
         <div className="flex items-center gap-4">
            <button className="p-2 opacity-50 hover:opacity-100 transition-opacity"><ChevronLeft className="w-5 h-5" /></button>
            <div className="w-px h-4 bg-white/10" />
            <button className="p-2 opacity-50 hover:opacity-100 transition-opacity"><ChevronRight className="w-5 h-5" /></button>
         </div>
      </footer>
    </div>
  );
}
