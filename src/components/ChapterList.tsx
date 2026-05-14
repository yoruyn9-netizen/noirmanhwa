
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
import { MangaSource } from '@/types/manga';

interface ChapterListProps {
  chapters: any[];
  mangaId?: string;
  source?: MangaSource;
}

export default function ChapterList({ chapters, mangaId, source = 'mangadex' }: ChapterListProps) {
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

        {/* Language Filter Bar */}
        <div className="flex items-center gap-2 p-1.5 bg-[#0a0a0f]/60 backdrop-blur-md border border-white/5 rounded-2xl w-fit">
          <button
            onClick={() => setLangFilter('all')}
            className={cn(
              "px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-500",
              langFilter === 'all' 
                ? "bg-accent text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
                : "text-neutral-500 hover:text-white"
            )}
          >
            ALL
          </button>
          {idCount > 0 && (
            <button
              onClick={() => setLangFilter('id')}
              className={cn(
                "px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2",
                langFilter === 'id' 
                  ? "bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]" 
                  : "text-neutral-500 hover:text-white"
              )}
            >
              ID <span className="opacity-40">{idCount}</span>
            </button>
          )}
          {enCount > 0 && (
            <button
              onClick={() => setLangFilter('en')}
              className={cn(
                "px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2",
                langFilter === 'en' 
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]" 
                  : "text-neutral-500 hover:text-white"
              )}
            >
              EN <span className="opacity-40">{enCount}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {filteredChapters.length === 0 ? (
          <div className="text-center py-20 bg-[#0a0a0f] rounded-[2.5rem] border border-dashed border-white/10 space-y-2">
            <Filter className="w-5 h-5 text-neutral-800 mx-auto mb-2" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-600">No signals detected for this filter.</p>
          </div>
        ) : (
          filteredChapters.map((chapter: any) => {
            const isIndo = chapter.attributes?.translatedLanguage === 'id';
            // Use unified routing structure: /reader/[mangaId]/[chapterId]
            const readerHref = mangaId 
              ? `/reader/${mangaId}/${chapter.id}?source=${source}`
              : `/reader/${chapter.id}?source=${source}`;

            return (
              <Link 
                key={chapter.id} 
                href={readerHref}
                className="flex items-center justify-between p-5 bg-[#0a0a0f] rounded-2xl border border-white/5 hover:border-accent/40 hover:bg-accent/5 transition-all group shadow-xl"
              >
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] transition-all",
                    isIndo 
                      ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                      : "bg-neutral-900 text-accent group-hover:bg-accent group-hover:text-white"
                  )}>
                    {chapter.attributes?.chapter || '?' }
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-[11px] uppercase tracking-tight text-white group-hover:text-accent transition-colors">
                      Unit {chapter.attributes?.chapter || 'X'}
                    </h4>
                    <div className="flex items-center gap-3 text-[7px] font-black text-neutral-600 uppercase tracking-widest">
                      <span className={cn("flex items-center gap-1.5", isIndo && "text-green-500/60")}>
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
          })
        )}
      </div>
    </section>
  );
}
