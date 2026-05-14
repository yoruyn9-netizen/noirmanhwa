
"use client";

import React from 'react';
import { useMangaStore } from '@/store/mangaStore';
import { cn } from '@/lib/utils';
import { Globe, Languages, Zap } from 'lucide-react';

const SOURCES = [
  { id: 'all', label: 'All Streams', icon: Zap },
  { id: 'mangadex', label: 'Global (En)', icon: Globe },
  { id: 'mangamint', label: 'Sub-Indo (Id)', icon: Languages },
] as const;

export default function SourceFilter() {
  const { preferredSource, setPreferredSource } = useMangaStore();

  const handleSwitch = (id: string) => {
    // Force cache purge for immediate sync
    if (typeof window !== 'undefined') {
       console.log(`📡 Switching frequency to: ${id.toUpperCase()}`);
    }
    setPreferredSource(id as any);
  };

  return (
    <div className="flex items-center gap-1.5 p-1 bg-[#0a0a0f]/60 backdrop-blur-xl border border-white/5 rounded-2xl w-fit">
      {SOURCES.map((s) => {
        const isActive = preferredSource === s.id;
        const Icon = s.icon;
        
        return (
          <button
            key={s.id}
            onClick={() => handleSwitch(s.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-500",
              isActive 
                ? "bg-accent text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
                : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
            )}
            aria-label={`Switch to ${s.label}`}
          >
            <Icon className={cn("w-3 h-3", isActive ? "animate-pulse" : "opacity-40")} />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
