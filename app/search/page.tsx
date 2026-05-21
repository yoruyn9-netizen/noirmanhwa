"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search as SearchIcon, X, AlertCircle, Frown } from 'lucide-react';
import { MangaCard } from '@/components/manga/MangaCard';
import { Manga } from '@/lib/types';

const genres = [
  "Action", "Romance", "Comedy", "Drama", "Fantasy", "Isekai", 
  "Horror", "Mystery", "Sci-Fi", "Slice of Life", "Adventure", "Supernatural"
];

const SkeletonCard = () => (
  <div className="w-full animate-pulse">
    <div className="aspect-[2/3] w-full rounded-lg bg-white/10"></div>
    <div className="mt-2 h-4 w-3/4 rounded bg-white/10"></div>
    <div className="mt-1 h-3 w-1/2 rounded bg-white/10"></div>
  </div>
);

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const fetchResults = useCallback(async () => {
    if (!debouncedQuery && !selectedGenre) {
        setResults([]);
        setLoading(false);
        setSearchPerformed(false);
        return;
    }

    setLoading(true);
    setError(null);
    setSearchPerformed(true);

    const params = new URLSearchParams();
    if (debouncedQuery) params.append('q', debouncedQuery);
    if (selectedGenre) params.append('genre', selectedGenre);

    try {
      const res = await fetch(`/api/manga?${params.toString()}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to fetch results' }));
        throw new Error(errorData.message || 'An unknown error occurred');
      }
      const data = await res.json();
      setResults(data.results || data || []);
    } catch (e: any) {
      setError(e.message || 'An error occurred. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, selectedGenre]);
  
  // Fetch results when debounced query or genre changes
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenre(prev => prev === genre ? null : genre);
  };
  
  const resultText = useMemo(() => {
    if (!searchPerformed || loading) return null;
    let text = "Search results";
    if (debouncedQuery) text += ` for "${debouncedQuery}"`;
    if (selectedGenre) {
        if (debouncedQuery) text += ` in`; else text += ` for`;
        text += ` genre "${selectedGenre}"`;
    }
    return text;
  }, [debouncedQuery, selectedGenre, searchPerformed, loading]);


  return (
    <div className="bg-[#0a0a0f] text-neutral-200 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search manga titles..."
            className="w-full h-14 pl-14 pr-12 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 placeholder:text-neutral-500 text-base"
          />
          {query && (
              <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
              </button>
          )}
        </div>

        {/* Genre Filters */}
        <div>
            <div className="overflow-x-auto pb-4 -mb-4 no-scrollbar">
                <div className="flex space-x-3 w-max">
                {genres.map(genre => (
                    <button
                    key={genre}
                    onClick={() => handleGenreToggle(genre)}
                    className={`shrink-0 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all duration-200
                        ${selectedGenre === genre 
                        ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/20' 
                        : 'bg-white/5 border-white/10 text-neutral-400 hover:bg-white/10 hover:border-white/20'
                        }`}
                    >
                    {genre}
                    </button>
                ))}
                </div>
            </div>
        </div>

        {/* Results Section */}
        <div className="pt-4">
            {resultText && (
                 <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-lg font-semibold tracking-tight text-neutral-300">{resultText}</h2>
                    <span className="bg-purple-500/20 text-purple-300 text-xs font-bold px-2.5 py-0.5 rounded-full">{results.length}</span>
                 </div>
            )}
            
            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl bg-red-900/20 border border-red-500/20">
                    <AlertCircle className="w-12 h-12 text-red-500/80 mb-4" />
                    <p className="text-lg font-semibold text-red-400">{error}</p>
                    <button onClick={fetchResults} className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                        Retry
                    </button>
                </div>

            ) : searchPerformed && results.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl bg-white/5">
                    <Frown className="w-16 h-16 text-neutral-600 mb-4" />
                    <h3 className="text-xl font-bold text-neutral-300">No Manga Found</h3>
                    <p className="text-neutral-500 mt-2 max-w-xs">Try different keywords or clearing the genre filter.</p>
                </div>
            ) : searchPerformed ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                    {results.map(manga => (
                        <MangaCard key={`${manga.id}-${manga.source}`} manga={manga} />
                    ))}
                </div>
            ) : (
                // Initial state before any search is performed
                <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl bg-white/5">
                    <SearchIcon className="w-16 h-16 text-neutral-600 mb-4" />
                    <h3 className="text-xl font-bold text-neutral-300">Search for Manga</h3>
                    <p className="text-neutral-500 mt-2">Use the search bar and genre filters to begin.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
