"use client";

import React from 'react';
import { useUIStore } from '@/store/ui';
import MangaCard from '@/components/MangaCard';
import { Bookmark, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BookmarksPage() {
  const { bookmarks } = useUIStore();

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-black tracking-tighter flex items-center gap-3 uppercase text-glow">
            <Bookmark className="w-5 h-5 text-accent" /> Library
          </h1>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 ml-1">Archived transmissions</p>
        </div>
        <div className="bg-accent/5 px-3 py-1 rounded-lg border border-accent/10">
          <p className="text-[8px] font-black text-accent uppercase tracking-widest">{bookmarks.length} Titles</p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="py-32 text-center space-y-6 glass rounded-[2.5rem] relative overflow-hidden">
          <Bookmark className="w-10 h-10 text-accent/20 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-sm font-black uppercase tracking-tight">Archive Void</h3>
            <p className="text-muted-foreground text-[11px] opacity-70 max-w-[180px] mx-auto">No saved data found in the current sector.</p>
            <div className="pt-4">
              <Link 
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-xl text-[9px] uppercase tracking-widest hover:bg-accent hover:text-white transition-all shadow-xl"
              >
                Scan Network <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="manga-grid">
          {bookmarks.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      )}
    </div>
  );
}