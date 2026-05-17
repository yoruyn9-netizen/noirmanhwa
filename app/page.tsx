"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { fetchMangaList, Manga } from '@/lib/mangaApi';
import HeroSlider from '@/components/HeroSlider';
import PopularManhwaCarousel from '@/components/manga/PopularManhwaCarousel';
import MangaCard from '@/components/manga/MangaCard';
import GlobalChat from '@/components/chat/GlobalChat';
import HeaderProfile from '@/components/HeaderProfile';
import ThreeBodyLoader from '@/components/ui/ThreeBodyLoader';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { HomeSearchFilter } from '@/components/home/HomeSearchFilter';
import { Search, X, ChevronDown } from 'lucide-react';
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
  const [trending, setTrending] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('popular');

  const handleInitialFilters = useCallback((values: { search: string; selectedGenres: string[]; sortOption: string }) => {
    setSearch(values.search);
    setSelectedGenres(values.selectedGenres);
    setSortOption(values.sortOption);
  }, []);

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

        <Suspense fallback={<div className="min-h-[25vh] flex items-center justify-center"><ThreeBodyLoader /></div>}>
          <HomeSearchFilter
            genres={GENRES}
            sortOptions={SORT_OPTIONS}
            search={search}
            selectedGenres={selectedGenres}
            sortOption={sortOption}
            onSearchChange={setSearch}
            onToggleGenre={toggleGenre}
            onSortChange={setSortOption}
            onClearFilters={clearFilters}
            onInitialFilters={handleInitialFilters}
          />
        </Suspense>

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
