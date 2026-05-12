"use client";

import React, { useEffect, useRef } from 'react';
import { useUIStore } from '@/store/ui';
import { cn } from '@/lib/utils';
import { X, Search, Bookmark, Grid, User, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BottomSheet() {
  const { activePanel, isOpen, closePanel, bookmarks, removeBookmark } = useUIStore();
  const sheetRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activePanel) {
      case 'search':
        return (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Search className="w-5 h-5 text-accent" /> Search Manga
            </h2>
            <div className="relative">
              <input 
                autoFocus
                type="text" 
                placeholder="Title, author, or genre..." 
                className="w-full bg-secondary/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    router.push(`/search?q=${(e.target as HTMLInputElement).value}`);
                    closePanel();
                  }
                }}
              />
            </div>
            <div className="space-y-4">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Trending Now</p>
              <div className="flex flex-wrap gap-2">
                {['Solo Leveling', 'The Beginning After The End', 'Lookism', 'Tower of God'].map(t => (
                  <button key={t} onClick={() => { router.push(`/search?q=${t}`); closePanel(); }} className="px-4 py-2 bg-secondary/30 rounded-full border border-white/5 text-sm hover:bg-secondary transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 'bookmark':
        return (
          <div className="p-6 space-y-6">
             <h2 className="text-xl font-bold flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-accent" /> My Library
            </h2>
            {bookmarks.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="bg-secondary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <Bookmark className="w-8 h-8 text-muted-foreground opacity-30" />
                </div>
                <p className="text-muted-foreground">Your library is currently empty.</p>
                <button onClick={() => { router.push('/'); closePanel(); }} className="text-accent font-semibold hover:underline">Explore Manga</button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar">
                {bookmarks.map((manga) => (
                  <div key={manga.id} className="flex gap-4 p-3 bg-secondary/20 rounded-xl border border-white/5 group relative">
                    <img 
                      src={manga.coverUrl} 
                      alt={manga.title} 
                      className="w-16 h-24 object-cover rounded-md flex-shrink-0 cursor-pointer"
                      onClick={() => { router.push(`/series/${manga.id}`); closePanel(); }}
                    />
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="font-bold truncate text-sm mb-1 cursor-pointer" onClick={() => { router.push(`/series/${manga.id}`); closePanel(); }}>{manga.title}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{manga.description}</p>
                      <button onClick={() => removeBookmark(manga.id)} className="text-xs text-destructive flex items-center gap-1 hover:underline">
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'genre':
        return (
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Grid className="w-5 h-5 text-accent" /> Explore Genres
            </h2>
            <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2 hide-scrollbar">
              {['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Martial Arts', 'Romance', 'Sci-Fi', 'Thriller', 'System'].map(genre => (
                <button 
                  key={genre}
                  onClick={() => { router.push(`/search?genre=${genre}`); closePanel(); }}
                  className="p-4 text-center bg-secondary/20 rounded-xl border border-white/5 hover:bg-primary/20 hover:border-accent/30 transition-all font-medium"
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="p-6 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-accent/30 text-accent font-bold text-2xl">
                Y
              </div>
              <div>
                <h2 className="text-xl font-bold">Yan</h2>
                <p className="text-sm text-accent">Pro Member</p>
              </div>
            </div>
            <div className="space-y-2">
              {['Reading History', 'Settings', 'Download Manager', 'App Theme'].map(item => (
                <button key={item} className="w-full flex items-center justify-between p-4 bg-secondary/20 rounded-xl hover:bg-secondary/40 transition-colors">
                  <span className="font-medium">{item}</span>
                  <X className="w-4 h-4 rotate-45 text-muted-foreground" />
                </button>
              ))}
              <button className="w-full p-4 mt-4 text-center bg-primary text-white rounded-xl font-bold hover:bg-accent transition-colors shadow-lg shadow-primary/20">
                Log Out
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300" 
        onClick={closePanel}
      />
      <div 
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-[70] glass rounded-t-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-w-2xl mx-auto pb-safe-area-inset-bottom"
      >
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-3" onClick={closePanel} />
        <div className="max-h-[85vh] overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </>
  );
}