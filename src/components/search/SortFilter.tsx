"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ArrowUpDown, Check, X, ChevronDown } from 'lucide-react';

interface SortOption {
  label: string;
  value: string;
}

interface SortFilterProps {
  sortOptions: SortOption[];
  statusOptions: SortOption[];
  sortBy: string;
  statusFilter: string;
  onSortChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export default function SortFilter({
  sortOptions,
  statusOptions,
  sortBy,
  statusFilter,
  onSortChange,
  onStatusChange,
  onClearFilters,
  hasActiveFilters
}: SortFilterProps) {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-3 px-2">
      {/* Sort Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowSortDropdown(!showSortDropdown)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest",
            "bg-white/5 border border-white/10 backdrop-blur-md",
            "hover:bg-white/10 transition-all duration-300",
            sortBy !== 'popular' && "border-purple-500/40 bg-purple-500/5"
          )}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sort:</span>
          <span className="text-purple-400">
            {sortOptions.find(opt => opt.value === sortBy)?.label}
          </span>
          <ChevronDown className={cn(
            "w-3 h-3 transition-transform",
            showSortDropdown && "rotate-180"
          )} />
        </button>

        <AnimatePresence>
          {showSortDropdown && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setShowSortDropdown(false)}
              />
              
              {/* Dropdown */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 mt-2 w-40 rounded-xl bg-[#0a0a0f]/95 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden z-50"
              >
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value);
                      setShowSortDropdown(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 text-[10px] font-bold uppercase tracking-widest",
                      "hover:bg-white/5 transition-colors",
                      sortBy === option.value ? "text-purple-400" : "text-neutral-400"
                    )}
                  >
                    {option.label}
                    {sortBy === option.value && (
                      <Check className="w-3.5 h-3.5" />
                    )}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Status Toggle Buttons */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={cn(
              "px-3 py-2 rounded-lg text-[9px] font-bold uppercase tracking-widest",
              "transition-all duration-300",
              statusFilter === option.value
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                : "text-neutral-500 hover:text-white hover:bg-white/5"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Clear Filters */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={onClearFilters}
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest",
              "bg-red-500/10 border border-red-500/30 text-red-400",
              "hover:bg-red-500/20 transition-all duration-300"
            )}
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
