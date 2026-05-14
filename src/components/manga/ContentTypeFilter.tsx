
"use client";

import React from 'react';
import { useFilterStore, ContentType } from '@/store/filterStore';
import { cn } from '@/lib/utils';

const TYPES: { id: ContentType; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '🌐' },
  { id: 'manhwa', label: 'Manhwa', icon: '🇰🇷' },
  { id: 'manga', label: 'Manga', icon: '🇯🇵' },
  { id: 'manhua', label: 'Manhua', icon: '🇨🇳' },
  { id: 'sub-indo', label: 'Sub Indo', icon: '🇮🇩' },
];

export default function ContentTypeFilter() {
  const { contentType, setContentType } = useFilterStore();

  return (
    <div className="flex items-center gap-1.5 p-1 bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/5 rounded-2xl w-fit overflow-x-auto hide-scrollbar max-w-full">
      {TYPES.map((t) => {
        const isActive = contentType === t.id;
        
        return (
          <button
            key={t.id}
            onClick={() => setContentType(t.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap",
              isActive 
                ? "bg-accent text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
                : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
            )}
            aria-label={`Show ${t.label}`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
