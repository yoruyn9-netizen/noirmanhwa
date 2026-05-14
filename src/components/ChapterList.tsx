
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Languages,
  List,
  Filter
} from 'lucide-react';
import { cn, formatTimeAgo } from '@/lib/utils';

interface ChapterListProps {
  chapters: any[];
  mangaId?: string;
}

/**
 * Chapter Stack component for series details.
 * Correctly links to unified /reader/[id] route using 'id' slug name.
 */
export default function ChapterList({ chapters, mangaId }: ChapterListProps) {
  const [langFilter, setLangFilter] = useState<'all' | 'id' | 'en'>('all');

  const filteredChapters = chapters.filter(chapter => {
    if (langFilter === 'all') return true;
    return chapter.attributes?.translatedLanguage === langFilter;
  });

  const idCount = chapters.filter(c => c.attributes?.translatedLanguage === 'id').length;
  const enCount = chapters.filter(c => c.attributes?.translatedLanguage === 'en').length;

  return (
    <section className="space-y-8 px-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-[11px] font-black uppercase tracking-tighter flex items-center gap-3 text-white">
            <List className="w-4 h-4 text-accent" /> Chapter Stack
          </h2>
          <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">
            {filteredChapters.length} Units
          </span>
        </div>

        <div className="flex items-center gap-2 p-1.5 bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-2xl w-fit">
          <button
            onClick={() => setLangFilter('all')}
            className={cn(
              "px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-500",
              langFilter === 'all' ? "bg-accent text-white" : "text-neutral-500 hover:text-white"
            )}
          >
            ALL
          </button>
          {idCount > 0 && (
            <button
              onClick={() => setLangFilter('id')}
              className={cn(
                "px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-500",
                langFilter === 'id' ? "bg-green-500/20 text-green-400" : "text-neutral-500 hover:text-white"
              )}
            >
              ID ({idCount})
            </button>
          )}
          {enCount > 0 && (
            <button
              onClick={() => setLangFilter('en')}
              className={cn(
                "px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-500",
                langFilter === 'en' ? "bg-blue-500/20 text-blue-400" : "text-neutral-500 hover:text-white"
              )}
            >
              EN ({enCount})
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {filteredChapters.map((chapter: any) => {
          const isIndo = chapter.attributes?.translatedLanguage === 'id';
          
          return (
            <Link 
              key={chapter.id} 
              href={`/reader/${chapter.id}`}
              className="flex items-center justify-between p-5 bg-[#0a0a0f] rounded-2xl border border-white/5 hover:border-accent/40 hover:bg-accent/5 transition-all group shadow-xl"
            >
              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] transition-all",
                  isIndo ? "bg-green-500/10 text-green-400" : "bg-neutral-900 text-accent group-hover:bg-accent group-hover:text-white"
                )}>
                  {chapter.attributes?.chapter || '?' }
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-[11px] uppercase tracking-tight text-white group-hover:text-accent transition-colors">
                    Unit {chapter.attributes?.chapter || 'X'}
                  </h4>
                  <div className="flex items-center gap-3 text-[7px] font-black text-neutral-600 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5">
                      <Languages className="w-2.5 h-2.5" /> {isIndo ? 'INDONESIA' : 'ENGLISH'}
                    </span>
                    <span>•</span>
                    <span>{chapter.attributes?.publishAt ? formatTimeAgo(chapter.attributes.publishAt) : 'Recently'}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-neutral-800 group-hover:text-accent group-hover:translate-x-1 transition-all" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
