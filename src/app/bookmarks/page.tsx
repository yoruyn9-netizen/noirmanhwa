"use client";

import React from 'react';
import { useUIStore } from '@/store/ui';
import MangaCard from '@/components/MangaCard';
import { Bookmark, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BookmarksPage() {
  const { bookmarks } = useUIStore();

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
        <div className="space-y-3">
          <h1 className="text-6xl font-black tracking-tighter flex items-center gap-6 leading-none text-glow">
            <Bookmark className="w-12 h-12 text-accent" /> LIBRARY
          </h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.4em] ml-2 opacity-60">Synchronized neural database of saved transmissions</p>
        </div>
        <div className="bg-accent/5 px-6 py-3 rounded-2xl border border-accent/10 backdrop-blur-xl">
          <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">{bookmarks.length} ARCHIVED TITLES</p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="py-40 text-center space-y-10 glass rounded-[5rem] border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
          <div className="w-32 h-32 bg-accent/5 rounded-full flex items-center justify-center mx-auto border border-accent/10 relative">
            <Bookmark className="w-14 h-14 text-accent/20" />
            <div className="absolute inset-0 bg-accent/10 rounded-full blur-3xl animate-pulse" />
          </div>
          <div className="space-y-4 relative z-10">
            <h3 className="text-3xl font-black tracking-tighter uppercase">No Data Found</h3>
            <p className="text-muted-foreground font-medium max-w-xs mx-auto text-sm opacity-70">Your personal archive is currently void. Start scanning the network for transmissions to save.</p>
            <div className="pt-6">
              <Link 
                href="/search"
                className="inline-flex items-center gap-4 px-12 py-5 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-accent hover:text-white transition-all duration-500 shadow-2xl active:scale-95"
              >
                INITIALIZE DISCOVERY <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12">
          {bookmarks.map((manga, idx) => (
            <div key={manga.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
              <MangaCard manga={manga} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}