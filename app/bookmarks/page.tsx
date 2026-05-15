
"use client";

import React from 'react';
import { useUIStore } from '@/store/ui';
import SafeImage from '@/components/SafeImage';
import { Bookmark, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BookmarksPage() {
  const { bookmarks } = useUIStore();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-2xl mx-auto pb-20">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h1 className="text-xl font-black tracking-tighter flex items-center gap-3 uppercase text-glow">
            <Bookmark className="w-5 h-5 text-accent" /> Library
          </h1>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40 ml-1">Archive synchronization</p>
        </div>
        <div className="text-right">
          <span className="text-[14px] font-black text-white text-glow">{bookmarks.length}</span>
          <p className="text-[7px] font-black text-neutral-600 uppercase tracking-widest">Total Nodes</p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="py-32 text-center space-y-6 glass rounded-[3rem] border-dashed mx-2">
          <div className="w-16 h-16 bg-accent/5 rounded-full flex items-center justify-center mx-auto border border-accent/10">
            <Bookmark className="w-6 h-6 text-accent/20" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-tight">Void Detected</h3>
            <p className="text-muted-foreground text-[10px] uppercase tracking-widest opacity-60 max-w-[180px] mx-auto">No saved transmissions found.</p>
            <div className="pt-4">
              <Link href="/search" className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-black rounded-xl text-[8px] uppercase tracking-widest">Scan Matrix</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 px-2">
          {bookmarks.map((manga) => (
            <Link 
              key={manga.id} 
              href={`/manga/${manga.id}?source=${manga.source}`}
              className="group flex items-center gap-4 p-3 bg-[#0a0a0f]/40 backdrop-blur-md border border-white/5 rounded-2xl hover:border-accent/40 transition-all duration-500 shadow-xl"
            >
              <div className="relative w-16 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                <SafeImage src={manga.cover} alt={manga.title || 'Manga'} className="group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[10px] font-black uppercase tracking-tight text-white truncate group-hover:text-accent transition-colors">
                  {manga.title || 'Unknown Frequency'}
                </h3>
                <p className="text-[7px] font-black text-accent uppercase tracking-widest mt-1">
                  Status: {manga.status || 'Ongoing'}
                </p>
              </div>
              <div className="pr-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="w-4 h-4 text-accent" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
