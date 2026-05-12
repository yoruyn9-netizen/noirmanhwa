
"use client";

import React, { useEffect, useState } from 'react';
import { mangaApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Loader2, Search } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Decoding Frequencies...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h1 className="text-5xl font-black tracking-tighter flex items-center gap-4">
          <LayoutGrid className="w-10 h-10 text-accent" /> EXPLORE
        </h1>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em] ml-1">Filter titles by neural signatures</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {genres.map((genre) => (
          <button 
            key={genre.id}
            onClick={() => router.push(`/search?genre=${genre.id}`)}
            className="group relative h-32 overflow-hidden rounded-3xl border border-white/5 bg-[#0f0f13] hover:border-accent/40 transition-all duration-500 hover:-translate-y-1 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative h-full flex flex-col items-center justify-center p-4 text-center space-y-2">
              <span className="text-[11px] font-black uppercase tracking-widest transition-all group-hover:text-accent group-hover:scale-110">
                {genre.attributes.name.en}
              </span>
              <div className="w-8 h-0.5 bg-white/5 group-hover:bg-accent/40 transition-all" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
