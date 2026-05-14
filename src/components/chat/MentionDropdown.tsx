
"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeImage from '@/components/SafeImage';
import { getCoverUrl, getMangaTitle } from '@/lib/utils';
import { Manga } from '@/lib/types';

interface MentionDropdownProps {
  results: Manga[];
  onSelect: (manga: Manga) => void;
  visible: boolean;
}

export default function MentionDropdown({ results, onSelect, visible }: MentionDropdownProps) {
  if (!visible || results.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="absolute bottom-full left-0 right-0 mb-4 bg-[#0a0a0f]/95 backdrop-blur-3xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-[100]"
      >
        <div className="p-3 border-b border-white/5 bg-white/5">
          <span className="text-[8px] font-black uppercase tracking-widest text-accent">Select Signal Node</span>
        </div>
        <div className="max-h-64 overflow-y-auto hide-scrollbar">
          {results.map((manga) => (
            <button
              key={manga.id}
              onClick={() => onSelect(manga)}
              className="w-full flex items-center gap-4 p-4 hover:bg-accent/10 transition-colors text-left group"
            >
              <div className="w-10 h-14 rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                <SafeImage src={getCoverUrl(manga, '256')} alt={getMangaTitle(manga)} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] font-black text-white uppercase truncate group-hover:text-accent transition-colors">
                  {getMangaTitle(manga)}
                </h4>
                <p className="text-[7px] font-black text-neutral-600 uppercase tracking-widest mt-1">
                  {manga.attributes.status}
                </p>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
