export const dynamic = 'force-dynamic';
export const revalidate = 0;

"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { fetchMangaList, Manga } from '@/lib/mangaApi';
import HeroSlider from '@/components/HeroSlider';
import PopularManhwaCarousel from '@/components/manga/PopularManhwaCarousel';
import MangaCard from '@/components/manga/MangaCard';
import GlobalChat from '@/components/chat/GlobalChat';
import HeaderProfile from '@/components/HeaderProfile';
import ThreeBodyLoader from '@/components/ui/ThreeBodyLoader';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { Search, X, ChevronDown, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Ecchi',
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

const normalizeQuery = (value: string) => value.trim().toLowerCase();

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [trending, setTrending] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('popular');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialSearch = searchParams.get('search') || '';
    const genreParams = searchParams
      .getAll('genre')
      .map((value) => GENRES.find((genre) => genre.toLowerCase() === value.toLowerCase()) || value)
      .filter(Boolean) as string[];
    const sortParam = searchParams.get('sort') || 'popular';

    setSearch(initialSearch);
    setSelectedGenres(genreParams.length ? genreParams : []);
    setSortOption(SORT_OPTIONS.some((option) => option.value === sortParam) ? sortParam : 'popular');
    setMounted(true);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchMangaList();
        if (cancelled) return;
        setTrending(data || []);
      } catch (err: any) {
        if (cancelled) return;
        console.error('❌ [Home]: Failed to load manga feed.', err);
        setError(err?.message || 'Unable to retrieve content.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedGenres.length > 0) selectedGenres.forEach((genre) => params.append('genre', genre.toLowerCase()));
    if (sortOption) params.set('sort', sortOption);
    const queryString = params.toString();

    router.replace(queryString ? `/?${queryString}` : '/', { scroll: false });
  }, [search, selectedGenres, sortOption, mounted, router]);

  const filteredManga = useMemo(() => {
    if (!trending.length) return [];

    const normalizedSearch = normalizeQuery(search);
    const selectedGenreSet = new Set(selectedGenres.map((genre) => genre.toLowerCase()));

    const result = trending.filter((manga) => {
      const titleMatch = normalizedSearch
        ? normalizeQuery(manga.title).includes(normalizedSearch)
        : true;

      const genreMatch = selectedGenreSet.size > 0
        ? manga.genres.some((genre) => selectedGenreSet.has(genre.toLowerCase()))
        : true;

      return titleMatch && genreMatch;
    });

    return result.sort((a, b) => {
      if (sortOption === 'latest') {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return bTime - aTime;
      }
      if (sortOption === 'rating') {
        const aRating = typeof a.rating === 'number' ? a.rating : -1;
        const bRating = typeof b.rating === 'number' ? b.rating : -1;
        return bRating - aRating;
      }
      if (sortOption === 'az') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [trending, search, selectedGenres, sortOption]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((current) =>
      current.includes(genre)
        ? current.filter((item) => item !== genre)
        : [...current, genre]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedGenres([]);
    setSortOption('popular');
  };

  if (loading && !trending.length) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6">
        <ThreeBodyLoader />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent animate-pulse">LOADING</p>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6"><Search className="w-12 h-12 text-neutral-800" /><p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Something went wrong. Try refreshing.</p></div>}>
      <div className="space-y-16 pb-40 max-w-[1600px] mx-auto px-4 relative overflow-x-hidden animate-in fade-in duration-1000">
        <header className="flex flex-col gap-6 pt-6 lg:flex-row lg:items-end lg:justify-between px-1">
          <HeaderProfile />
          <div className="text-right hidden sm:block">
            <p className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.5em]">Noir Node: Alpha-42</p>
          </div>
        </header>

        <section className="rounded-[2.5rem] border border-white/10 bg-[#06060c]/80 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
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
                  {GENRES.map((genre) => {
                    const active = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
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
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSortOption(option.value)}
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
                <span className="rounded-full bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.35em] text-neutral-300">Sort: {SORT_OPTIONS.find((item) => item.value === sortOption)?.label}</span>
              )}
            </div>
            <button
              onClick={clearFilters}
              disabled={!search && !selectedGenres.length && sortOption === 'popular'}
              className="inline-flex items-center justify-center rounded-2xl bg-white/5 px-5 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-neutral-300 transition hover:bg-white/10 disabled:opacity-40"
            >
              <X className="h-4 w-4" /> Clear Filters
            </button>
          </div>
        </section>

        <section className="w-full overflow-x-hidden">
          <HeroSlider trending={trending} />
        </section>

        <section className="w-full overflow-x-hidden">
          <PopularManhwaCarousel />
        </section>

        <section className="space-y-10 overflow-x-hidden">
          <div className="space-y-2 px-1">
            <h2 className="text-xl font-black uppercase tracking-tighter text-white text-glow">Filtered Manga Feed</h2>
            <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-[0.4em]">Search, filter, and sort your live discovery results.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-80 animate-pulse rounded-[2rem] bg-white/5 border border-white/10" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[2rem] border border-red-500/20 bg-red-500/5 p-10 text-center">
              <p className="text-sm font-black uppercase tracking-[0.4em] text-red-400">Filter Error</p>
              <p className="mt-3 text-[11px] text-neutral-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 rounded-2xl bg-red-500 px-6 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-black hover:brightness-110 transition"
              >
                Reload
              </button>
            </div>
          ) : filteredManga.length === 0 ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-14 text-center">
              <p className="text-base font-black uppercase tracking-[0.35em] text-white">No titles match your filters</p>
              <p className="mt-3 text-[11px] text-neutral-500">Try clearing search or picking fewer genres.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredManga.map((manga) => (
                <MangaCard key={`${manga.source}-${manga.id}`} manga={manga} />
              ))}
            </div>
          )}
        </section>

        <section>
          <GlobalChat previewMode={true} />
        </section>
      </div>
    </ErrorBoundary>
  );
}
