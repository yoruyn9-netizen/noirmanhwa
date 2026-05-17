"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Manga } from '@/lib/mangaApi';
import MangaCard from '@/components/manga/MangaCard';
import { Search as SearchIcon, AlertCircle, Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import ThreeBodyLoader from '@/components/ui/ThreeBodyLoader';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const GENRE_OPTIONS = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Isekai',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Supernatural',
  'Thriller'
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Popular' },
  { value: 'latest', label: 'Latest' },
  { value: 'az', label: 'A-Z' },
  { value: 'rating', label: 'Rating' }
];

function parseGenres(params: URLSearchParams) {
  const genres = params.getAll('genres');
  if (genres.length > 0) return genres;
  const comma = params.get('genres');
  return comma ? comma.split(',').filter(Boolean) : [];
}

export default function SearchClientWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialGenres = parseGenres(searchParams);
  const initialSort = searchParams.get('sort') || 'popular';

  const [query, setQuery] = useState(initialQuery);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenres);
  const [sortOption, setSortOption] = useState(initialSort);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeFilterCount = useMemo(() => {
    return Number(Boolean(query.trim())) + selectedGenres.length + (sortOption !== 'popular' ? 1 : 0);
  }, [query, selectedGenres, sortOption]);

  const loadResults = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (initialQuery.trim()) params.set('q', initialQuery.trim());
      initialGenres.forEach((genre) => params.append('genres', genre));
      if (initialSort !== 'popular') params.set('sort', initialSort);

      const url = `/api/manga/combined?${params.toString()}`;
      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || `Request failed with status ${response.status}`);
      }

      const payload = await response.json();
      if (!payload.success || !Array.isArray(payload.data)) {
        throw new Error(payload.error || 'Empty search results returned.');
      }

      setResults(payload.data);
    } catch (err: any) {
      console.error('[Search]', err);
      setError(err?.message || 'Unable to retrieve search results.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setQuery(initialQuery);
    setSelectedGenres(initialGenres);
    setSortOption(initialSort);
    loadResults();
  }, [searchParams.toString()]);

  const handleToggleGenre = (genre: string) => {
    setSelectedGenres((current) =>
      current.includes(genre) ? current.filter((item) => item !== genre) : [...current, genre]
    );
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    selectedGenres.forEach((genre) => params.append('genres', genre));
    if (sortOption !== 'popular') params.set('sort', sortOption);
    setIsFilterOpen(false);
    router.push(`/search${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleClearFilters = () => {
    setQuery('');
    setSelectedGenres([]);
    setSortOption('popular');
    setIsFilterOpen(false);
    router.push('/search');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 max-w-5xl mx-auto px-4 py-6">
      <div className="space-y-1 ml-1">
        <h1 className="text-xl font-black tracking-tighter flex items-center gap-3 uppercase text-glow">
          <SearchIcon className="w-5 h-5 text-accent" /> Search Manga
        </h1>
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.3em] opacity-40 ml-1">
          Find your next favorite title
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleApplyFilters()}
            placeholder="Search titles..."
            className="w-full rounded-3xl border border-white/10 bg-[#0a0a0f] py-4 pl-12 pr-4 text-sm font-black uppercase tracking-[0.15em] text-white outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
          />
        </div>

        <button
          type="button"
          onClick={handleApplyFilters}
          className="rounded-3xl bg-accent px-5 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-black transition hover:brightness-110"
        >
          Search
        </button>

        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                'inline-flex items-center gap-2 rounded-3xl border px-5 py-4 text-[10px] font-black uppercase tracking-[0.35em] transition',
                activeFilterCount > 0
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-white/10 bg-[#0a0a0f] text-white hover:bg-white/5'
              )}
            >
              <Filter className="w-4 h-4" />
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
          </SheetTrigger>

          <SheetContent side="bottom" className="h-[60vh] bg-[#020205]/95 backdrop-blur-3xl border-t border-white/10 rounded-t-[3rem] p-8">
            <SheetHeader className="flex items-center justify-between mb-8">
              <SheetTitle className="text-xl font-black tracking-tight uppercase">Search Filters</SheetTitle>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-[10px] font-black uppercase tracking-[0.35em] text-accent"
              >
                Clear filters
              </button>
            </SheetHeader>

            <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-neutral-500">Genres</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-neutral-400">Select one or more genres</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {GENRE_OPTIONS.map((genre) => {
                    const active = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleToggleGenre(genre)}
                        className={cn(
                          'rounded-full border px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] transition',
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

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.35em] text-neutral-500">Sort</p>
                  <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-neutral-400">Choose display order</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSortOption(option.value)}
                      className={cn(
                        'rounded-full border px-4 py-3 text-[10px] font-black uppercase tracking-[0.35em] transition',
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

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={handleApplyFilters}
                className="inline-flex items-center justify-center rounded-3xl bg-accent px-6 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-black transition hover:brightness-110"
              >
                Apply filters
              </button>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="inline-flex items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-white transition hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <ThreeBodyLoader />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Loading search results...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 glass rounded-[3rem] border-dashed mx-2 p-8">
          <AlertCircle className="w-12 h-12 text-red-500 opacity-60" />
          <div className="space-y-3">
            <h3 className="text-base font-black uppercase tracking-tight text-red-500">Search Error</h3>
            <p className="text-muted-foreground font-medium text-[11px] opacity-50">{error}</p>
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center space-y-8 glass rounded-[3rem] border-dashed mx-2">
          <AlertCircle className="w-12 h-12 text-accent opacity-20" />
          <div className="space-y-2">
            <h3 className="text-base font-black uppercase tracking-tight">No Results Found</h3>
            <p className="text-muted-foreground font-medium text-[11px] opacity-50">Try changing your query or filters.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-2 sm:px-4">
          {results.map((manga) => (
            <MangaCard key={`${manga.id}-${manga.source}`} manga={manga} />
          ))}
        </div>
      )}
    </div>
  );
}
