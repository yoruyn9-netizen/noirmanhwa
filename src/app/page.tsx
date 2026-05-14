
import React from 'react';
import { mangaApi } from '@/lib/api';
import GenreSlider from '@/components/GenreSlider';
import HeroSlider from '@/components/HeroSlider';
import GlobalChat from '@/components/chat/GlobalChat';
import ContentTypeFilter from '@/components/manga/ContentTypeFilter';
import SortingOptions from '@/components/manga/SortingOptions';
import AdvancedFilters from '@/components/manga/AdvancedFilters';
import PopularManhwaCarousel from '@/components/manga/PopularManhwaCarousel';
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
    <div className="space-y-24 pb-40 max-w-[1600px] mx-auto px-6 relative">
      <section className="w-full pt-6">
        <HeroSlider trending={trending} />
      </section>

      <section className="w-full pt-4">
        <PopularManhwaCarousel />
      </section>

      <section className="space-y-12">
        <div className="space-y-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 px-2">
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-white text-glow">Database Grid</h2>
              <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-[0.4em] ml-1">Universal Signal Discovery</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
              <ContentTypeFilter />
              <SortingOptions />
            </div>
          </div>

          <div className="px-2">
             <AdvancedFilters />
          </div>
        </div>

        <MangaGrid />
      </section>

      <section className="space-y-12 border-t border-white/5 pt-20">
         <div className="space-y-2 px-2">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Categories</h2>
            <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] ml-1">Filter by signal genre</p>
          </div>
          <GenreSlider genres={genres} />
      </section>

      <GlobalChat previewMode={true} />
    </div>
  );
}
