
"use client";

import React, { useEffect, useState } from 'react';
import { mangaApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Sparkles, ChevronRight } from 'lucide-react';
import ThreeBodyLoader from '@/components/ui/ThreeBodyLoader';

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <ThreeBodyLoader />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">Loading Categories</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-4xl mx-auto pb-32">
      <div className="flex flex-col items-center text-center space-y-4 pt-10">
        <div className="w-16 h-16 bg-accent/5 rounded-3xl border border-accent/20 flex items-center justify-center shadow-2xl shadow-accent/10">
          <Sparkles className="w-8 h-8 text-accent" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-3xl font-black tracking-tighter uppercase text-glow">Genre Categories</h1>
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.4em] opacity-40">Filter by your favorite story types</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 px-4">
        {genres.map((genre, idx) => (
          <button 
            key={genre.id}
            onClick={() => router.push(`/search?genre=${genre.id}`)}
            style={{ animationDelay: `${idx * 40}ms` }}
            className="group relative h-32 overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#0a0a0f]/40 backdrop-blur-xl transition-all duration-700 hover:border-accent/40 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-8"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-neutral-300 group-hover:text-white transition-colors duration-500">
                {genre.attributes.name.en}
              </span>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-2 group-hover:translate-y-0">
                <span className="text-[7px] font-black text-accent uppercase tracking-widest">Select Genre</span>
                <ChevronRight className="w-3 h-3 text-accent" />
              </div>

              <div className="absolute bottom-4 w-6 h-0.5 bg-accent/20 rounded-full group-hover:w-12 group-hover:bg-accent transition-all duration-700" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
