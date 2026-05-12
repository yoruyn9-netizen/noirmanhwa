import React from 'react';
import { mangaApi } from '@/lib/api';
import MangaCard from '@/components/MangaCard';
import { Search as SearchIcon, SlidersHorizontal } from 'lucide-react';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; genre?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, genre } = await searchParams;
  const query = q || '';
  const genreId = genre || '';

  try {
    const resultsRes = await mangaApi.search({ 
      title: query, 
      limit: 24 
    });
    const results = resultsRes.data;

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter">Search Results</h1>
          <p className="text-muted-foreground font-medium">
            Showing results for <span className="text-accent">"{query || genreId || 'Latest'}"</span>
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              defaultValue={query}
              placeholder="Search another title..." 
              className="w-full bg-secondary/30 border border-white/10 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50 text-lg"
            />
          </div>
          <button className="p-4 bg-secondary/30 border border-white/10 rounded-2xl hover:bg-secondary transition-colors">
            <SlidersHorizontal className="w-6 h-6" />
          </button>
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
             <div className="bg-secondary/20 p-6 rounded-full">
               <SearchIcon className="w-12 h-12 text-muted-foreground opacity-20" />
             </div>
             <h3 className="text-xl font-bold">No results found</h3>
             <p className="text-muted-foreground">Try adjusting your keywords or using different filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {results.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold">Search temporarily unavailable</h1>
        <p className="text-muted-foreground mt-2">MangaDex API might be experiencing issues.</p>
      </div>
    );
  }
}
