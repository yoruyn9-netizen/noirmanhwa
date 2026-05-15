
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ChevronRight } from 'lucide-react';

const GENRES = [
  "Action", "Adventure", "Fantasy", "Reincarnation", "Isekai", "System", "Martial Arts", "Magic", "Romance", "Comedy"
];

export default function GenrePage() {
  const router = useRouter();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-4xl mx-auto pb-32">
      <div className="flex flex-col items-center text-center space-y-4 pt-10">
        <div className="w-16 h-16 bg-accent/5 rounded-3xl border border-accent/20 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-accent" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase text-glow">Categories</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 px-4">
        {GENRES.map((genre) => (
          <button 
            key={genre}
            onClick={() => router.push(`/search?q=${genre}`)}
            className="group relative h-32 overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0a0a0f]/40 backdrop-blur-xl transition-all duration-700 hover:border-accent/40"
          >
            <span className="text-[11px] font-black uppercase tracking-widest text-neutral-300 group-hover:text-white">{genre}</span>
            <div className="absolute bottom-4 w-6 h-0.5 bg-accent/20 rounded-full group-hover:w-12 group-hover:bg-accent transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}
