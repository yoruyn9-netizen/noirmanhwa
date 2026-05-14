
import React from 'react';
import { mangaApi } from '@/lib/api';
import MangaCard from '@/components/MangaCard';
import GenreSlider from '@/components/GenreSlider';
import HeroSlider from '@/components/HeroSlider';
import GlobalChat from '@/components/chat/GlobalChat';
import SourceFilter from '@/components/manga/SourceFilter';
import MangaGrid from '@/components/manga/MangaGrid';

export default async function Home() {
  let trending: any[] = [];
  let genres: any[] = [];

  try {
    const [trendingRes, genresRes] = await Promise.all([
      mangaApi.getTrending(),
      mangaApi.getTags()
    ]);

    trending = trendingRes.data || [];
    genres = genresRes.data || [];
  } catch (err) {
    console.error('[Page Error]:', err);
  }

  return (
    <div className="space-y-16 pb-32 max-w-5xl mx-auto px-4 relative">
      <section className="w-full pt-4">
        <HeroSlider trending={trending} />
      </section>

      <section className="space-y-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
          <div className="space-y-1">
            <h2 className="text-[14px] font-black uppercase tracking-tighter text-white">Neural Stream</h2>
            <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Latest signal captures</p>
          </div>
          <SourceFilter />
        </div>

        <MangaGrid />
      </section>

      <section className="space-y-10 border-t border-white/5 pt-16">
         <div className="space-y-1 px-2">
            <h2 className="text-[14px] font-black uppercase tracking-tighter text-white">Signature Index</h2>
            <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Filter global manifold frequencies</p>
          </div>
          <GenreSlider genres={genres} />
      </section>

      <GlobalChat previewMode={true} />
    </div>
  );
}
