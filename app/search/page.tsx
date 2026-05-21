"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search as SearchIcon, X, AlertCircle, Frown } from 'lucide-react';
import { MangaCard } from '@/components/manga/MangaCard';
import { Manga } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

const genres = [
  "Action", "Romance", "Comedy", "Drama", "Fantasy", "Isekai",
  "Horror", "Mystery", "Sci-Fi", "Slice of Life", "Adventure", "Supernatural"
];

const SkeletonCard = () => (
  <div className="w-full">
    <div className="aspect-[2/3] w-full rounded-lg bg-slate-800 animate-pulse"></div>
    <div className="mt-2 h-4 w-3/4 rounded bg-slate-800 animate-pulse"></div>
    <div className="mt-1 h-3 w-1/2 rounded bg-slate-800 animate-pulse"></div>
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

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
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
      const res = await fetch(`/api/manga/search?${params.toString()}`);
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

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleGenreToggle = (genre: string) => {
    setSelectedGenre(prev => prev === genre ? null : genre);
  };
  
  const resultText = useMemo(() => {
    if (!searchPerformed || loading) return null;
    if (debouncedQuery) return `Search results for "${debouncedQuery}"`;
    if (selectedGenre) return `Manga in "${selectedGenre}" genre`;
    return "Search results";
  }, [debouncedQuery, selectedGenre, searchPerformed, loading]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };


  return (
    <div className="bg-gradient-to-b from-[#101018] to-[#0a0a0f] text-neutral-200 min-h-screen font-sans">
      
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div className="text-center pt-8 pb-12" variants={itemVariants}>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                Explore & Discover
            </h1>
            <p className="mt-4 max-w-xl mx-auto text-lg text-neutral-400">
                Find your next favorite manga. Search by title or filter by genre.
            </p>
        </motion.div>

        <motion.div 
          className="sticky top-4 z-20 space-y-4 p-4 bg-slate-900/50 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl"
          variants={itemVariants}
        >
          {/* Search Bar */}
          <div className="relative">
            <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Omniscient Reader's Viewpoint..."
              className="w-full h-14 pl-14 pr-12 rounded-xl bg-black/20 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 placeholder:text-neutral-500 text-lg"
            />
            {query && (
                <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                </button>
            )}
          </div>

          {/* Genre Filters */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-900/50 to-transparent pointer-events-none z-10"></div>
            <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-900/50 to-transparent pointer-events-none z-10"></div>
            <div className="overflow-x-auto py-2 -mx-2 px-2 no-scrollbar">
                <div className="flex space-x-3 w-max px-6">
                {genres.map(genre => (
                    <button
                    key={genre}
                    onClick={() => handleGenreToggle(genre)}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all duration-200 ease-in-out transform hover:scale-105
                        ${selectedGenre === genre 
                        ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/30' 
                        : 'bg-black/20 border-white/10 text-neutral-400 hover:bg-white/10 hover:border-white/20 hover:text-neutral-200'
                        }`}
                    >
                    {genre}
                    </button>
                ))}
                </div>
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        <div className="pt-12">
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div 
                        key="loader"
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {[...Array(12)].map((_, i) => <SkeletonCard key={i} />)}
                    </motion.div>
                ) : error ? (
                    <motion.div 
                        key="error"
                        className="flex flex-col items-center justify-center text-center py-24 px-4"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <AlertCircle className="w-16 h-16 text-red-500/80 mb-6" />
                        <p className="text-xl font-semibold text-red-400">{error}</p>
                        <button onClick={fetchResults} className="mt-8 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg shadow-purple-500/20">
                            Retry
                        </button>
                    </motion.div>
                ) : searchPerformed && results.length === 0 ? (
                    <motion.div 
                        key="empty"
                        className="flex flex-col items-center justify-center text-center py-24 px-4"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <Frown className="w-20 h-20 text-neutral-600 mb-6" />
                        <h3 className="text-2xl font-bold text-neutral-300">No Manga Found</h3>
                        <p className="text-neutral-500 mt-2 max-w-sm">We couldn't find anything matching your search. Try different keywords or clearing the genre filter.</p>
                    </motion.div>
                ) : searchPerformed ? (
                    <motion.div
                        key="results"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8"
                    >
                        {resultText && (
                            <motion.div className="col-span-full mb-2" variants={itemVariants}>
                                <h2 className="flex items-center gap-3 text-xl font-semibold tracking-tight text-neutral-300">
                                    {resultText}
                                    <span className="bg-purple-500/20 text-purple-300 text-sm font-bold px-3 py-1 rounded-full">{results.length}</span>
                                </h2>
                            </motion.div>
                        )}
                        {results.map(manga => (
                            <motion.div variants={itemVariants} key={`${manga.id}-${manga.source}`}>
                                <MangaCard manga={manga} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                   <motion.div 
                        key="initial"
                        className="flex flex-col items-center justify-center text-center py-24 px-4"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ opacity: 0 }}
                   >
                        <SearchIcon className="w-20 h-20 text-neutral-600 mb-6" />
                        <h3 className="text-2xl font-bold text-neutral-300">Ready to Dive In?</h3>
                        <p className="text-neutral-500 mt-2 max-w-sm">Use the search bar and genre filters above to discover new worlds and exciting stories.</p>
                   </motion.div>
                )}
            </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
