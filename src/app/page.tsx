import React from 'react';
import { mangaApi } from '@/lib/api';
import HeroSlider from '@/components/HeroSlider';
import MangaCard from '@/components/MangaCard';
import { ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  try {
    const [trendingRes, latestRes] = await Promise.all([
      mangaApi.getTrending(),
      mangaApi.getLatest()
    ]);

    const trending = trendingRes.data;
    const latest = latestRes.data;

    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <HeroSlider trending={trending} />

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-accent animate-pulse" /> LATEST UPDATES
            </h2>
            <Link href="/search" className="text-sm font-bold text-accent hover:underline flex items-center gap-1 group">
              View All <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {latest.map((manga) => (
              <MangaCard key={manga.id} manga={manga} isTrending={manga.attributes.status === 'ongoing'} />
            ))}
          </div>
        </section>

        <section className="bg-secondary/20 rounded-3xl p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl font-black tracking-tighter">Noir Curator AI</h2>
            <p className="text-muted-foreground max-w-xl font-medium">
              Stuck on what to read next? Our AI analyzes your history to suggest the perfect hidden gems from MangaDex's library of thousands.
            </p>
            <button className="px-6 py-3 bg-white text-black font-black rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2 shadow-xl">
              TRY AI CURATOR
            </button>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="p-4 bg-destructive/10 text-destructive rounded-full">
          <ChevronRight className="w-12 h-12 rotate-90" />
        </div>
        <h1 className="text-2xl font-bold">Failed to load content</h1>
        <p className="text-muted-foreground">The MangaDex API might be under heavy load or your connection is unstable.</p>
        <button className="px-6 py-2 bg-primary rounded-lg font-bold" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }
}