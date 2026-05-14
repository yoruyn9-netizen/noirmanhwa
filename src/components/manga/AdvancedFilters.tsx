
"use client";

import React, { useEffect, useState } from 'react';
import { useFilterStore, MangaStatus } from '@/store/filterStore';
import { mangaApi } from '@/lib/mangaApi';
import { cn } from '@/lib/utils';
import { Filter, ChevronDown, Check, X, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GENRE_CATEGORIES = {
  'Action & Adventure': ['Action', 'Adventure', 'Martial Arts', 'Supernatural'],
  'Fantasy & Sci-Fi': ['Fantasy', 'Sci-Fi', 'Isekai', 'Reincarnation', 'Magic'],
  'Romance & Drama': ['Romance', 'Drama', 'Comedy', 'Slice of Life'],
  'Themes': ['Villainess', 'School Life', 'Harem', 'Psychological', 'Horror']
};

const STATUS_LIST: { id: MangaStatus; label: string }[] = [
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'completed', label: 'Completed' },
  { id: 'hiatus', label: 'Hiatus' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function AdvancedFilters() {
  const { 
    isFilterOpen, toggleFilterPanel, status, toggleStatus, 
    selectedGenres, toggleGenre, resetFilters, contentRating, toggleContentRating 
  } = useFilterStore();
  
  const [allTags, setAllTags] = useState<any[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      const res = await mangaApi.getTags();
      if (res.data) setAllTags(res.data);
    };
    fetchTags();
  }, []);

  const getTagId = (name: string) => {
    return allTags.find(t => t.attributes.name.en === name)?.id;
  };

  return (
    <div className="space-y-4">
      <button 
        onClick={toggleFilterPanel}
        className={cn(
          "flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
          isFilterOpen ? "bg-accent text-white shadow-xl" : "bg-white/5 text-neutral-400 hover:bg-white/10"
        )}
      >
        <Filter className="w-4 h-4" />
        Advanced Filters
        <ChevronDown className={cn("w-4 h-4 transition-transform duration-500", isFilterOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-[#0a0a0f]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 space-y-10"
          >
            {/* Status Section */}
            <section className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/60">Publication Status</h4>
              <div className="flex flex-wrap gap-2">
                {STATUS_LIST.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleStatus(s.id)}
                    className={cn(
                      "px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                      status.includes(s.id) ? "bg-accent border-accent text-white" : "bg-white/5 border-white/5 text-neutral-500 hover:text-white"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Genres Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {Object.entries(GENRE_CATEGORIES).map(([cat, tags]) => (
                <section key={cat} className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/60">{cat}</h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const id = getTagId(tag);
                      if (!id) return null;
                      const active = selectedGenres.includes(id);
                      return (
                        <button
                          key={id}
                          onClick={() => toggleGenre(id)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all",
                            active ? "bg-accent border-accent text-white" : "bg-white/5 border-white/5 text-neutral-600 hover:text-white"
                          )}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>

            {/* Rating Section */}
            <section className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/60">Content Rating</h4>
              <div className="flex flex-wrap gap-2">
                {['safe', 'suggestive', 'erotica'].map((r) => (
                  <button
                    key={r}
                    onClick={() => toggleContentRating(r)}
                    className={cn(
                      "px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                      contentRating.includes(r) ? "bg-red-500 border-red-500 text-white" : "bg-white/5 border-white/5 text-neutral-500"
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </section>

            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
              <button 
                onClick={resetFilters}
                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-neutral-600 hover:text-accent transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Matrix
              </button>
              <button 
                onClick={toggleFilterPanel}
                className="px-10 py-4 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-accent hover:text-white transition-all shadow-xl"
              >
                Apply Protocols
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
