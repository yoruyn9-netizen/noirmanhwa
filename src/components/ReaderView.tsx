
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MangaImage from '@/components/MangaImage';
import { ReaderPrefs, loadReaderPrefs, saveReaderPrefs, smoothScroll, DEFAULT_READER_PREFS } from '@/lib/reader-utils';
import ReaderSettings from '@/components/ReaderSettings';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui';
import { 
  ArrowLeft, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUp, 
  ArrowDown, 
  Zap,
  Eye
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface ReaderViewProps {
  chapterId: string;
  pages: string[];
  baseUrl: string;
  hash: string;
  chapterNum: string;
  title: string;
  prevChapterId: string | null;
  nextChapterId: string | null;
  mangaId?: string;
}

export default function ReaderView({ 
  chapterId, pages, baseUrl, hash, chapterNum, title, prevChapterId, nextChapterId, mangaId 
}: ReaderViewProps) {
  const router = useRouter();
  
  // Initialize with stable defaults to avoid hydration mismatch
  const [prefs, setPrefs] = useState<ReaderPrefs>(DEFAULT_READER_PREFS);
  const [mounted, setMounted] = useState(false);
  
  const [showUI, setShowUI] = useState(true);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  
  const { addToHistory, setGlobalUIVisible } = useUIStore();

  // Load preferences only once after mount
  useEffect(() => {
    setPrefs(loadReaderPrefs());
    setMounted(true);
  }, []);

  // Record history
  useEffect(() => {
    if (mangaId && chapterId) {
      addToHistory({
        mangaId,
        chapterId,
        chapterNum,
        timestamp: new Date().toISOString()
      });
    }
  }, [mangaId, chapterId, chapterNum, addToHistory]);

  // Persist preferences when they change, but only after loading them
  useEffect(() => {
    if (mounted) {
      saveReaderPrefs(prefs);
    }
  }, [prefs, mounted]);

  // Sync with global UI visibility
  useEffect(() => {
    setGlobalUIVisible(showUI);
    return () => setGlobalUIVisible(true);
  }, [showUI, setGlobalUIVisible]);

  const toggleUI = useCallback(() => {
    setShowUI(prev => !prev);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButtons(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (prefs.autoScroll && !isSettingsOpen) {
      autoScrollRef.current = setInterval(() => {
        window.scrollBy({ top: prefs.autoScrollSpeed, behavior: 'auto' });
      }, 30);
    } else {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    }
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [prefs.autoScroll, prefs.autoScrollSpeed, isSettingsOpen]);

  const directionClasses = {
    vertical: "flex-col",
    ltr: "flex-row overflow-x-auto snap-x snap-mandatory hide-scrollbar",
    rtl: "flex-row-reverse overflow-x-auto snap-x snap-mandatory hide-scrollbar"
  };

  const imageClasses = {
    fit: "w-full max-w-2xl mx-auto",
    original: "w-auto max-w-full mx-auto",
    stretch: "w-full"
  };

  const getThemeClass = () => {
    if (prefs.theme === 'light') return "bg-white text-black";
    if (prefs.theme === 'sepia') return "bg-[#f4ecd8] text-[#5b4636]";
    return "bg-[#020205]";
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-500 relative",
      getThemeClass()
    )}>
      {prefs.theme === 'dark' && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-40" />
        </div>
      )}

      <header className={cn(
        "fixed top-0 inset-x-0 h-16 bg-black/80 backdrop-blur-xl border-b border-white/5 z-50 flex items-center justify-between px-6 transition-transform duration-500",
        !showUI && "-translate-y-full"
      )}>
        <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="text-center flex-1 mx-4">
          <h1 className="text-[10px] font-black uppercase tracking-[0.3em] text-glow text-accent truncate">Chapter {chapterNum}</h1>
          <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest truncate">{title || 'Active Signal'}</p>
        </div>
        
        <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <SheetTrigger asChild>
            <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              <Settings className="w-5 h-5 text-neutral-400" />
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[75vh] bg-[#020205]/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[3rem] p-8">
            <SheetHeader className="sr-only">
              <SheetTitle>Reader Settings</SheetTitle>
            </SheetHeader>
            <ReaderSettings prefs={prefs} onChange={setPrefs} />
          </SheetContent>
        </Sheet>
      </header>

      <main 
        className={cn("pt-16 pb-32 flex min-h-screen", directionClasses[prefs.direction])}
        onClick={toggleUI}
        style={{ filter: prefs.theme === 'sepia' ? 'sepia(0.2)' : 'none' }}
      >
        {pages.map((page, index) => (
          <div 
            key={page} 
            className={cn(
              "relative mb-1", 
              prefs.direction !== 'vertical' && "min-w-full h-screen snap-center flex items-center justify-center",
              imageClasses[prefs.fitMode]
            )}
          >
            <MangaImage 
              src={`${baseUrl}/data-saver/${hash}/${page}`} 
              alt={`Page ${index + 1}`}
              className="block h-auto w-full"
            />
            {showUI && (
              <span className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[8px] font-black text-white uppercase tracking-widest border border-white/5">
                {index + 1} / {pages.length}
              </span>
            )}
          </div>
        ))}
      </main>

      <div className={cn(
        "fixed right-6 bottom-32 flex flex-col gap-3 transition-opacity duration-500 z-50",
        (!showScrollButtons || !showUI) && "opacity-0 pointer-events-none"
      )}>
        <button onClick={() => smoothScroll(0)} className="p-4 glass rounded-2xl text-accent hover:bg-accent hover:text-white transition-all shadow-2xl">
          <ArrowUp className="w-5 h-5" />
        </button>
        <button onClick={() => smoothScroll(document.body.scrollHeight)} className="p-4 glass rounded-2xl text-accent hover:bg-accent hover:text-white transition-all shadow-2xl">
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>

      <footer className={cn(
        "fixed bottom-0 inset-x-0 h-20 bg-black/80 backdrop-blur-xl border-t border-white/5 z-50 flex items-center justify-center gap-10 px-6 transition-transform duration-500",
        !showUI && "translate-y-full"
      )}>
        <button 
          disabled={!prevChapterId}
          onClick={() => router.push(`/reader/${prevChapterId}`)}
          className={cn("p-4 rounded-2xl transition-all", prevChapterId ? "text-white hover:bg-white/5" : "text-neutral-700 opacity-30")}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-1.5">
            <Zap className="w-3 h-3 fill-accent" /> SYNCHRONIZED
          </span>
          <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">{pages.length} Frames</p>
        </div>

        <button 
          disabled={!nextChapterId}
          onClick={() => router.push(`/reader/${nextChapterId}`)}
          className={cn("p-4 rounded-2xl transition-all", nextChapterId ? "text-white hover:bg-white/5" : "text-neutral-700 opacity-30")}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </footer>

      {!showUI && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in duration-1000">
           <div className="px-4 py-1.5 bg-accent/10 backdrop-blur-md rounded-full border border-accent/20 flex items-center gap-2">
             <Eye className="w-2.5 h-2.5 text-accent" />
             <span className="text-[7px] font-black text-accent uppercase tracking-widest">Clean Mode</span>
           </div>
        </div>
      )}
    </div>
  );
}
