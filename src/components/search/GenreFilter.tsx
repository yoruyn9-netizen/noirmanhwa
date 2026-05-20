"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GenreFilterProps {
  genres: string[];
  selectedGenres: string[];
  onToggle: (genre: string) => void;
}

export default function GenreFilter({
  genres,
  selectedGenres,
  onToggle
}: GenreFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative px-2">
      {/* Section Label */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-600">
          Filter by Genre
        </span>
        {selectedGenres.length > 0 && (
          <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">
            {selectedGenres.length} selected
          </span>
        )}
      </div>

      {/* Mobile: Horizontal scroll */}
      <div className="md:hidden relative">
        {/* Left gradient fade */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#020205] to-transparent z-10 pointer-events-none" />
        )}
        
        {/* Right gradient fade */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#020205] to-transparent z-10 pointer-events-none" />
        )}

        <div 
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto hide-scrollbar pb-2"
          onScroll={checkScrollPosition}
        >
          {genres.map((genre, index) => (
            <GenreChip
              key={genre}
              genre={genre}
              isSelected={selectedGenres.includes(genre)}
              onClick={() => onToggle(genre)}
              index={index}
            />
          ))}
        </div>
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden md:block">
        <div className="flex flex-wrap gap-2">
          {genres.map((genre, index) => (
            <GenreChip
              key={genre}
              genre={genre}
              isSelected={selectedGenres.includes(genre)}
              onClick={() => onToggle(genre)}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface GenreChipProps {
  genre: string;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

function GenreChip({ genre, isSelected, onClick, index }: GenreChipProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest",
        "border backdrop-blur-md transition-all duration-300 whitespace-nowrap",
        "active:scale-95",
        isSelected
          ? "bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/30"
          : "bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:border-white/20"
      )}
    >
      {genre}
    </motion.button>
  );
}
