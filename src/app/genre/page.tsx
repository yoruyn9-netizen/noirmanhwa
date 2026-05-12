"use client";

import React, { useEffect, useState } from 'react';
import { mangaApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Loader2 } from 'lucide-react';

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Decoding...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-xl font-black tracking-tighter flex items-center gap-3 uppercase text-glow">
          <LayoutGrid className="w-5 h-5 text-accent" /> Explore
        </h1>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60 ml-1">Signature filtering</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {genres.map((genre) => (
          <button 
            key={genre.id}
            onClick={() => router.push(`/search?genre=${genre.id}`)}
            className="group relative h-24 overflow-hidden rounded-2xl border border-white/5 bg-[#0f0f13] hover:border-accent/50 transition-all duration-500 hover:-translate-y-1 shadow-xl"
          >
            <div className="relative h-full flex flex-col items-center justify-center p-4 text-center space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-accent transition-colors">
                {genre.attributes.name.en}
              </span>
              <div className="w-6 h-0.5 bg-accent/20 rounded-full group-hover:w-10 group-hover:bg-accent transition-all" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}