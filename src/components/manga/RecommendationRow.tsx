'use client';
import React, { useEffect, useState } from 'react';
import { mangaApi } from '@/lib/mangaApi';
import MangaCardCompact from './MangaCardCompact';

export default function RecommendationRow({ currentId, genres }: { currentId: string; genres: string[] }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    mangaApi.fetchRecommendations(currentId, genres).then(setItems);
  }, [currentId, genres]);

  if (items.length === 0) return null;

  return (
    <div className="w-full mt-12 pb-10 border-t border-white/5 pt-10">
      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-6 px-4 text-neutral-500 flex items-center gap-3">
        <span className="w-6 h-px bg-accent/40" /> 🔥 You Might Also Like
      </h3>
      
      {/* STRICT HORIZONTAL SCROLL CONTAINER */}
      <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-6 scrollbar-hide">
        {items.map((manga) => (
          <div key={manga.id} className="flex-shrink-0 w-[130px] snap-center">
            <MangaCardCompact manga={manga} />
          </div>
        ))}
      </div>
    </div>
  );
}