"use client";

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { fetchMangaList, Manga } from '@/lib/mangaApi';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  AlertCircle,
  RotateCcw,
  BookOpen,
  Sparkles
} from 'lucide-react';
import ThreeBodyLoader from '@/components/ui/ThreeBodyLoader';

// Components
import SearchBar from '@/components/search/SearchBar';
import GenreFilter from '@/components/search/GenreFilter';
import SortFilter from '@/components/search/SortFilter';
import SearchMangaGrid from '@/components/search/SearchMangaGrid';

// Genre options
const GENRES = [
  'Action', 'Romance', 'Comedy', 'Drama', 'Fantasy', 
  'Isekai', 'Horror', 'Mystery', 'Sci-Fi', 'Slice of Life',
  'Adventure', 'Martial Arts', 'School Life', 'Supernatural'
];

// Sort options
const SORT_OPTIONS = [
  { label: 'Popular', value: 'popular' },
  { label: 'Latest', value: 'latest' },
  { label: 'A-Z', value: 'az' },
  { label: 'Rating', value: 'rating' },
];

// Status options
const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  
  // States
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popular');
  const [statusFilter, setStatusFilter] = useState('all');
  const [results, setResults] = useState<Manga[]>([]);
  const [allManga, setAllManga] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch all manga on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMangaList();
        setAllManga(data);
      } catch (err) {
        setError('Failed to load manga. Please try again.');
        console.error('[Search]: Error fetching manga', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter and sort results
  useEffect(() => {
    let filtered = [...allManga];

    // Text search filter
    if (debouncedQuery) {
      const searchLower = debouncedQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(searchLower)
      );
    }

    // Genre filter
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(m => 
        selectedGenres.some(g => 
          m.genres.map(genre => genre.toLowerCase()).includes(g.toLowerCase())
        )
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => 
        m.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Sorting
    switch (sortBy) {
      case 'latest':
        filtered.sort((a, b) => {
          const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case 'az':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
      default:
        // Keep original order (assumed popular)
        break;
    }

    setResults(filtered);
  }, [allManga, debouncedQuery, selectedGenres, sortBy, statusFilter]);

  // Toggle genre selection
  const toggleGenre = useCallback((genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setSelectedGenres([]);
    setSortBy('popular');
    setStatusFilter('all');
  }, []);

  // Retry fetch
  const handleRetry = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMangaList();
      setAllManga(data);
    } catch (err) {
      setError('Failed to load manga. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const hasActiveFilters = query || selectedGenres.length > 0 || statusFilter !== 'all';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-1 px-1"
      >
        <h1 className="text-2xl md:text-3xl font-black tracking-tighter flex items-center gap-3 uppercase text-glow">
          <Sparkles className="w-6 h-6 text-purple-500" />
          Discover Manga
        </h1>
        <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-[0.3em] ml-1">
          Search through thousands of titles
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <SearchBar 
          value={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
          loading={loading && debouncedQuery !== ''}
        />
      </motion.div>

      {/* Genre Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GenreFilter 
          genres={GENRES}
          selectedGenres={selectedGenres}
          onToggle={toggleGenre}
        />
      </motion.div>

      {/* Sort & Status Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <SortFilter 
          sortOptions={SORT_OPTIONS}
          statusOptions={STATUS_OPTIONS}
          sortBy={sortBy}
          statusFilter={statusFilter}
          onSortChange={setSortBy}
          onStatusChange={setStatusFilter}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </motion.div>

      {/* Results Info */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="flex flex-wrap items-center justify-between gap-4 px-1"
        >
          <div className="flex items-center gap-3">
            {debouncedQuery && (
              <p className="text-[8px] uppercase tracking-widest text-neutral-600">
                Search results for: <span className="text-purple-400">&quot;{debouncedQuery}&quot;</span>
              </p>
            )}
          </div>
          <div className="rounded-full bg-white/5 border border-white/10 px-3 py-1.5 backdrop-blur-md">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
              {results.length} manga found
            </span>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Loading State */}
        {loading && allManga.length === 0 && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 space-y-6"
          >
            <ThreeBodyLoader />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 animate-pulse">
              Scanning Library...
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mx-2"
          >
            <div className="rounded-3xl border border-red-500/20 bg-red-500/5 backdrop-blur-md p-8 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-base font-black uppercase tracking-tight text-red-400">
                  Connection Error
                </h3>
                <p className="text-xs text-neutral-500">
                  {error}
                </p>
              </div>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Connection
              </button>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && results.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mx-2"
          >
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] backdrop-blur-md p-12 text-center space-y-6">
              <BookOpen className="w-16 h-16 text-neutral-800 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-black uppercase tracking-tight">
                  No Manga Found
                </h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Try different keywords or adjust your filters to discover more titles.
                </p>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-black uppercase tracking-widest hover:bg-purple-500/20 transition-all"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Results Grid */}
        {!loading && !error && results.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SearchMangaGrid manga={results} />
          </motion.div>
        )}

        {/* Loading skeleton when filtering */}
        {loading && allManga.length > 0 && (
          <motion.div
            key="filtering"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SearchMangaGrid manga={[]} loading />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <ThreeBodyLoader />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 animate-pulse">
          Loading Search...
        </p>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
