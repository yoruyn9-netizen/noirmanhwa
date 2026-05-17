"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortOption {
  value: string;
  label: string;
}

interface HomeSearchFilterProps {
  genres: string[];
  sortOptions: SortOption[];
  search: string;
  selectedGenres: string[];
  sortOption: string;
  onSearchChange: (value: string) => void;
  onToggleGenre: (genre: string) => void;
  onSortChange: (value: string) => void;
  onClearFilters: () => void;
  onInitialFilters: (values: { search: string; selectedGenres: string[]; sortOption: string }) => void;
}

export function HomeSearchFilter({
  genres,
  sortOptions,
  search,
  selectedGenres,
  sortOption,
  onSearchChange,
  onToggleGenre,
  onSortChange,
  onClearFilters,
  onInitialFilters,
}: HomeSearchFilterProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const initialSearch = searchParams.get('search') || '';
    const genreParams = searchParams
      .getAll('genre')
      .map((value) => genres.find((genre) => genre.toLowerCase() === value.toLowerCase()) || value)
      .filter(Boolean) as string[];
    const initialSort = searchParams.get('sort') || 'popular';

    onInitialFilters({
      search: initialSearch,
      selectedGenres: genreParams.length ? genreParams : [],
      sortOption: sortOptions.some((option) => option.value === initialSort) ? initialSort : 'popular',
    });
  }, [searchParams, genres, onInitialFilters, sortOptions]);

  return (
    <section className="rounded-[2.5rem] border border-white/10 bg-[#06060c]/80 p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by title..."
            className="w-full rounded-3xl border border-white/10 bg-[#0b0b12] py-4 pl-12 pr-4 text-sm font-black uppercase tracking-[0.15em] text-white outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-[#09090f] p-4">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-accent">Genres</p>
                <p className="text-[11px] text-neutral-400">Select one or more</p>
              </div>
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            </div>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => {
                const active = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => onToggleGenre(genre)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] transition-all',
                      active
                        ? 'border-accent bg-accent/10 text-white'
                        : 'border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white'
                    )}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#09090f] p-4">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-accent">Sort</p>
                <p className="text-[11px] text-neutral-400">Choose a sort option</p>
              </div>
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            </div>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSortChange(option.value)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.35em] transition-all',
                    sortOption === option.value
                      ? 'border-accent bg-accent/10 text-white'
                      : 'border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {search && <span className="rounded-full bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.35em] text-white">Search: {search}</span>}
          {selectedGenres.map((genre) => (
            <span key={genre} className="rounded-full bg-accent/10 px-3 py-2 text-[10px] uppercase tracking-[0.35em] text-accent">{genre}</span>
          ))}
          {sortOption !== 'popular' && (
            <span className="rounded-full bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.35em] text-neutral-300">Sort: {sortOptions.find((item) => item.value === sortOption)?.label}</span>
          )}
        </div>
        <button
          onClick={onClearFilters}
          disabled={!search && !selectedGenres.length && sortOption === 'popular'}
          className="inline-flex items-center justify-center rounded-2xl bg-white/5 px-5 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-neutral-300 transition hover:bg-white/10 disabled:opacity-40"
        >
          <X className="h-4 w-4" /> Clear Filters
        </button>
      </div>
    </section>  );
}