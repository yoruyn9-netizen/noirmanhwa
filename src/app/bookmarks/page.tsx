
"use client";

import React from 'react';
import { useUIStore } from '@/store/ui';
import MangaCard from '@/components/MangaCard';
import { Bookmark, Search, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function BookmarksPage() {
  const { bookmarks } = useUIStore();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-tighter flex items-center gap-4 leading-none">
            <Bookmark className="w-10 h-10 text-accent" /> LIBRARY
          </h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em] ml-1">Your synchronized reading database</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-black text-accent uppercase tracking-widest">{bookmarks.length} TITLES SAVED</p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="py-32 text-center space-y-8 glass rounded-[4rem] border border-white/5 shadow-2xl animate-pulse">
          <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
            <Bookmark className="w-10 h-10 text-accent/30" />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-black tracking-tighter uppercase">No Transmissions Saved</h3>
            <p className="text-muted-foreground font-medium max-w-xs mx-auto text-sm">Your neural library is currently empty. Start discovering new obsessions.</p>
            <Link 
              href="/search"
              className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-white font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all"
            >
              INITIALIZE SEARCH <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-10">
          {bookmarks.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      )}
    </div>
  );
}
