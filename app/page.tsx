"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMangaList, Manga } from '@/lib/mangaApi';
import HeroSlider from '@/components/HeroSlider';
import PopularManhwaCarousel from '@/components/manga/PopularManhwaCarousel';
import MangaCard from '@/components/manga/MangaCard';
import GlobalChat from '@/components/chat/GlobalChat';
import HeaderProfile from '@/components/HeaderProfile';
import ThreeBodyLoader from '@/components/ui/ThreeBodyLoader';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { Search } from 'lucide-react';

export default function Home() {
  const [trending, setTrending] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

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

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sanitized = searchTerm.trim();
    router.push(sanitized ? `/search?q=${encodeURIComponent(sanitized)}` : '/search');
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
    <ErrorBoundary
      fallback={
        <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-6">
          <Search className="w-12 h-12 text-neutral-800" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Something went wrong. Try refreshing.</p>
        </div>
      }
    >
      <div className="space-y-16 pb-40 max-w-[1600px] mx-auto px-4 relative overflow-x-hidden animate-in fade-in duration-1000">
        <header className="flex flex-col gap-6 pt-6 lg:flex-row lg:items-end lg:justify-between px-1">
          <HeaderProfile />
          <div className="text-right hidden sm:block">
            <p className="text-[8px] font-black text-neutral-600 uppercase tracking-[0.5em]">Noir Node: Alpha-42</p>
          </div>
        </header>

        <section className="rounded-[2.5rem] border border-white/10 bg-[#06060c]/80 p-6 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search manga titles..."
                className="w-full rounded-3xl border border-white/10 bg-[#0b0b12] py-4 pl-12 pr-4 text-sm font-black uppercase tracking-[0.15em] text-white outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>
            <button
              type="submit"
              className="rounded-3xl bg-accent px-6 py-4 text-[10px] font-black uppercase tracking-[0.35em] text-black transition hover:brightness-110"
            >
              Search
            </button>
          </form>
        </section>

        <section className="w-full overflow-x-hidden">
          <HeroSlider trending={trending} />
        </section>

        <section className="w-full overflow-x-hidden">
          <PopularManhwaCarousel />
        </section>

        <section className="space-y-10 overflow-x-hidden">
          <div className="space-y-2 px-1">
            <h2 className="text-xl font-black uppercase tracking-tighter text-white text-glow">Trending Manga</h2>
            <p className="text-[8px] font-bold text-neutral-600 uppercase tracking-[0.4em]">Browse the latest curated recommendations.</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-80 animate-pulse rounded-[2rem] bg-white/5 border border-white/10" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[2rem] border border-red-500/20 bg-red-500/5 p-10 text-center">
              <p className="text-sm font-black uppercase tracking-[0.4em] text-red-400">Unable to load trending manga</p>
              <p className="mt-3 text-[11px] text-neutral-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 rounded-2xl bg-red-500 px-6 py-3 text-[10px] font-black uppercase tracking-[0.35em] text-black hover:brightness-110 transition"
              >
                Reload
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {trending.map((manga) => (
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
