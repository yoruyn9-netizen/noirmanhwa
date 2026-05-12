"use client";

import React, { useEffect, useState } from 'react';
import { mangaApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function GenrePage() {
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await mangaApi.getTags();
        setGenres(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGenres();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] space-y-6">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-accent animate-spin" />
          <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">Decoding Signatures...</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-6xl mx-auto">
      <div className="space-y-4">
        <h1 className="text-6xl font-black tracking-tighter flex items-center gap-6 leading-none text-glow">
          <LayoutGrid className="w-12 h-12 text-accent" /> EXPLORE
        </h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.4em] ml-2 opacity-60">Filter titles by unique neural frequency signatures</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {genres.map((genre, idx) => (
          <button 
            key={genre.id}
            onClick={() => router.push(`/search?genre=${genre.id}`)}
            className="group relative h-40 overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0f0f13] hover:border-accent/50 transition-all duration-700 hover:-translate-y-2 shadow-2xl animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${idx * 30}ms` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm" />
            
            <div className="relative h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
              <span className="text-[12px] font-black uppercase tracking-[0.2em] transition-all duration-500 group-hover:text-white group-hover:scale-110">
                {genre.attributes.name.en}
              </span>
              <div className="w-10 h-1 bg-accent/20 rounded-full transition-all duration-500 group-hover:w-16 group-hover:bg-accent group-hover:shadow-[0_0_15px_rgba(153,27,27,1)]" />
            </div>
            
            {/* Glossy overlay */}
            <div className="absolute inset-0 border border-white/10 rounded-[2.5rem] pointer-events-none" />
          </button>
        ))}
      </div>
    </div>
  );
}