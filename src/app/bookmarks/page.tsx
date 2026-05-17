
"use client";

import React, { useEffect, useState } from 'react';
import { useUIStore } from '@/store/ui';
import SafeImage from '@/components/SafeImage';
import { Bookmark, Play, Clock, ArrowRight, Zap, BookOpen } from 'lucide-react';
import Link from 'next/link';
import ThreeBodyLoader from '@/components/ui/ThreeBodyLoader';

export default function BookmarksPage() {
  const { bookmarks, readingHistory } = useUIStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6">
        <ThreeBodyLoader />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Syncing Archive</p>
      </div>
    );
  }

  // Categorize manga
  const activeReading = bookmarks.filter(b => readingHistory.some(h => h.mangaId === b.id));
  const readLater = bookmarks.filter(b => !readingHistory.some(h => h.mangaId === b.id));

  const renderMangaItem = (manga: any, isHistory: boolean) => {
    const historyEntry = readingHistory.find(h => h.mangaId === manga.id);
    const coverUrl = manga.cover;
    const title = manga.title;

    return (
      <Link 
        key={manga.id} 
        href={`/manga/${manga.id}`}
        className="group flex items-center gap-4 p-3 bg-[#0a0a0f]/40 backdrop-blur-md border border-white/5 rounded-2xl hover:border-accent/40 transition-all duration-500 shadow-xl"
      >
        <div className="relative w-16 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
          <SafeImage src={coverUrl} alt={title} className="group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        
        <div className="flex-1 min-w-0 space-y-1.5">
          <h3 className="text-[10px] font-black uppercase tracking-tight text-white truncate group-hover:text-accent transition-colors">
            {title}
          </h3>
          
          <div className="flex flex-col gap-1">
            {isHistory ? (
              <div className="flex items-center gap-2">
                <span className="text-[7px] font-black text-accent uppercase tracking-widest flex items-center gap-1">
                  <Zap className="w-2 h-2 fill-accent" /> Ch. {historyEntry?.chapterNum || '?'}
                </span>
                <span className="text-[7px] font-bold text-neutral-600 uppercase tracking-widest">Last Read</span>
              </div>
            ) : (
              <span className="text-[7px] font-black text-neutral-500 uppercase tracking-widest">Added to Queue</span>
            )}
            
            <div className="flex items-center gap-3">
               <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest flex items-center gap-1">
                <Clock className="w-2 h-2" /> {manga.status || 'Ongoing'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="pr-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
          <ArrowRight className="w-4 h-4 text-accent" />
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-2xl mx-auto pb-20">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h1 className="text-xl font-black tracking-tighter flex items-center gap-3 uppercase text-glow">
            <Bookmark className="w-5 h-5 text-accent" /> Archive
          </h1>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40 ml-1">Library synchronization</p>
        </div>
        <div className="text-right">
          <span className="text-[14px] font-black text-white text-glow">{bookmarks.length}</span>
          <p className="text-[7px] font-black text-neutral-600 uppercase tracking-widest">Total Nodes</p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="py-32 text-center space-y-6 glass rounded-[3rem] border-dashed">
          <div className="w-16 h-16 bg-accent/5 rounded-full flex items-center justify-center mx-auto border border-accent/10">
            <Bookmark className="w-6 h-6 text-accent/20" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-tight">Void Detected</h3>
            <p className="text-muted-foreground text-[10px] uppercase tracking-widest opacity-60 max-w-[180px] mx-auto">No saved transmissions found.</p>
            <div className="pt-4">
              <Link 
                href="/search"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-black rounded-xl text-[8px] uppercase tracking-widest hover:bg-accent hover:text-white transition-all shadow-xl"
              >
                Scan Matrix <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {activeReading.length > 0 && (
            <section className="space-y-5">
              <div className="flex items-center gap-3 px-2">
                <Play className="w-3 h-3 text-accent fill-accent" />
                <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-white">Active Signals</h2>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="grid gap-3">
                {activeReading.map(m => renderMangaItem(m, true))}
              </div>
            </section>
          )}

          {readLater.length > 0 && (
            <section className="space-y-5">
              <div className="flex items-center gap-3 px-2">
                <BookOpen className="w-3 h-3 text-neutral-600" />
                <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500">Queue (Baca Nanti)</h2>
                <div className="flex-1 h-px bg-white/5" />
              </div>
              <div className="grid gap-3">
                {readLater.map(m => renderMangaItem(m, false))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
