
"use client";

import React from 'react';
import { useFilterStore, SortOrder } from '@/store/filterStore';
import { cn } from '@/lib/utils';
import { ListFilter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'latest', label: 'Latest Updates' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'alphabetical', label: 'A-Z' },
  { value: 'newly-added', label: 'Newly Added' },
];

export default function SortingOptions() {
  const { sortBy, setSortBy } = useFilterStore();

  const currentLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 px-5 py-2.5 bg-[#0a0a0f] border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white hover:border-accent/40 transition-all">
          <ListFilter className="w-3.5 h-3.5" />
          <span>Sort: {currentLabel}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-[#0a0a0f]/95 backdrop-blur-2xl border-white/5 rounded-2xl p-2 z-[60]">
        <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-accent p-3">Sort Protocols</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/5" />
        <DropdownMenuRadioGroup value={sortBy} onValueChange={(val) => setSortBy(val as SortOrder)}>
          {SORT_OPTIONS.map((opt) => (
            <DropdownMenuRadioItem 
              key={opt.value} 
              value={opt.value}
              className="rounded-xl text-[10px] font-bold uppercase tracking-widest p-3 focus:bg-accent focus:text-white transition-all cursor-pointer"
            >
              {opt.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
