
"use client";

import React from 'react';
import { useMangaStore } from '@/store/mangaStore';
import { cn } from '@/lib/utils';
import { Globe, Languages, Zap } from 'lucide-react';

const SOURCES = [
  { id: 'all', label: 'All Signals', icon: Zap },
  { id: 'mangadex', label: 'Global Node', icon: Globe },
  { id: 'mangamint', label: 'Sub-Indo', icon: Languages },
] as const;

export default function SourceFilter() {
  const { preferredSource, setPreferredSource } = useMangaStore();

  return (
    <div className="flex items-center gap-2 p-1.5 bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/5 rounded-2xl w-fit">
      {SOURCES.map((s) => {
        const isActive = preferredSource === s.id;
        const Icon = s.icon;
        
        return (
          <button
            key={s.id}
            onClick={() => setPreferredSource(s.id as any)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-500",
              isActive 
                ? "bg-accent text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]" 
                : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
            )}
          >
            <Icon className={cn("w-3 h-3", isActive ? "animate-pulse" : "")} />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
