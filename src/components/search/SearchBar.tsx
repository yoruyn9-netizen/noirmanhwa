"use client";

import React, { useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  loading?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchBar({
  value,
  onChange,
  onClear,
  loading = false,
  placeholder = "Search manga titles...",
  autoFocus = false
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="relative group px-2">
      {/* Glass background */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 via-transparent to-purple-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-xl" />
      
      {/* Search container */}
      <div className="relative">
        {/* Search icon */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2 z-20">
          {loading ? (
            <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
          ) : (
            <Search className={cn(
              "w-5 h-5 transition-colors duration-300",
              value ? "text-purple-500" : "text-neutral-500 group-focus-within:text-purple-500"
            )} />
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search manga"
          className={cn(
            "w-full h-14 bg-white/5 backdrop-blur-md",
            "border border-white/10 rounded-2xl",
            "pl-14 pr-14 py-4",
            "text-sm font-bold text-white placeholder:text-neutral-500",
            "focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20",
            "transition-all duration-300",
            "shadow-2xl shadow-black/20"
          )}
        />

        {/* Clear button */}
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-20"
            aria-label="Clear search"
          >
            <X className="w-4 h-4 text-neutral-400" />
          </motion.button>
        )}
      </div>
    </div>
  );
}
