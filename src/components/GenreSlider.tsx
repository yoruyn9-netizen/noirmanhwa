
"use client";

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface GenreSliderProps {
  genres: any[];
}

export default function GenreSlider({ genres }: GenreSliderProps) {
  if (!genres || genres.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
         <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-600">Categories</h3>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2.5 pb-4">
          {genres.map((genre) => (
            <Link
              key={genre.id}
              href={`/search?genre=${genre.id}`}
              className={cn(
                "inline-flex items-center px-5 py-2.5 bg-[#0a0a0f] border border-white/5 rounded-xl transition-all duration-500 hover:border-accent/40 hover:bg-accent/5 active:scale-95 group"
              )}
            >
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 group-hover:text-white transition-colors">
                {genre.attributes.name.en}
              </span>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </ScrollArea>
    </div>
  );
}
