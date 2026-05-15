
"use client";

import React from 'react';
import { useUIStore } from '@/store/ui';
import SafeImage from '@/components/SafeImage';
import { Bookmark, ArrowRight, Play, History, Clock, BookOpen, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function LibraryPage() {
  const { bookmarks, readingHistory, removeBookmark, clearCache } = useUIStore();

  const historyMap = readingHistory.reduce((acc, curr) => {
    acc[curr.mangaId] = curr;
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-4xl mx-auto pb-32">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h1 className="text-xl font-black tracking-tighter flex items-center gap-3 uppercase text-glow">
            <BookOpen className="w-5 h-5 text-accent" /> Narrative Deck
          </h1>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40 ml-1">Archive synchronization</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[14px] font-black text-white text-glow">{bookmarks.length + readingHistory.length}</span>
            <p className="text-[7px] font-black text-neutral-600 uppercase tracking-widest">Total Nodes</p>
          </div>
        </div>
      </div>

      <div className="space-y-16">
        {/* SECTION: ACTIVE SIGNALS (HISTORY) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent flex items-center gap-3">
              <History className="w-4 h-4" /> Active Signals
            </h2>
          </div>

          {readingHistory.length === 0 ? (
            <div className="py-12 text-center glass rounded-[2.5rem] border-dashed mx-2 opacity-30">
               <p className="text-[9px] font-black uppercase tracking-widest">No activity logs recorded</p>
            </div>
          ) : (
            <div className="grid gap-4 px-2">
              {readingHistory.map((item) => (
                <Link 
                  key={item.mangaId} 
                  href={`/manga/${item.mangaId}`}
                  className="group flex items-center gap-4 p-4 bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-3xl hover:border-accent/40 transition-all duration-500 shadow-xl"
                >
                  <div className="relative w-14 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                    <SafeImage src={`https://picsum.photos/seed/${item.mangaId}/300/400`} alt={item.title || 'Manga'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[11px] font-black uppercase tracking-tight text-white truncate group-hover:text-accent transition-colors">
                      {item.title || 'Signal ID: ' + item.mangaId.substring(0, 8)}
                    </h3>
                    <div className="flex items-center gap-3 mt-1.5">
                       <span className="text-[8px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded-lg uppercase tracking-widest">Chapter {item.chapterNum}</span>
                       <span className="text-[7px] font-bold text-neutral-600 uppercase tracking-widest flex items-center gap-1">
                         <Clock className="w-2.5 h-2.5" /> Synchronized
                       </span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-all">
                    <Play className="w-3.5 h-3.5 text-accent fill-current" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* SECTION: ARCHIVE (BOOKMARKS) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-600 flex items-center gap-3">
              <Bookmark className="w-4 h-4" /> The Archive
            </h2>
          </div>

          {bookmarks.length === 0 ? (
            <div className="py-20 text-center glass rounded-[3rem] border-dashed mx-2">
              <div className="w-16 h-16 bg-accent/5 rounded-full flex items-center justify-center mx-auto border border-accent/10 mb-6">
                <Bookmark className="w-6 h-6 text-accent/20" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-tight">Void Detected</h3>
              <p className="text-muted-foreground text-[10px] uppercase tracking-widest opacity-60 mt-2 mb-8">No saved transmissions found.</p>
              <Link href="/search" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-black font-black rounded-2xl text-[9px] uppercase tracking-widest hover:bg-accent hover:text-white transition-all shadow-xl">Scan Matrix</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-2">
              {bookmarks.map((manga) => (
                <div key={manga.id} className="relative group">
                  <Link href={`/manga/${manga.id}?source=${manga.source}`} className="block">
                    <div className="aspect-[2/3] rounded-3xl overflow-hidden border border-white/5 bg-[#0a0a0f] group-hover:border-accent/40 transition-all duration-500 shadow-2xl">
                      <SafeImage src={manga.cover} alt={manga.title} className="group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h4 className="text-[9px] font-black uppercase tracking-tight text-white line-clamp-1 group-hover:text-accent transition-colors">
                          {manga.title}
                        </h4>
                        {historyMap[manga.id] && (
                          <p className="text-[7px] font-black text-accent uppercase tracking-widest mt-1">Read to Ch. {historyMap[manga.id].chapterNum}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                  <button 
                    onClick={() => removeBookmark(manga.id)}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-600/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110 z-20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="pt-20 text-center opacity-20">
         <button onClick={clearCache} className="text-[7px] font-black uppercase tracking-[0.5em] hover:text-red-500 transition-colors">Emergency Protocol: Purge Deck</button>
      </div>
    </div>
  );
}
